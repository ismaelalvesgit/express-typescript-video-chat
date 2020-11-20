import app from '../../index'

class ClientNameSpace {
    
    connection(socket: SocketIO.Socket){
        app.io.emit('evento', {teste:"ok"}) 
    }
}

export default new ClientNameSpace();