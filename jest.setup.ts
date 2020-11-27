//@Author ismael alves
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'})
import "reflect-metadata";
import validateEnv from './src/utils/validateEnv';
import App from './src/config/server';
import AuthController from './src/controllers/auth.controller';
import SystemController from './src/controllers/system.controller';
import UsuarioController from './src/controllers/usuario.controller';
import env from './src/config/env';
import { createConnection, getConnection } from 'typeorm';
import path from 'path';
import UtilsSuport from './test/suport/utils.suport'

validateEnv();
const app = new App([
  new AuthController(),
  new SystemController(),
  new UsuarioController(),
]);

beforeAll( async(done)=>{
    app.server.listen(process.env.SERVER_PORT, ()=>{
        createConnection({
            type: "postgres",
            host: env.db.host,
            port: 5432,
            username: env.db.user,
            password: env.db.pass,
            database: env.db.database,
            entities: [
                path.join(__dirname, 'src/models/*.ts' )
            ],
            synchronize: true,
            // logging: true
        }).then(()=>{
            done()
        }).catch((e)=>console.log(e))
    })
})

afterAll( async(done)=>{
    //delete folders
    UtilsSuport.deleteFolder([
        './src/public/uploads/usuario',
    ])
    getConnection().close()
    return app.server && app.server.close(done);
})

