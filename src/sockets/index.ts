import app from '../index'
import realIp from './middlewares/realIpMiddleware';
import user from './middlewares/userMiddleware';
import clientNameSpace from './namespaces/client.nameSpace';

// instance
const io = app.io

// Middlewares
io.use(realIp)
io.use(user)

// Client NameSpace
io.on('connection', (socket)=>{
    clientNameSpace.connection(socket)
})