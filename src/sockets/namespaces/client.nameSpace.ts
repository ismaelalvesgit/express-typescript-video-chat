/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Class utilizada com namespace cliente do socket da aplicação
 * @Callback Instance class ClientNameSpace 
*/

import Usuario from '@models/usuario'
import app from '../../index'

class ClientNameSpace {

    client: SocketIO.Namespace = app.io.of('/')

    connection(socket: SocketIO.Socket) {

        this.verificarUsuario(socket.user)

        socket.emit('join-room', socket.user)

        socket.on('disconnect', () => {
            this.removerUsuario(socket.user)
        })

        socket.on('answer', (data) => {
            console.log(data)
        })

        // socket.on('make-offer', (data) => {
        //     socket.to(data.to).emit('offer-made', {
        //         offer: data.offer,
        //         socket: socket.user
        //     })
        // })

        // socket.on('make-answer', (data) => {
        //     console.log(data)
        //     socket.to(data.to).emit('answer-made', {
        //         socket: socket.user,
        //         answer: data.answer
        //     })
        // })
    }

    private verificarUsuario(usuario: Usuario) {
        if (usuario.id) {
            const index = app.usersSocket.findIndex((u) => u.id === usuario.id)
            if (index !== -1) {
                app.usersSocket.splice(index, 1)
                app.usersSocket.push(usuario)
            } else {
                app.usersSocket.push(usuario)
            }
        }
    }

    private removerUsuario(usuario: Usuario) {
        const index = app.usersSocket.findIndex((u) => u.id === usuario.id)
        if (index !== -1) {
            app.usersSocket.splice(index, 1)
        }
    }

}

export default new ClientNameSpace();