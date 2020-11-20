const  url = process.env.SERVER_URL  || 'http://localhost:3000'
const userDB = process.env.DB_USER || 'admin'
const passDB = process.env.DB_PASS || 'admin'
const hostDB = process.env.DB_HOST || 'localhost'
const portDB = process.env.DB_PORT || 5432
const databaseDB = process.env.DB_DATABASE|| 'teste'
const dialectDB = process.env.DB_DIALECT|| 'postgres'

export default {
  enviroment: process.env.NODE_ENV || 'DEV',
  server: { 
    port: process.env.SERVER_PORT || 3000,
    url: url,
    mode: process.env.SERVER_MODE
  },
  files:{
    default: url+'/uploads/system/default.png',
    user: url+'/uploads/system/user.png',
    uploadsPath: './src/public/uploads/',
    uploadsUrl: url+'/uploads/'
  },
  db: {
    url: `postgres://${userDB}:${passDB}@${hostDB}:${portDB}/${databaseDB}`,
    user: userDB,
    pass: passDB,
    host: hostDB,
    port: portDB,
    database: databaseDB,
    dialect: dialectDB
  },
  security: {
    saltRounds: process.env.SALT_ROUNDS || 10,
    secret: process.env.API_SECRET || 'chat2020',
  },
  email:{
    enviroment: process.env.EMAIL_ENV || 'SMTP', //  SMTP || OAuth2
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT ||  465,
    secure: process.env.EMAIL_SECURE || true,
    notificator: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
    OAuth2:{
      clientId:  process.env.EMAIL_OAUTH2_CLIENTID || '',
      clientSecret: process.env.EMAIL_OAUTH2_CLIENTSECRET || '',
      refreshToken: process.env.EMAIL_OAUTH2_REFRESHTOKEN || '',
      redirectUri: process.env.EMAIL_OAUTH2_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
    },
    admin1: process.env.EMAIL_ADMIN1 || '',
    admin2: process.env.EMAIL_ADMIN2 || '',
  },
}
