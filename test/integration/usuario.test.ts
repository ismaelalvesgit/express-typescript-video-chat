import request  from 'supertest'
import usuarioData from '../fixtures/usuarioData'
import Usuario from '../../src/models/usuario'
import utils from '../../src/utils/utils'
const address = process.env.SERVER_URL

//antes de todo teste
afterEach( async()=>{
    await Usuario.delete({})
})

describe('Fluxo normal de cadastros de usuário', () => {

    test('post - cadastros', async()=>{
        return request(address).get("/").then(response =>{
            expect(response.status).toBe(200)
        }).catch(fail)
    })

})