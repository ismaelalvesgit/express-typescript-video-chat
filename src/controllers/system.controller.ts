import { Request, Response, Router } from 'express';
import Controller from '@interfaces/controller.Interface';

class MainController  implements Controller{
  public path = '/system';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/healthcheck`, this.getMainRouter);
  }

  private getMainRouter(request: Request, response: Response) {
    response.send('teste');
  }
}
export default MainController;
