/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Class utilizada com class de metodos genéricos das requisições da aplicação 
 * utilizado principalmente nos arquivos localizados em ´@/controllers/*.ts´
 * @Callback exportação da instancia da class ControllerBase
*/

import { RequestHandler, Request, NextFunction, Response } from "express"
import AddFields from "@interfaces/addFields.interface"
import { validate } from "class-validator"
import RequestFile from "@interfaces/requestFile.interface"
import Usuario from "@models/usuario"
import Options from "@interfaces/options.interface"
import utils from "./utils"
import env from "@config/env"

class ControllerBase {

    private pageSize: number = 10
    private basePath: string = ''

    // Metodo que envia um dado para requesição
    render(res: Response, next: NextFunction, options?: Options) {
        return (doc: any) => {
            if (doc) {
                res.json(this.envelope(doc, options))
            } else {
                next({ name: "NotFound" })
            }
        }
    }

    // Metodo que envia varios dados para requesição
    renderAll(res: Response, next: NextFunction, options: Options) {
        return (documents: any[]) => {
            if (documents) {
                documents.forEach(async (document, index, array) => {
                    array[index] = this.envelope(document, options)
                })
                res.json(this.envelopeAll(documents, options))
            } else {
                res.json(this.envelopeAll([], options))
            }
        }
    }

    // Aplicando Hateoas na resposta da requisição
    envelope(document: any, options?: Options) {
        // Inciando skipLinks
        if (options && options.skipLinks == null) options.skipLinks = false

        if (options) {
            this.basePath = options.basePath != null ? options.basePath : this.basePath
            if (!options.skipLinks) {
                document = Object.assign({ _links: {} }, document)
                document._links.self = `${this.basePath}/${document.id}`
                document._links.all = `${this.basePath}`
            }
            if (options.excludeFields) {
                options.excludeFields.forEach((field) => {
                    delete document[field]
                })
            }
        }
        return document
    }

    // Aplicando Hateoas na resposta da requisição
    envelopeAll(documents: any[], options: Options) {
        this.basePath = options.basePath != null ? options.basePath : this.basePath

        // Tratando os dados da query URL
        let urlQuery = ""
        if (options.query) {
            Object.keys(options.query).forEach((key: any) => {
                if (options.query) {
                    if (key != "_page") urlQuery += `&${key}=${options.query[key]}`
                }
            })
        }
        const resource: any = {
            _links: {
                self: `${options.url}${urlQuery}`
            },
            items: documents
        }

        // Fazendo calculo da paginação
        if (options.page && options.count && options.pageSize) {
            let query = ''
            if (options.query) {
                Object.keys(options.query).forEach((key: any) => {
                    if (options.query) {
                        if (key != "_page") query += `&${key}=${options.query[key]}`
                    }
                })
            }

            if (options.page > 1) {
                resource._links.previous = `${this.basePath}?_page=${options.page - 1}${query}`
            }
            const remaining = options.count - (options.page * options.pageSize)
            if (remaining > 0) {

                resource._links.remaining = remaining
                resource._links.total = options.count
                resource._links.next = `${this.basePath}?_page=${options.page + 1}${query}`
            }
        }

        if (options.excludeFields) {
            documents.forEach(document => {
                if (options.excludeFields) {
                    options.excludeFields.forEach((field) => {
                        delete document[field]
                    })
                }
            })
        }

        return options.skipLinks && options.skipLinks == true ? { items: documents } : resource
    }

    // Metodo que pesquisar dados por condição
    findOne(option: {
        model: any,
        condition?: any,
        populate?: Array<any>[],
        params?: Array<AddFields>,
        basePath?: string,
        excludeFields?: Array<string>,
        select?: Array<string>
    }): RequestHandler {
        return (req, res, next) => {
            this.basePath = option.basePath != null ? option.basePath : `/${option.model.name.toLowerCase()}`
            // iniciando a condição
            if (!option.condition) option.condition = {}

            // Adicionado os campos dynamicos para a condição
            if (option.params) {
                option.params.forEach(element => {
                    if (element.path && element.params) {
                        if (element.user) {
                            option.condition[element.path] = req.user.id
                        } else {
                            option.condition[element.path] = req.params[element.params]
                        }
                    }
                })
            }

            // Realizando a pesquisa
            option.model.findOne({ where: option.condition, relations: option.populate, select: option.select })
                .then(this.render(res, next, { excludeFields: option.excludeFields }))
                .catch(next)
        }
    }

