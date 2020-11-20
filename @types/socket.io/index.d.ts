import Usuario from "@models/usuario";

declare global {
    namespace SocketIO{
        interface Socket{
            user: Usuario,
            id: string,
        }
    }
}