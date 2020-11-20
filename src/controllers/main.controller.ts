import { Request, Response, Router } from 'express';
import Controller from '@interfaces/controller.Interface';
import Usuario from '@models/usuario';
import testeValidator from '@validators/testeValidator';
import verifyHandlerMiddleware from '@middlewares/verifiyHandlerMiddleware';
import authorize from '@middlewares/handlerAuthorizeMiddleware';
import utils from '@utils/utils';
import TipoUsuario from '@enum/TipoUsuario';

class MainController implements Controller {
  public path = '/main';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`,
      testeValidator.test(),
      verifyHandlerMiddleware,
      this.getMainRouter
    );
    this.router.get(`${this.path}/token`,
      this.getMainRouter
    );
    this.router.get(`${this.path}/token/test`,
      authorize([
        TipoUsuario.ADMIN
      ]),
      this.getMainRouter
    );
  }

  private getMainRouter(request: Request, response: Response) {
    let user = new Usuario({ nome: "ismael", email: "ismael@ismae.com" });
    user.save()
    utils.gerarToken('ismael@ismae.com')
    response.json(utils.gerarToken('ismael@ismae.com'));
  }
}
export default MainController;