    // Metodo que pesquisa dados por ID
    findById(option: {
        model: any,
        populate?: Array<any>[],
        basePath?: string,
        excludeFields?: Array<string>,
        select?: Array<string>
    }): RequestHandler {
        return (req, res, next) => {
            this.basePath = option.basePath != null ? option.basePath : `/${option.model.name.toLowerCase()}`
            option.model.findOne({ where: { id: req.params.id }, relations: option.populate, select: option.select })
                .then(this.render(res, next, { excludeFields: option.excludeFields }))
                .catch(next)
        }
    }

    // Metodo que lista os dados da pesquisa
    findAll(option: {
        model: any,
        condition?: any,
        populate?: Array<any>[],
        params?: Array<AddFields>,
        basePath?: string,
        excludeFields?: Array<string>,
        select?: Array<string>,
        order?: any,
        pageSize?: number,
        skipLinks?: boolean
    }): RequestHandler {
        return (req, res, next) => {
            this.basePath = option.basePath != null ? option.basePath : `/${option.model.name.toLowerCase()}`

            // Calculo paginação
            this.pageSize = req.query._pageSize != null ? parseInt(req.query._pageSize?.toString() || "1") : option.pageSize != null ? option.pageSize : 10
            let page = parseInt(req.query._page?.toString() || "1")
            page = page > 0 ? page : 1
            const skip = (page - 1) * this.pageSize

            // Querys da pesquisa
            let countQuery: any = {}
            let query: any = {}

            // iniciando a condição e ordenação
            if (!option.condition) option.condition = {}
            if (!option.order) option.order = {}

            // Adicionado os campos dynamicos para a condição
            if (option.params) {
                option.params.forEach(element => {
                    if (element.path && element.params) {
                        if (element.user) {
                            option.condition[element.path] = req.user.id
                            countQuery[element.path] = req.user.id
                        } else {
                            option.condition[element.path] = req.params[element.params]
                            countQuery[element.path] = req.params[element.params]
                        }
                    }
                })
            }

            // Query da Requisição
            try {
                Object.keys(req.query).forEach(element => {
                    if (element == '_query') query = JSON.parse(String(req.query[element]).replace("#", "$"))
                })
                if (option.condition) {
                    Object.keys(option.condition).forEach(element => {
                        if (!query[element]) {
                            query[element] = option.condition[element]
                        }
                    })
                }
            } catch (error) {
                query = option.condition
            }

            // Sort da Requisição
            try {
                if (req.query._sort) {
                    let query = JSON.parse(String(req.query._sort))
                    Object.keys(query).forEach((element) => {
                        query[element] = element.toUpperCase()
                    })
                    option.order = query
                }
            } catch (error) { }

            countQuery = Object.assign(query, countQuery)

            option.model.count({ where: countQuery }).then((count: number) => {
                option.model.find({
                    where: query,
                    skip: skip,
                    take: this.pageSize,
                    relations: option.populate,
                    select: option.select
                })
                    .then(this.renderAll(res, next, {
                        page,
                        count,
                        pageSize: this.pageSize,
                        url: req.originalUrl,
                        skipLinks: option.skipLinks,
                        query: query,
                        excludeFields: option.excludeFields
                    })).catch(next)
            }).catch(next)
        }
    }

    // Metodo Generico de Deletação de dados
    delete(option: {
        model: any,
        params?: Array<AddFields>,
        files?: Array<{ path: string }>
        beforeDelete?: (data: any, req: Request, next: NextFunction) => any
        afterDelete?: (data: any, req: Request) => void
    }): RequestHandler {
        return async (req, res, next) => {
            // Condição de deletar
            let condition: any = {}

            // Adicionado os campos dynamicos para a condição
            if (option.params) {
                option.params.forEach(element => {
                    if (element.path && element.params) {
                        if (element.user) {
                            condition[element.path] = req.user.id
                        } else {
                            condition[element.path] = req.params[element.params]
                        }
                    }
                })
            } else {
                condition["id"] = req.params.id
            }

            option.model.findOne(condition).then(async (data: any) => {
                if (data) {
                    // Antes de executar a deletação
                    if (option.beforeDelete) await option.beforeDelete(data, req, next)
                    // Executando remoção
                    option.model.delete(condition).then((del: any) => {
                        if (del.affected && del.affected > 0) {
                            // Removendo os arquivos
                            if (option.files && option.files.length > 0) {
                                option.files.forEach((item) => {
                                    utils.deleteFolder(env.files.uploadsPath + item.path + data.id)
                                })
                            }
                            if (option.afterDelete) option.afterDelete(data, req) // Callback Function
                            res.sendStatus(204)
                        } else {
                            next({ name: "NotFound" })
                        }
                    }).catch(next)
                } else {
                    next({ name: "NotFound" })
                }
            }).catch(next)
        }
    }

