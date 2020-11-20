import { Socket } from 'socket.io'
import app from '../../index'

class ClientNameSpace {
    
    connection(socket: Socket){
        app.io.emit('evento', {teste:"ok"}) 
    }
}

export default new ClientNameSpace();