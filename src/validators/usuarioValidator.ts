/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Class utilizada somente para validação de dados no controller usuario utilizada 
 * somente no arquivo localizado `@/controllers/usuario.controller.ts`
 * @Callback exportação da instancia UsuarioValidator
*/

import { checkSchema } from 'express-validator'
import Usuario from '@models/usuario'

class UsuarioValidator {

    usuarioEditar() {
        return checkSchema({
            tipoUsuario: {
                in: 'body',
                isEmpty: {
                    errorMessage: "Tipo usuário deve ser vázio"
                }
            },
            email: {
                in: 'body',
                custom: {
                    options: async (value, { req, location, path }) => {
                        if (req.user && req.user.email && req.user.email != value) {
                            const usuario = await Usuario.findOne({ where: { email: value } })
                            if (usuario) {
                                return Promise.reject("Email já está cadastrado no sistema")
                            }
                        }
                    }
                }
            }
        })
    }

    usuarioCadastro() {
        return checkSchema({
            tipoUsuario: {
                in: 'body',
                isEmpty: {
                    errorMessage: "Tipo usuário deve ser vázio"
                }
            },
            nome: {
                in: 'body',
                notEmpty: {
                    errorMessage: "Nome e requirido"
                }
            },
            senha: {
                in: 'body',
                notEmpty: {
                    errorMessage: "Senha e requirido"
                },
                isLength: {
                    errorMessage: "Senha deve conter no minimo 6 caracteres",
                    options: {
                        min: 6
                    }
                }
            },
            email: {
                in: 'body',
                notEmpty: {
                    errorMessage: "Email e requirido"
                },
                isEmail: {
                    errorMessage: "Necessina ser um email válido"
                },
                custom: {
                    options: async (value, { req, location, path }) => {
                        const usuario = await Usuario.findOne({ where: { email: value } })
                        if (usuario) {
                            return Promise.reject("Email já está cadastrado no sistema")
                        }
                    }
                }
            },
            dataNascimento: {
                in: 'body',
                notEmpty: {
                    errorMessage: "Data Nascimento e requirido"
                },
                isISO8601: {
                    errorMessage: "Data Nascimento está inválida"
                }
            }
        })
    }
}

export default new UsuarioValidator()