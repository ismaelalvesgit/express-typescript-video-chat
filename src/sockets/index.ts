/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Class utilizada com ponto inicial do socket da aplicação
*/

import app from '../index'
import realIp from './middlewares/realIpMiddleware';
import user from './middlewares/userMiddleware';
import clientNameSpace from './namespaces/client.nameSpace';

// Instance
const io = app.io

// Middlewares
io.use(realIp)
io.use(user)

// Client NameSpace
io.on('connection', (socket) => {
    clientNameSpace.connection(socket)
})