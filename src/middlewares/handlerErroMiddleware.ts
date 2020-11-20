import { ValidationError } from 'class-validator'
import { ErrorRequestHandler } from 'express'
import mail from '@utils/mail'

export default <ErrorRequestHandler> function handlerErroMiddleware(e, req, resp, next){
    // console.log(e)
    let messages: Array<{nome: string, mensagem: string}> = []
    switch (e.name) {
        case 'Throttling':
            messages.push({nome: e.name, mensagem: e.mensagem != null ? e.mensagem : 'Token inválido ou incorreto'})
            resp.status(429).json(messages)
            break;
        case 'Forbidden':
            messages.push({nome: e.name, mensagem: e.mensagem != null ? e.mensagem : 'Token inválido ou incorreto'})
            resp.status(403).json(messages)
            break;
        case 'NotFound':
            messages.push({nome: e.name, mensagem: e.mensagem != null ? e.mensagem : 'Documento não encontrado'})
            resp.status(404).json(messages);
            break;
        case 'Unauthorized':
            messages.push({nome: e.name, mensagem: e.mensagem != null ? e.mensagem : 'Seu perfil não tem acesso a isso'})
            resp.status(401).json(messages);
            break;
        case 'backup':
            messages.push({nome: e.name, mensagem: e.message})
            resp.status(400).json(messages)
            break;
        case 'validate':
            messages.push({nome: e.name, mensagem: e.message})
            resp.status(400).json(messages)
            break;
        case 'contains':
            messages.push({nome: e.name, mensagem: e.message})
            resp.status(400).json(messages)
            break;
        case 'email':
            console.log(e.mensagem)
            messages.push({nome:'email', mensagem:'configurações das credenciais de email estão incorretas'})
            resp.status(403).json(messages)
            break;
        case 'express-validator':
            for (let erro in e.errors){
                let name = e.errors[erro].param
                let message = e.errors[erro].msg
                if(!messages.some(msg => name.indexOf(msg.nome) != -1)){
                    messages.push({nome:name, mensagem:message})
                }
            }
            resp.status(400).json(messages)
            break;
        case 'BadRequestError':
            messages.push({nome:'body', mensagem:'corpo da requisição não pode ser vazio'})
            resp.status(400).json(messages)
            break;
        case 'QueryFailedError':
            switch (e.code) {
                case "23505":
                    var regExp = /\(([^)]+)\)/;
                    let values = e.detail.split('=')
                    let name = regExp.exec(values[0])
                    let message = regExp.exec(values[1])
                    if(name && message){
                        messages.push({nome: name[1], mensagem: `Valor ${message[1]} já cadastrado no sistema`})
                    }
                    break;
                case "23502":
                    messages.push({nome: e.column, mensagem: `${e.column} e requerido`})
                    break;
                case "22P02":
                    messages.push({nome: "body", mensagem: "Existe Valor inválido"})
                    break;
                default:
                    console.log(e)
                    break;
            }
            resp.status(400).json(messages)
            break;
        case 'class-validator':
            e.error.forEach((item:ValidationError)=>{
                if(item.constraints){
                    messages.push({nome: item.property, mensagem: item.constraints[Object.keys(item.constraints)[0]]})
                }
            })
            resp.status(400).json(messages)
            break;
        default:
            //aqui voçê pode enviar um email com a pilha do erro
            console.log(e)
            mail.notificacaoErro(e.toString(), req.user, req.id)
            resp.status(500).json([
                {
                    nome: 'Erro Interno', 
                    message:`lamentamos por isso ter acontecido :( \n Seu id do erro é ${req.id}`
                }
            ])
    }
}
