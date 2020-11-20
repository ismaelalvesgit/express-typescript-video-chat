//@Author ismael alves
import Usuario from '../../src/models/usuario'
import request  from 'supertest'

class UsuarioTest{

    async login(usuarioData){
        return request(address).post('/login').send({
            email: usuarioData.email,
            senha: usuarioData.senha
        })
    }

    async loginCreate(tipoUsuario, usuarioData){
        await new Usuario({tipoUsuario: tipoUsuario,...usuarioData}).save()
        return request(address).post('/login').send({
            email: usuarioData.email,
            senha: usuarioData.senha
        })
    }

}
export default new UsuarioTest()