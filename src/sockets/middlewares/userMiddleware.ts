import env from "@config/env"
import Usuario from "@models/usuario"
import jsonwebtoken from 'jsonwebtoken'

export default function user (socket:SocketIO.Socket, next:any){
    const token = socket.handshake.query.authorization
    if(token !== undefined){
        try {
            const decode:any = jsonwebtoken.verify(token, env.security.secret)
            if(Date.now() >= decode.exp * 1000){
                return next({name:'Forbidden', mensagem: 'Token está expirado'})
            }
            Usuario.findOne({where:{email:decode.valor}}).then((db)=>{
                if(db != null){
                    socket.user = db //atribuido o usuário a requisição
                    next()
                }else{
                    return next({name:'NotFound', mensagem: 'Documento não  encontrado'})
                }
            }).catch(next)  
        } catch (error) {
            return next({name:'Forbidden', mensagem: 'Token inválido ou incorreto'})
        }
    }else{
        socket.user = new Usuario()
        return next()
    }
}