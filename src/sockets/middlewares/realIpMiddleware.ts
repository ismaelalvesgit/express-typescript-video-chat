/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Function utilizado como middleware para pegar o real IP do usuário que está utilizado o socket 
 * da aplicação
 * @Callback exportação da function realIp
*/

export default function realIp(socket: SocketIO.Socket, next: any) {
    if (socket.handshake.headers['x-real-ip']) {
        socket.handshake.address = socket.handshake.headers['x-real-ip']
    }
    return next()
}