/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Class utilizada com serviço de envio de emails utilizado globalmente na aplicação
 * @Callback exportação da instancia da class ServiceEmail
*/

import nodemailer from 'nodemailer'
import { google } from 'googleapis'
import ejs from 'ejs'
import Usuario from '@models/usuario'
import env from '@config/env'
import Mail from 'nodemailer/lib/mailer'
import { Request } from 'express'

// Camada de transporte
let transport: Mail
try {
    switch (env.email.enviroment) {
        case 'OAuth2':
            const oauth2Client = new google.auth.OAuth2(
                env.email.OAuth2.clientId,
                env.email.OAuth2.clientSecret,
                env.email.OAuth2.redirectUri
            )
            oauth2Client.setCredentials({
                refresh_token: env.email.OAuth2.refreshToken,
            })
            oauth2Client.getAccessToken().then((accessToken) => {
                if (accessToken.token) {
                    transport = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            type: "OAuth2",
                            user: env.email.notificator,
                            clientId: env.email.OAuth2.clientId,
                            clientSecret: env.email.OAuth2.clientSecret,
                            refreshToken: env.email.OAuth2.refreshToken,
                            accessToken: accessToken.token
                        }
                    })
                }
            })
            break;
        case 'SMTP':
            transport = nodemailer.createTransport({
                host: env.email.host,
                auth: {
                    user: env.email.notificator,
                    pass: env.email.pass
                }
            })
            break;
    }
} catch (error) {
    console.log(error)
}

class ServiceEmail {

    forceBruteAcesso(req: Request) {
        console.log(req)
    }

    bemVindo(user: Usuario) {
        return this.send(user.email, "bem-vindo", "bem-vindo", user)
    }

    resetSenha(user: Usuario) {
        return this.send(user.email, "reset senha", "reset-senha", user)
    }

    async notificacaoErro(error: any, user: Usuario, idReq: string) {
        let email = Math.floor(Math.random() * 2) + 1 == 1 ? env.email.admin1 : env.email.admin2
        let data
        if (user) {
            return await Usuario.findOne({ where: { id: user.id } }).then(async (doc) => {
                if (doc) {
                    doc.senha = undefined
                    data = {
                        id: idReq,
                        usuario: doc,
                        error: error
                    }
                    return await this.send(email, "Erro Events", "error", data)
                }
            })
        } else {
            data = {
                id: idReq,
                error: error,
                usuario: {}
            }
            this.send(email, "Erro Events", "error", data)
        }
    }

    send(destinatario: string, subject: string, template: string, data: any, files?: any) {
        return new Promise((resolve, reject) => {
            ejs.renderFile('./src/views/mail/' + template + '.ejs', data, function (err, html) {
                if (err) {
                    reject({ name: 'email', mensagem: err })
                }
                transport.sendMail({
                    to: destinatario,
                    from: env.email.notificator,
                    subject: subject,
                    html: html,
                    attachments: files,
                }).then(resolve).catch((err: any) => {

                    reject({ name: 'email', mensagem: err })
                })
            })
        })
    }
}

export default new ServiceEmail()