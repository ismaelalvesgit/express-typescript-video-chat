import * as uuid from 'uuid'
import { RequestHandler } from 'express'
export default <RequestHandler> function assignResquestMiddleware (req, res, next) {
    req.id = uuid.v4()
    next()
}