    // Metodo Generico de Atualização de dados
    update(option: {
        model: any,
        params?: Array<AddFields>,
        file?: RequestFile,
        excludeFields?: Array<string>,
        beforeUpdate?: (data: any, req: Request, next: NextFunction) => any
        afterUpdate?: (data: any, req: Request) => void
    }): RequestHandler {
        return async (req, res, next) => {
            // Condição de atualização
            let condition: any = {}
            let body: any = req.body

            // Adicionado os campos dynamicos para a condição
            if (option.params) {
                option.params.forEach(element => {
                    if (element.path && element.params) {
                        if (element.user) {
                            condition[element.path] = req.user.id
                        } else {
                            condition[element.path] = req.params[element.params]
                        }
                    }
                })
            } else {
                condition["id"] = req.params.id
            }

            // Antes de executar a atualização
            if (option.beforeUpdate) {
                body = await option.beforeUpdate(body, req, next)
            }

            // Verificando se e necessário upload de arquivos
            if (req.files && option.file && option.file.files.length > 0) {
                option.model.findOne({ where: condition }).then(async (data: any) => {
                    if (data && option.file) {
                        const id = data.id
                        switch (option.file.typeUpload) {
                            case 'single':
                                const file = option.file.files[0]
                                // Verificando se o field existe ou se esta vázio
                                let field = true
                                if (!req.files[file.field]) {
                                    field = false
                                } else {
                                    if (Array.isArray(req.files[file.field])) {
                                        req.files[file.field].forEach((itens: any) => {
                                            if (itens.size <= 0) {
                                                field = false
                                                return false
                                            }
                                        })
                                    } else {
                                        if (req.files[file.field].size <= 0) {
                                            field = false
                                        }
                                    }
                                }
                                if (field) {
                                    if (Array.isArray(req.files[file.field])) {
                                        // Single Upload path
                                        await utils.singleUpload({
                                            file: req.files[file.field][0],
                                            path: `${file.path}${id}/`,
                                            nameFile: id,
                                            idObjeto: id,
                                            model: option.model,
                                            user: option.model.name.toLowerCase() === 'usuario' ? new Usuario({ id: id }) : req.user
                                        }).then((url) => {
                                            body[file.field] = url
                                        }).catch(next)
                                    } else {
                                        // Single Upload path
                                        await utils.singleUpload({
                                            file: req.files[file.field],
                                            path: `${file.path}${id}/`,
                                            nameFile: id,
                                            idObjeto: id,
                                            model: option.model,
                                            user: option.model.name.toLowerCase() === 'usuario' ? new Usuario({ id: id }) : req.user
                                        }).then((url) => {
                                            body[file.field] = url
                                        }).catch(next)
                                    }
                                }
                                break;
                            case 'multiple':
                                const files = option.file.files[0]
                                // Verificando se o field existe ou se esta vázio
                                let fields = true
                                if (!req.files[files.field]) {
                                    fields = false
                                } else {
                                    if (Array.isArray(req.files[files.field])) {
                                        req.files[files.field].forEach((itens: any) => {
                                            if (itens.size <= 0) {
                                                fields = false
                                                return false
                                            }
                                        })
                                    } else {
                                        if (req.files[files.field].size <= 0) {
                                            fields = false
                                        }
                                    }
                                }
                                if (fields) {
                                    // Multiple Upload path
                                    await utils.multipleUpload({
                                        files: req.files[files.field],
                                        path: `${files.path}${id}/`,
                                        nameFile: id,
                                        idObjeto: id,
                                        model: option.model,
                                        user: option.model.name.toLowerCase() === 'usuario' ? new Usuario({ id: id }) : req.user,
                                        limit: 4
                                    }).then((urls) => {
                                        body[files.field] = urls
                                    }).catch(next)
                                }
                                break;
                        }
                    }
                }).catch(next)
            }

            // Executando a atualização
            option.model.update(condition, body).then((up: any) => {
                if (up.affected && up.affected > 0) {
                    option.model.findOne({ where: condition }).then((data: any) => {
                        let resBody: any = data
                        if (option.afterUpdate) option.afterUpdate(data, req) // Callback Function
                        if (option.excludeFields) {
                            option.excludeFields.forEach((item) => {
                                delete resBody[item]
                            })
                        }
                        res.json(resBody);
                    }).catch(next)
                } else {
                    next({ name: "NotFound" })
                }
            }).catch(next)
        }
    }

