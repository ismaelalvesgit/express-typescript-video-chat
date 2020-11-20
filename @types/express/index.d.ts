import Usuario from '../../src/models/usuario'

declare global {
    namespace Express {
        interface Request {
            id: string,
            user: Usuario,
            files: any
        }
    }
}