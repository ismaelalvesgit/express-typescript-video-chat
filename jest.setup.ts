//@Author ismael alves
import dotenv from 'dotenv';
import "reflect-metadata";
import validateEnv from './src/utils/validateEnv';
import App from './src/config/server';
import MainController from './src/controllers/main.controller';
import SystemController from './src/controllers/system.controller';
import UsuarioController from './src/controllers/usuario.controller';

dotenv.config({path: './env.test'})
validateEnv();
const app = new App([
    new MainController(),
    new SystemController(),
    new UsuarioController(),
]);
app.startup();


console.log(process.env.SERVER_URL)
console.log(process.env.SERVER_PORT)

beforeAll( async()=>{

})

afterAll( async()=>{
    
})

