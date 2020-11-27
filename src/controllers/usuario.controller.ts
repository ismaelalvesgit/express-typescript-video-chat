import { Router } from 'express';
import Controller from '@interfaces/controller.Interface';
import utils from '@utils/utils';
import Usuario from '@models/usuario';
import controllerBase from '@utils/controllerBase';
import mail from '@utils/mail'
import Upload from '@models/upload';
import authorize from '@middlewares/handlerAuthorizeMiddleware';
import usuarioValidator from '@validators/usuarioValidator';
import verifiyHandlerMiddleware from '@middlewares/verifiyHandlerMiddleware';

class UsuarioController implements Controller {

  public path = '/usuario';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Metodo que realiza os cadastro de usuários
    this.router.post(`${this.path}`,
      usuarioValidator.usuarioCadastro(),
      verifiyHandlerMiddleware,
      controllerBase.save({
        model: Usuario,
        beforeSave:  async (data)=>{
          if(data.senha){
            data.senha = await utils.encrypt(data.senha)
          }
          return data
        },
        excludeFields: [
          "reset"
        ],
        afterSave: (data, req)=>{
          mail.bemVindo(data)
        },
        file: {
          files: [
            {
              field: "foto",
              path: "usuario/"
            }
          ],
          typeUpload: 'single'
        }
      })
    );

    // Metodo que realiza os atualização de usuários
    this.router.put(`${this.path}`,
      authorize(),  
      usuarioValidator.usuarioEditar(),
      verifiyHandlerMiddleware,
      controllerBase.update({
        model: Usuario,
        beforeUpdate: async (data)=>{
          if(data.senha){
            data.senha = await utils.encrypt(data.senha)
          }
          return data
        },
        excludeFields: [
          "reset"
        ],
        params: [
          {
            user: true,
            path: "id"
          }
        ],
        file: {
          files: [
            {
              field: "foto",
              path: "usuario/"
            }
          ],
          typeUpload: 'single'
        }
      })
    );

    // Metodo que realiza os deletação de usuários
    this.router.delete(`${this.path}`, 
      authorize(),
      controllerBase.delete({
        model: Usuario,
        beforeDelete: async(data)=>{
          await Upload.delete({idObjeto: data.id})
          return data
        },
        afterDelete: (data, req)=>{
          // Enviar email de deletação de conta
        },
        params: [
          {
            user: true,
            path: "id"
          }
        ],
        files: [
          {
            path: "usuario/"
          }
        ],
      })
    );

    // Metodo que realiza os deletação de usuários
    this.router.get(`${this.path}/:id`, 
      controllerBase.findById({
        model: Usuario,
        excludeFields: [
          "reset"
        ]
      })
    );

    // Metodo que realiza os deletação de usuários
    this.router.get(`${this.path}`, 
      controllerBase.findAll({
        model: Usuario,
        excludeFields: [
          "reset"
        ]
      })
    );
  }

}
export default UsuarioController;
