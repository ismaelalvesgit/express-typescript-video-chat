/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Function utilizado como middleware para gerar ID ÚNICO para cada requisição da 
 * aplicação utilizado na Class localizado em ´@/config/server.ts´
 * @Callback exportação da function assignResquestMiddleware do tipo RequestHandler
*/

import * as uuid from 'uuid'
import { RequestHandler } from 'express'
export default <RequestHandler>function assignResquestMiddleware(req, res, next) {
    req.id = uuid.v4()
    next()
}