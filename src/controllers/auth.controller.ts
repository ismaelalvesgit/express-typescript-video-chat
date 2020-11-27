/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Class utilizada com rota da aplicação
 * @Callback exportação da class AuthController
*/
import { NextFunction, Router, Request, Response } from 'express';
import Controller from '@interfaces/controller.Interface';
import { RateLimiterMemory } from 'rate-limiter-flexible'
import Usuario from '@models/usuario';
import utils from '@utils/utils';
import mail from '@utils/mail';
import { getRepository } from 'typeorm';
import env from '@config/env';
import authValidator from '@validators/authValidator';
import verifiyHandlerMiddleware from '@middlewares/verifiyHandlerMiddleware';

const maxPorMinutoResetSenha = 3
const maxPorMinutoLogin = 6
const maxPorDiaLogin = 100
const limiterPorMinutoIPResetSenha = new RateLimiterMemory({
  keyPrefix: 'limiterPorMinutoIPResetSenha',
  points: maxPorMinutoLogin,
  duration: 60,
  blockDuration: 60 * 60 * 24, // Bloqueie por 1 dia, se 6 tentativas erradas a cada 1 minuto
})
const limiterPorMinutoIPLogin = new RateLimiterMemory({
  keyPrefix: 'limiterPorMinutoIPLogin',
  points: maxPorMinutoLogin,
  duration: 30,
  blockDuration: 60 * 10, // Bloqueie por 10 minutos, se 6 tentativas erradas a cada 30 segundos
})
const limiterPorDiaIPLogin = new RateLimiterMemory({
  keyPrefix: 'limiterPorDiaIPLogin',
  points: maxPorDiaLogin,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24, // Bloqueie por 1 dia, se 100 tentativas erradas por dia
})

class AuthController implements Controller {

  public path = '/auth';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    this.router.post(`${this.path}/email/reset-senha/:rash`,
      (req, res, next) => {
        Usuario.findOne({ where: { reset: req.params.rash } }).then(async (doc) => {
          if (doc != null) {
            req.body.senha = await utils.encrypt(req.body.senha)
            Usuario.update({ id: doc.id }, { senha: req.body.senha, reset: "" }).then(() => {
              res.render("reset-senha", { data: null, action: "sucess", url: env.server.url, post: "" })
            }).catch(next)
          } else {
            res.status(403).render("reset-senha", { data: null, action: "not-found", url: env.server.url, post: "" })
          }
        }).catch(next)
      }
    )

    this.router.get(`${this.path}/email/reset-senha/:rash`,
      (req, res, next) => {
        Usuario.findOne({ reset: req.params.rash }).then((doc) => {
          try {
            utils.decryptToken(req.params.rash)
            res.render("reset-senha", { data: doc, action: "alter", url: env.server.url, post: env.server.url + req.originalUrl })
          } catch (err) {
            res.status(403).render("reset-senha", { data: null, action: "not-found", url: env.server.url, post: "" })
          }
        }).catch(next)
      }
    )

    this.router.post(`${this.path}/email/reset-senha`,
      authValidator.resetSenhaValidator(),
      verifiyHandlerMiddleware,
      async (req: Request, res: Response, next: NextFunction) => {
        const data = req.body
        const ipAddr = req.ip
        const resFastByIP = await limiterPorMinutoIPResetSenha.get(ipAddr)
        let retrySecs = 0
        // Verifique se o IP já está bloqueado
        if (resFastByIP !== null && resFastByIP.consumedPoints > maxPorMinutoResetSenha) {
          retrySecs = Math.round(resFastByIP.msBeforeNext / 1000) || 1;
        }
        if (retrySecs > 0) {
          mail.forceBruteAcesso(req)
          next({
            name: "Throttling",
            mensagem: "limite de Requisição atigido :(, aguarde um tempo e tente novamente :)"
          })
        } else {
          Usuario.findOne({ where: { email: data.email } }).then(async (doc) => {
            try {
              if (doc != null) {
                const rash = utils.gerarToken(doc.email)
                Usuario.update({ id: doc.id }, { reset: rash }).then(() => {
                  doc.reset = env.server.url + `${req.originalUrl}/` + rash
                  mail.resetSenha(doc).then(() => {
                    res.json(`enviamos um email para ${doc.email}`)
                  }).catch(next)
                })
              } else {
                await limiterPorMinutoIPResetSenha.consume(ipAddr)
                next({ name: 'NotFound', mensagem: 'Email incorrento ou não cadastrado' })
              }
            } catch (error) {
              if (error instanceof Error) {
                throw error;
              } else {
                mail.forceBruteAcesso(req)
                next({
                  name: "Throttling",
                  mensagem: "limite de Requisição atigido :(, aguarde um tempo e tente novamente :)"
                })
              }
            }
          }).catch(next)
        }
      },
    )

    this.router.post(`${this.path}/email/login`,
      authValidator.loginValidator(),
      verifiyHandlerMiddleware,
      async (req: Request, res: Response, next: NextFunction) => {
        const data = req.body
        const ipAddr = req.ip
        const [resFastByIP, resSlowByIP] = await Promise.all([
          limiterPorMinutoIPLogin.get(ipAddr),
          limiterPorDiaIPLogin.get(ipAddr),
        ])
        let retrySecs = 0
        // Verifique se o IP já está bloqueado
        if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxPorDiaLogin) {
          retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
        } else if (resFastByIP !== null && resFastByIP.consumedPoints > maxPorMinutoLogin) {
          retrySecs = Math.round(resFastByIP.msBeforeNext / 1000) || 1;
        }
        if (retrySecs > 0) {
          mail.forceBruteAcesso(req)
          next({
            name: "Throttling",
            mensagem: "limite de Requisição atigido :(, aguarde um tempo e tente novamente :)"
          })
        } else {
          getRepository(Usuario).createQueryBuilder().where({ email: data.email }).addSelect('Usuario.senha').getOne().then(async (doc) => {
            try {
              if (doc != null && doc.senha) {
                utils.compareCrypt(data.senha, doc.senha).then(async (rs) => {
                  if (rs) {
                    const token = utils.gerarToken(doc.email)
                    let resBody: any = doc.toJson()
                    delete resBody.reset
                    res.json({ token: token, usuario: resBody })
                  } else {
                    await Promise.all([
                      limiterPorMinutoIPLogin.consume(ipAddr),
                      limiterPorDiaIPLogin.consume(ipAddr),
                    ])
                    next({ name: 'Unauthorized', mensagem: 'Usuario ou senha incorreta' })
                  }
                }).catch(next)
              } else {
                await Promise.all([
                  limiterPorMinutoIPLogin.consume(ipAddr),
                  limiterPorDiaIPLogin.consume(ipAddr),
                ])
                next({ name: 'Unauthorized', mensagem: 'Usuario ou senha incorreta' })
              }
            } catch (error) {
              if (error instanceof Error) {
                throw error;
              } else {
                mail.forceBruteAcesso(req)
                next({
                  name: "Throttling",
                  mensagem: "limite de Requisição atigido :(, aguarde um tempo e tente novamente :)"
                })
              }
            }
          }).catch(next)
        }
      }
    );
  }

}

export default AuthController;