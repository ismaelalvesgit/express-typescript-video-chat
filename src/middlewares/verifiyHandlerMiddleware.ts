/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Function utilizado como middleware para realizar verificações se o corpo da requisição da aplicação 
 * está de acordo com as validações feitas previamente, utilizado nas Class localizado em ´@/controllers/*.ts´
 * @Callback exportação da function verifyHandlerMiddleware do tipo RequestHandler
*/

import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'

export default <RequestHandler>function verifyHandlerMiddleware(req, resp, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        next({ name: 'express-validator', errors: errors.array() })
    } else {
        req.body = Object.assign(req.body)
        next()
    }
}