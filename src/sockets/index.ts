import app from '../index'
import clientNameSpace from './namespaces/client.nameSpace';

// instance
const io = app.io

// Middlewares

// Client NameSpace
io.on('connection', (socket)=>{
    console.log(socket)
    clientNameSpace.connection(socket)
})

