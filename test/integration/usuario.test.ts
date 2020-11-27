import request  from 'supertest'
const address = process.env.SERVER_URL
import usuarioData from '../fixtures/usuarioData'
import UsuarioSuport from '../suport/usuario.suport'
import Usuario from '../../src/models/usuario'
import TipoUsuario from '../../src/enum/TipoUsuario'

// Antes de todo teste
afterEach( async()=>{
    const promises = usuarioData.map(async (element) => 
        await Usuario.delete({email: element.email})
    ) 
    await Promise.all(promises);
})

describe('Fluxo de tratamento de erros em usuário', () => {

    test('get - pegar usuário por id', async() => {
        return request(address).get(`/usuario/1000000`)
        .then(response=>{
            expect(response.status).toBe(404)
            expect(response.body[0]).toHaveProperty('nome')
            expect(response.body[0]).toHaveProperty('mensagem')
        }).catch(fail)
    })

    test('delete - deletar usuario sem token', async()=>{
        return request(address).del(`/usuario`)
        .send({
            ...usuarioData[1]
        }).then((response)=>{
            expect(response.status).toBe(403)
            expect(response.body[0]).toHaveProperty('nome')
            expect(response.body[0]).toHaveProperty('mensagem')
            expect(response.body[0].mensagem).toBe('Token não encontrado')
        })
    })

    test('delete - deletar usuario com token inválido', async()=>{
        return request(address).del(`/usuario`)
        .set('authorization', 'teste')
        .send({
            ...usuarioData[1]
        }).then((response)=>{
            expect(response.status).toBe(403)
            expect(response.body[0]).toHaveProperty('nome')
            expect(response.body[0]).toHaveProperty('mensagem')
            expect(response.body[0].mensagem).toBe('Token inválido ou incorreto')
        })
    })

    test('put - atualizar usuario sem token', async()=>{ 
        return request(address).put(`/usuario`)
        .then((response)=>{
            expect(response.status).toBe(403)
            expect(response.body[0]).toHaveProperty('nome')
            expect(response.body[0]).toHaveProperty('mensagem')
            expect(response.body[0].mensagem).toBe('Token não encontrado')
        })
    })
    
    test('put - atualizar usuario com token inválido', async()=>{ 
        return request(address).put(`/usuario`)
        .set('authorization', 'teste')
        .then((response)=>{
            expect(response.status).toBe(403)
            expect(response.body[0]).toHaveProperty('nome')
            expect(response.body[0]).toHaveProperty('mensagem')
            expect(response.body[0].mensagem).toBe('Token inválido ou incorreto')
        })
    })

    test('post - cadastra usuario sem os dados requiridos', async() => {
        return request(address).post('/usuario')
        .then(response=>{
            expect(response.status).toBe(400)
            expect(response.body[0]).toHaveProperty('nome')
            expect(response.body[0]).toHaveProperty('mensagem')
        }).catch(fail)
    })
    
    test('post - cadastra usuário com dados inválidos', async() => {
        return request(address).post('/usuario')
        .send({
            tipoUsuario: 'ADMIN'
        })
        .then(response=>{
            expect(response.status).toBe(400)
            expect(response.body[0]).toHaveProperty('nome')
            expect(response.body[0]).toHaveProperty('mensagem')
        }).catch(fail)
    })

})

describe('Fluxo normal de cadastros de usuário', () => {

    test('get - pegar usuário por id', async() => {
        // Montando o cenario
        let idUsuario:number
        const cenario = [
            await  UsuarioSuport.createUser(TipoUsuario.ADMIN, usuarioData[1]).then((doc)=>{
                idUsuario = doc.id
            }),
        ]
        await Promise.all(cenario)

        // Teste
        return request(address).get(`/usuario/${idUsuario}`)
        .then(response=>{
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('_links')
            expect(response.body).toBeTruthy()
            expect(response.body).not.toHaveProperty('senha')
        }).catch(fail)
    })

    test('get - lista de todos os usuários', async() => {
        // Montando o cenario
        const cenario = [
            UsuarioSuport.createUser(TipoUsuario.ADMIN, usuarioData[1]),
        ]
        await Promise.all(cenario)

        // Teste
        return request(address).get(`/usuario`)
        .then(response=>{
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('_links')
            expect(response.body).toHaveProperty('items')
            expect(response.body.items[0]).not.toHaveProperty('senha')
            expect(response.body.items).toBeTruthy();
        }).catch(fail)
    })

    test('delete - deletar usuário', async()=>{
        // Montando o cenario
        let token:string = ""
        const cenario = [
            await UsuarioSuport.loginCreate(TipoUsuario.CLIENT, usuarioData[0]).then((response)=>{
                token = response.body.token
            }).catch(fail),
        ]
        await Promise.all(cenario)

        // Teste
        return request(address).del(`/usuario`)
        .set('authorization', token)
        .then((response)=>{
            expect(response.status).toBe(204)
        })
    })

    test('put - atualizar usuário', async()=>{
        // Montando o cenario
        let token:string = ""
        const cenario = [
            await UsuarioSuport.loginCreate(TipoUsuario.CLIENT, usuarioData[0]).then((response)=>{
                token = response.body.token
            }).catch(fail),
        ]
        await Promise.all(cenario)

        // Teste
        return request(address).put(`/usuario`)
        .set('authorization', token)
        .send(usuarioData[1]).then((response)=>{
            expect(response.status).toBe(200)
            expect(response.body).not.toHaveProperty('senha')
            expect(response.body).toHaveProperty('nome')
            expect(response.body).toHaveProperty('email')
            expect(response.body).toHaveProperty('tipoUsuario')
            expect(response.body).toHaveProperty('dataRegistro')
            expect(response.body).toHaveProperty('dataAtualizacao')
            expect(response.body).toHaveProperty('id')
        })
    })

    test('post - cadastra usuário com foto', async() => {
        return request(address).post('/usuario')
        .attach('foto', usuarioData[0].foto != null ? usuarioData[0].foto : null)
        .field('nome', usuarioData[0].nome)
        .field('email', usuarioData[0].email)
        .field('senha', usuarioData[0].senha)
        .field('dataNascimento', usuarioData[0].dataNascimento)
        .then(response=>{
            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('id')
            expect(response.body).toHaveProperty('nome')
            expect(response.body).toHaveProperty('email')
            expect(response.body).toHaveProperty('tipoUsuario')
            expect(response.body).toHaveProperty('foto')
            expect(response.body).not.toHaveProperty('senha')
            expect(response.body).toHaveProperty('dataRegistro')
            expect(response.body).toHaveProperty('dataAtualizacao')
        }).catch(fail)
    })

    test('post - cadastra usuário sem foto', async()=>{
        return request(address).post("/usuario")
        .send(usuarioData[1])
        .then(response =>{
            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('id')
            expect(response.body).toHaveProperty('nome')
            expect(response.body).toHaveProperty('email')
            expect(response.body).toHaveProperty('tipoUsuario')
            expect(response.body).toHaveProperty('foto')
            expect(response.body).not.toHaveProperty('senha')
            expect(response.body).toHaveProperty('dataRegistro')
            expect(response.body).toHaveProperty('dataAtualizacao')
        }).catch(fail)
    })

})