import { Router } from 'express';
import Controller from '@interfaces/controller.Interface';
import speedTest from 'speedtest-net'
import mail from '@utils/mail';
import Usuario from '@models/usuario';
import { getConnection } from 'typeorm';

class MainController implements Controller{
  public path = '/system';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/healthcheck`, 
      (req, res, next)=>{
        let data:any = {
          process: process.pid,
          uptime: process.uptime(),
          dataBase:{
            status: getConnection().isConnected ? "Connectado": "Fora do ar",
          }
        }
        const test = speedTest({acceptLicense: true})
        test.then((network)=>{
          data.server = {
            ping: network.ping,
            download: network.download,
            upload: network.upload
          }
          res.json(data)
        }).catch((error)=>{
          console.log(error)
          mail.notificacaoErro(JSON.stringify(error), new Usuario(), "")
          res.status(503).json({nome: "system", mensagem: "serviço indisponivel :("})
        })   
      }
    );
  }

}
export default MainController;
