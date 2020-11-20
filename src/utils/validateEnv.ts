import { cleanEnv, port, str, num } from 'envalid';

function validateEnv() {
  cleanEnv(process.env, {
    JWT_SECRET: str(),
    API_SECRET: str(),
    SERVER_URL: str(),
    SERVER_PORT: port(),
    DB_HOST: str(),
    DB_PORT: num(),
    DB_USER: str(),
    DB_DIALECT: str(),
    DB_PASS: str(),
    DB_NAME: str(),
  });
}

export default validateEnv;
