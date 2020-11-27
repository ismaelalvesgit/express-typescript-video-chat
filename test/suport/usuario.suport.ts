//@Author ismael alves
import Usuario from '../../src/models/usuario'
import TipoUsuario from '../../src/enum/TipoUsuario'
import request  from 'supertest'
const address = process.env.SERVER_URL

class UsuarioSuport{

    async login(usuarioData:any){
        return request(address).post('/auth/email/login').send({
            email: usuarioData.email,
            senha: usuarioData.senha
        })
    }

    async loginCreate(tipoUsuario:TipoUsuario, usuarioData:any){
        await new Usuario({tipoUsuario: tipoUsuario, ...usuarioData}).save()
        return request(address).post('/auth/email/login').send({
            email: usuarioData.email,
            senha: usuarioData.senha
        })
    }

    createUser(tipoUsuario:TipoUsuario, usuarioData:any){
        return new Usuario({tipoUsuario: tipoUsuario, ...usuarioData}).save()
    }

}
export default new UsuarioSuport()