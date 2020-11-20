import { RateLimiterMemory } from 'rate-limiter-flexible'
import { RequestHandler } from 'express'
const opts = {
    points: 1000,
    duration: 20
}
const rateLimiter = new RateLimiterMemory(opts)
export default <RequestHandler> function throttlingResquestMiddleware (req, resp, next) {
    rateLimiter.consume((req.ip))
    .then((rateLimiterRes)=>{
        const headers = {
            "Retry-After": rateLimiterRes.msBeforeNext / 1000,
            "X-RateLimit-Limit": opts.points,
            "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
            "X-RateLimit-Reset": new Date(Date.now() + rateLimiterRes.msBeforeNext)
        }
        resp.set(headers)
        next()
    }).catch((rateLimiterRes)=>{
        const headers = {
            "Retry-After": rateLimiterRes.msBeforeNext / 1000,
            "X-RateLimit-Limit": opts.points,
            "X-RateLimit-Remaining": rateLimiterRes.remainingPoints,
            "X-RateLimit-Reset": new Date(Date.now() + rateLimiterRes.msBeforeNext)
        }
        resp.set(headers)
        next({
            name:"Throttling", 
            mensagem:"limite de Requisição atigido :(, aguarde um tempo e tente novamente :)"
        })
    })
}