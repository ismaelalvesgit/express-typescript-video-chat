import express from 'express';
import http, { Server } from 'http';
import env from './env';
import Controller from '@interfaces/controller.Interface';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import { format } from 'date-fns';
import utils from '@utils/utils';
import { requestCounters, responseCounters, injectMetricsRoute, startCollection } from '@utils/metric';
import { createConnection, getConnection, getManager } from "typeorm";
import path from 'path';
import { cpus, CpuInfo } from 'os'
import cluster from 'cluster'
import compression from 'compression'
import helmet from 'helmet'
import csp from 'helmet-csp'
import hidePoweredBy from 'hide-powered-by'
import multiparty from 'connect-multiparty'
import hsts from 'hsts'
import ienoopen from 'ienoopen'
import frameguard from 'frameguard'
import xssFilter from 'x-xss-protection'
import throttlingResquestMiddleware from '@middlewares/throttlingResquestMiddleware'
import assignResquestMiddleware from '@middlewares/assignResquestMiddleware'
import handlerErroMiddleware from '@middlewares/handlerErroMiddleware'
import socketIo from 'socket.io';
const SocketIO = require('socket.io')

class App {

    public server: Server;
    public app: express.Application;
    public cpus: CpuInfo[]
    public retryConnectionDatabase:number = 1
    public io: socketIo.Server;

    constructor(controllers: Controller[]) {
        this.cpus = cpus();
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = SocketIO(this.server, {
            origins: "*:*",
        });
        this.io.on('connection', (socket)=> console.log(socket))
        // engine view
        this.app.set('view engine', 'ejs');
        this.app.set('views', './src/views');
        // assets
        this.app.use(express.static('./src/public'));
        // default folders
        utils.defaultFolder('./logs');
        // metrics endpoint
        injectMetricsRoute(this.app)
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
        startCollection()
    }

    public startup(mode?:string):Promise<string> {
       return new Promise((resolve, reject)=>{
            this.connectToTheDatabase()
            mode = env.server.mode || mode;
            if(mode && mode != "single"){
                if(cluster.isMaster ){
                    this.cpus.forEach(() => cluster.fork())
                    cluster.on('exit', ()=>{
                        cluster.fork()
                    })
                }else{
                    this.server.listen(env.server.port, () => {
                        console.log('servidor online', env.server.url);
                    });
                }
                resolve(env.server.url)
            }else{
                this.server.listen(env.server.port, () => {
                    console.log('servidor online', env.server.url);
                    resolve(env.server.url)
                });
            }
       })
    }

    public shutdown() {
        getConnection().close()
        return this.server.close();
    }

    public getServer() {
        return this.server;
    }

    private getConnectionDatabase() {
        return createConnection({
            type: "postgres",
            host: env.db.host,
            port: 5432,
            username: env.db.user,
            password: env.db.pass,
            database: env.db.database,
            entities: [
                path.join(__dirname, '..', 'models/*.ts' )
            ],
            synchronize: true,
            // logging: true
        })
    }

    private connectToTheDatabase(){
        this.getConnectionDatabase().then(()=>{
            this.retryConnectionDatabase = 0
            console.log("Conexão com base de dados estabelecida...")
        }).catch((err) => {
            console.log(err)
            console.log(`Tentando se reconnetar com a base de dados tentativa ${this.retryConnectionDatabase}º...`)
            if(this.retryConnectionDatabase < 11){
                setTimeout(()=>{
                    if(!getConnection().isConnected){
                        this.connectToTheDatabase()
                    }
                }, 1500)
            }else{
                console.log("Aplicação finalizada pois não obteve conexão com base de dados...")
                process.exit(0)
            }
            this.retryConnectionDatabase++
        })
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cors());
        this.app.use(multiparty());
        this.app.use(compression());
        this.app.use(helmet())
        // this.app.use(csp({
        //     directives: {
        //         fontSrc: ["'self'", 'fonts.com'],
        //         sandbox: ['allow-forms', 'allow-scripts'],
        //         reportUri: '/report-violation',
        //         objectSrc: ["'none'"],
        //         upgradeInsecureRequests: [],
        //     },
        //     reportOnly: false,
        // }))
        this.app.use(hidePoweredBy())
        this.app.use(hsts({
            maxAge: 31536000,
            includeSubDomains: true, 
            preload: true
        }))
        this.app.use(ienoopen())
        this.app.use(frameguard())
        this.app.use(xssFilter())
        this.app.use(assignResquestMiddleware)
        this.app.use(responseCounters)
        this.app.use(requestCounters)
        if(env.enviroment != "development" || "test"){
            this.app.use(throttlingResquestMiddleware)
        }
        this.app.use((req, res, next) => {
            if (this.retryConnectionDatabase > 0) {
                res.status(502).json({nome: "Conection", mensagem: "Falha ao iniciar base de dados"})
            }else{
                next()
            }
        })
        // loggers
        morgan.token('id', function getId(req: any) {
            return req.id;
        });
        morgan.token('user', function getUser(req: any) {
            return req.user ? req.user._id : undefined;
        });
        this.app.use(morgan(':id :user :remote-addr - :remote-user [:date[web]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
            skip(req, res) { return res.statusCode < 404; },
            stream: fs.createWriteStream(`./logs/erros-${format(new Date(), 'dd-MM-yyyy')}.log`, { flags: 'a' }),
        }));
        this.app.use(morgan(':id :user :remote-addr ":method :url HTTP/:http-version" :response-time', {
            skip(req, res) { return res.statusCode > 400; },
            stream: fs.createWriteStream(`./logs/access-${format(new Date(), 'dd-MM-yyyy')}.log`, { flags: 'a' }),
        }));
    }

    private initializeErrorHandling() {
        this.app.use(handlerErroMiddleware);
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });

        // Inicial
        this.app.get('/', (req, resp) => {
            resp.json(`API VERSÃO 0.1 ON ${env.enviroment}`);
        });

        // NotFound
        this.app.get('*', (req, resp) => {
            resp.status(404).json([{ nome: 'NotFound', mensagem: 'rota não foi encontrada :(' }]);
        });
    }

}

export default App;