/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Interface utilizado principalmente na Class localizado em ´@/controllers/*.ts´
 * @Callback exportação da interface Controller
*/
import { Router } from 'express';

interface Controller {
  path: string;
  router: Router;
}

export default Controller;
