/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Class root da aplicação
 * @Callback Instance class App 
*/

import 'dotenv/config';
import 'reflect-metadata';
import './CronJob';
import validateEnv from './utils/validateEnv';
import App from './config/server';
import AuthController from './controllers/auth.controller';
import SystemController from './controllers/system.controller';
import UsuarioController from './controllers/usuario.controller';

validateEnv();
const app = new App([
  new AuthController(),
  new SystemController(),
  new UsuarioController(),
]);

app.startup().then(() => {
  require('./sockets')
});

export default app;