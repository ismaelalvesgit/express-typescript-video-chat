import { RequestHandler } from 'express'
import { validationResult } from 'express-validator'

export default <RequestHandler> function verifyHandlerMiddleware(req, resp, next){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        next({name:'express-validator', errors: errors.array()})
    }else{
        req.body = Object.assign(req.body)
        next()
    }
}