# Express Typescript Video Chat
Este projeto foi gerado com [Express.js](https://expressjs.com/pt-br/) versão 4.17.1.

Ferramentas utlizadas:

* Bcrypt
* Body Parser
* Class Validator
* Compression
* Connect-multiparty
* Cors
* Date Fns
* Dotenv
* Ejs
* Envalid
* Express
* Express Validator
* Frameguard
* Googleapis
* Helmet
* Helmet Csp
* Hide Powered By
* Hsts
* Husky
* Ienoopen
* Jsonwebtoken
* Jest
* Morgan
* Mv
* NodeJS
* Nodemon
* Nodemailer
* Path
* Pg
* Prom Client
* Rate Limiter Flexible
* Reflect Metadata
* Response Time
* Rimraf
* Shelljs
* Socket.io
* Speedtest Net
* Typeorm
* Ts-jest
* Ts-node
* Tsconfig Paths
* Tslint
* Tslint-config-airbnb
* Typescript
* Uuid
* X-xss Protection

## Screenshots

app view:

<img src="https://raw.githubusercontent.com/ismaelalvesgit/express-typescript-video-chat/master/app.png" width="800">

## Local Enviroment

### Setup

#### 1) Instalação de dependencias
1º download das dependeicas do projeto
``` sh
npm install
```
#### 2) Iniciar dependencias do ambiente backend
``` sh
  docker-compose up -d
```
#### 3) Iniciar o ambiente de desenvolvimento
``` sh
 npm run dev

 # Navege para `http://localhost:3000`. O aplicativo será recarregado automaticamente se você alterar qualquer um dos arquivos de origem.
```
#### 4) Iniciar o servidor de testes
``` sh
npm test

# Você tambem pode abri o modo de esculta
npm test:watch
```

### Build Docker
Rode `./deploy-docker.sh` para SO linux ou `./deploy-docker.bat` para SO windos, esses arquivos vão gerar um nova imagem docker do projeto e mandalo para o repositorio configurado,
o arquivo de configuração da imagem está  localizado em `Dockerfile`.

### Developer Debug
Debug pelo vs code use a tecla `F5` copie e cole no `launch.json` as configurações abaixo.
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Server",
      "port": 3000,
      "restart": true,
      "protocol": "inspector"
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Jest",
      "port": 3000,
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

### Testes
Este projeto foi projeto com base no desenvolvimento [TDD](https://www.vector.com/int/en/lp/us/test-driven-development/?gclid=Cj0KCQiA_rfvBRCPARIsANlV66Nlrg_ef3hoOGlt4ZVr_Uzm-ZRGHjMYMFNZBa_NpIVgQy2XF9IAJY4aAnN1EALw_wcB) 
foram utiladas as libs [jest](https://jestjs.io/docs/en/getting-started) versão 24.9.0 e 
[supertest](https://www.npmjs.com/package/supertest) versão 4.0.2, [husky](https://www.npmjs.com/package/husky) versão 3.1.0
para auto teste quando o projeto for subido para o repositorio do git.

### Development TDD
Para executar os testes automatizados rode `npm test` para iniciar o test criados no diretorio `test/`
Caso queria entrar no modo de desenvolvimento seguro rode `npm run test:watch`

### Logs
O projeto foi configurado para gerar e armazena logs de acesso e de erros organizados por dia
os logs estão localizados em `logs/`, tambem sera enviado um email para o administrador com
o id da requisição e o erro gerado.

### DevOps
O projeto foi configurado para fazer [CICD](https://medium.com/@nirespire/what-is-cicd-concepts-in-continuous-integration-and-deployment-4fe3f6625007) integrado com
[Jenkinis](https://www.jenkins.io/) arquivo de configuração localizado em `Jenkinisfile`.


### Extra

## Arquivos custom de @types
Foi necessario no projeto custumizar os tipos de alguas libs utilizadas no projeto os arquivos referente a custumização estão localizados em `./@types/**.ts`

## Dependencias do projeto
O projeto necessita que o SO onde o projeto esteja rodando contenha as ferramentas [python](https://www.python.org/), [postgres SQL](https://www.postgresql.org/), [nodejs](https://nodejs.org/en/)


## Healthcheck
Foi criado um serviço de analise de saúde do sistema analizando a conexão com o banco de dados e teste em network
o serviço foi feito para ser executado em cada 12:00 HS de funcionamento do sistema, caso queira executalo manualmente navege para `http://localhost:3000/system/healthcheck`



## Variaveis de ambiente
O projeto foi pre-configurado com algumas variaveis de ambiente que está localizado em `config/environments.js`.
- ENVIROMENT = '(STRING) - `DEV | TEST | PROD` Caso essa variavel esteja presente no ambiente, A API por padrão ficara limitada a 100(duzentos) requisições por um periodo de 15(quinze) minutos'
- SERVER_URL = '(STRING) Url da API exemplo `http://localhost:3000` ou `http://exemple.com/api` obs sem o barra no final'
- SERVER_PORT = '(NUMBER) Porta da API exemplo `3000` ou `8080` obs por padrao usará porta 3000'
- SERVER_MODE = '(STRING) Modo de como a API vai utilizar a CPU do SO valores `single | cluster`'
- DB_HOST = '(STRING) Url do banco de dados exemplo `31.220.49.94`'
- DB_PORT = '(NUMBER) Porta do banco de dados exemplo `27017` ou `27018` obs por padrao usará porta 27017'
- DB_USER = '(STRING) Usuário do do banco de dados exemplo `root` obs por padrao usará o usuário root'
- DB_PASS = '(STRING) Senha da base de dados'
- DB_DATABASE = '(STRING) Nome da base de dados'
- DB_DIALECT = '(STRING) Tipo de base de dados'
- SALT_ROUNDS = '(NUMBER) Nivel de rotação da chave de criptografia. obs por padrão 10(dez)'
- API_SECRET = '(STRING) Chave de criptografia'
- EMAIL_ENV = '(STRING) Ambiente de envio de email. obs por padrão Oauth2. valores `SMTP | OAuth2`'
- EMAIL_HOST = '(STRING) Host do servidor de email'
- EMAIL_PORT = '(NUMBER) Porta do servidor de email'
- EMAIL_SECURE = '(BOOL) Secure do servidor de email'
- EMAIL_USER = '(STRING) Usuário do servidor de email'
- EMAIL_PASSWORD = '(STRING) Senha do servidor de email'
- EMAIL_OAUTH2_CLIENTID = '(STRING) Client Id do usuário Oauht2'
- EMAIL_OAUTH2_CLIENTSECRET = '(STRING) Client Secret do usuário Oauht2'
- EMAIL_OAUTH2_REFRESHTOKEN = '(STRING) Refresh Token do Oauht2'
- EMAIL_OAUTH2_REDIRECT_URI = '(STRING) Redirect Uri do Oauth2'
- EMAIL_ADMIN1 = '(STRING) Email do admin 01'
- EMAIL_ADMIN2 = '(STRING) Email do admin 02'

## Suporte para upload de aquivos
O projeto foi configurado para suporta o upload dos arquivos com extensão.

- jpeg
- png
- ppt
- rar
- mp4
- xlsx
- doc
- log
- jpg
- txt
- zip
- docx
- pps
- xls
- mp3
- pdf
- gif
- pxd
- tiff
- bmp
- icon