    // Metodo Generico de Salvamento de dados
    save(option: {
        model: any,
        addFields?: Array<AddFields>,
        excludeFields?: Array<string>,
        file?: RequestFile,
        beforeSave?: (data: any, req: Request, next: NextFunction) => any
        afterSave?: (data: any, req: Request) => void
    }): RequestHandler {
        return async (req, res, next) => {
            let body = req.body

            // Adicionado os campos dynamicos
            if (option.addFields) {
                option.addFields.forEach((field) => {
                    if (field.path && field.params) {
                        if (field.user) {
                            body[field.path] = req.user.id
                        } else if (field.ip) {
                            body[field.path] = req.headers['x-real-ip'] || req.connection.remoteAddress;
                        } else {
                            body[field.path] = req.params[field.params]
                        }
                    }
                })
            }

            // Removendo usuário caso sejá indefinido
            if (body.usuario == undefined) delete body.usuario

            // Antes de executar o salvamento
            if (option.beforeSave) {
                req.body = await option.beforeSave(req.body, req, next)
            }

            // Realizando validações
            validate(option.model).then((errors) => {
                if (errors.length > 0) {
                    next({ name: "class-validator", error: errors })
                    return
                } else {
                    // Salvando os dados
                    option.model.insert(req.body).then(async (save: any) => {
                        const id = save.identifiers[0].id
                        if (option.file && option.file.typeUpload != null && req.files && Object.keys(req.files).length > 0) {
                            // Salvando os dados com arquivos da requisição
                            switch (option.file.typeUpload) {
                                case 'single':
                                    const file = option.file.files[0]
                                    // Verificando se o field existe ou se esta vázio
                                    let field = true
                                    if (req.files[file.field]) {
                                        if (Array.isArray(req.files[file.field])) {
                                            req.files[file.field].forEach((itens: any) => {
                                                if (itens.size <= 0) {
                                                    field = false
                                                    return false
                                                }
                                            })
                                        } else {
                                            if (req.files[file.field].size <= 0) {
                                                field = false
                                            }
                                        }
                                    } else {
                                        field = false
                                    }
                                    if (field) {
                                        if (Array.isArray(req.files[file.field])) {
                                            // Single Upload path
                                            await utils.singleUpload({
                                                file: req.files[file.field][0],
                                                path: `${file.path}${id}/`,
                                                nameFile: id,
                                                idObjeto: id,
                                                model: option.model,
                                                user: option.model.name.toLowerCase() === 'usuario' ? new Usuario({ id: id }) : req.user
                                            }).then((url) => {
                                                body[file.field] = url
                                            }).catch(next)
                                        } else {
                                            // Single Upload path
                                            await utils.singleUpload({
                                                file: req.files[file.field],
                                                path: `${file.path}${id}/`,
                                                nameFile: id,
                                                idObjeto: id,
                                                model: option.model,
                                                user: option.model.name.toLowerCase() === 'usuario' ? new Usuario({ id: id }) : req.user
                                            }).then((url) => {
                                                body[file.field] = url
                                            }).catch(next)
                                        }
                                    }
                                    break;
                                case 'multiple':
                                    const files = option.file.files[0]
                                    // Verificando se o field existe ou se esta vázio
                                    let fields = true
                                    if (!req.files[files.field]) {
                                        fields = false
                                    } else {
                                        if (Array.isArray(req.files[files.field])) {
                                            req.files[files.field].forEach((itens: any) => {
                                                if (itens.size <= 0) {
                                                    fields = false
                                                    return false
                                                }
                                            })
                                        } else {
                                            if (req.files[files.field].size <= 0) {
                                                fields = false
                                            }
                                        }
                                    }
                                    if (fields) {
                                        // Multiple Upload path
                                        await utils.multipleUpload({
                                            files: req.files[files.field],
                                            path: `${files.path}${id}/`,
                                            nameFile: id,
                                            idObjeto: id,
                                            model: option.model,
                                            user: option.model.name.toLowerCase() === 'usuario' ? new Usuario({ id: id }) : req.user,
                                            limit: 4
                                        }).then((urls) => {
                                            body[files.field] = urls
                                        }).catch(next)
                                    }
                                    break;
                            }
                            option.model.update({ id: id }, body).then(() => {
                                option.model.findOne({ where: { id: id } }).then((data: any) => {
                                    let resBody: any = data
                                    if (option.afterSave) option.afterSave(data, req) // Callback Function
                                    if (option.excludeFields) {
                                        option.excludeFields.forEach((item) => {
                                            delete resBody[item]
                                        })
                                    }
                                    res.status(201).json(resBody);
                                }).catch(next)
                            }).catch(next)
                        } else {
                            option.model.findOne({ where: { id: id } }).then((data: any) => {
                                let resBody: any = data
                                if (option.afterSave) option.afterSave(data, req) // Callback Function
                                if (option.excludeFields) {
                                    option.excludeFields.forEach((item) => {
                                        delete resBody[item]
                                    })
                                }
                                res.status(201).json(resBody);
                            }).catch(next)
                        }
                    }).catch(next);
                }
            }).catch(next)
        }
    }
}

export default new ControllerBase()