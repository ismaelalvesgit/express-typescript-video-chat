import 'dotenv/config';
import "reflect-metadata";
import validateEnv from './utils/validateEnv';
import App from './config/server';
import MainController from './controllers/main.controller';
import SystemController from './controllers/system.controller';
import UsuarioController from './controllers/usuario.controller';

validateEnv();
const app = new App([
  new MainController(),
  new SystemController(),
  new UsuarioController(),
]);

app.startup().then(()=>{
  require('./sockets')
});

export default app;