import TipoUsuario from '@enum/TipoUsuario'
import { RequestHandler } from 'express'
import jsonwebtoken from 'jsonwebtoken'
import env from '@config/env'
import Usuario from '@models/usuario'

export default function authorize(profiles: Array<TipoUsuario> = []): RequestHandler {
    return (req, res, next) => {
        if(req.headers.authorization !== undefined) {
            const token = req.headers.authorization
            try {
                const decode:any = jsonwebtoken.verify(token, env.security.secret)
                if(Date.now() >= decode.exp * 1000){next({name:'Forbidden', mensagem: 'Token está expirado'})}
                Usuario.findOne({where:{email:decode.valor}}).then((db:Usuario | undefined) =>{
                    if(db){
                        req.user = db.toJson()
                        if(profiles[0] == undefined){
                            next()
                        }else if(profiles.some(profile => db.tipoUsuario.toString().indexOf(profile.toString()) != -1)){

                        }else{
                            next({name:'Unauthorized'})
                        }
                    }else{
                        next({name:'Forbidden', mensagem: 'Token inválido ou incorreto'})
                    }
                }).catch(next)
            } catch (error) {
                next({name:'Forbidden', mensagem: 'Token inválido ou incorreto'})
            }
        }else{
            next({name:'Forbidden', mensagem: 'Token não encontrado'})
        }
    }
}