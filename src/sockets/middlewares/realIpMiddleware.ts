export default function realIp(socket: SocketIO.Socket, next:any) {
    if(socket.handshake.headers['x-real-ip']){
        socket.handshake.address = socket.handshake.headers['x-real-ip']
    }
    return next()
}