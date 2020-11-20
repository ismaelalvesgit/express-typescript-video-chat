import fs from 'fs';
import shell from 'shelljs';
import mv from 'mv'
import rimraf from 'rimraf'
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'
import env from '@config/env'
import Upload from '@models/upload'
import Usuario from '@models/usuario';

class Utils {
  multipleUpload(option:{
    files: any,
    path: string,
    nameFile: string,
    idObjeto: number,
    model: any,
    limit: number,
    user: Usuario,
  }):Promise<Array<string>>{
    return new Promise((resolve, reject) => {
      try {
        this.defaultFolder(env.files.uploadsPath + option.path) 
        option.limit = option.files.length == undefined ? 1 : option.files.length
        if(option.limit > 4){
          option.limit = 4
        }
        let urls:Array<string> = [] 
        for(let i = 0; i < option.limit; i++){
          let extension = ''
          let path_origem = ''
          let name = ''
          if(option.limit == 1 ){
            extension = this.fileExtension(option.files.type.split('/')[1])
            path_origem = option.files.path;
            name = option.nameFile +'.'+extension;
          }else{
            extension = this.fileExtension(option.files[i].type.split('/')[1])
            path_origem = option.files[i].path;
            name = option.nameFile+i +'.'+extension;
          }
          let path_destino = env.files.uploadsPath + option.path + name;
          mv(path_origem, path_destino, async function(error){  
            if(!error){
              urls.push(env.files.uploadsUrl + option.path + name)
              Upload.find({where: {idObjeto: option.idObjeto}}).then((doc)=>{
                if(doc.length > 0){
                  Upload.update({idObjeto: option.idObjeto}, {
                    model: option.model.name,
                    idObjeto: option.idObjeto,
                    local: path_destino,
                    nome: name,
                    extensao: extension,
                    url: env.files.uploadsUrl + option.path + name,
                    usuario: option.user
                  }).then(()=> {
                    if(option.limit == urls.length){
                      resolve(urls)
                    }
                  }).catch(reject)
                }else{
                  new Upload({
                    model: option.model.name,
                    idObjeto: option.idObjeto,
                    local: path_destino,
                    nome: name,
                    extensao: extension,
                    url: env.files.uploadsUrl + option.path + name,
                    usuario: option.user
                  }).save().then(()=>{
                    if(option.limit == urls.length){
                      resolve(urls)
                    }
                  }).catch(reject)
                }
              }).catch(reject)
            }else{
              reject({name: "upload", message: error})
            }
          })
        }
      } catch (error) {
        reject({name: "upload", message: error})
      }
    })
  }

  // Metodo que realizar upload de um unico arquivo
  singleUpload(option: {
    file: any,
    path: string,
    nameFile: string,
    user: Usuario,
    idObjeto: number,
    model: any,
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.defaultFolder(env.files.uploadsPath + option.path)
        let extension = this.fileExtension(option.file.type.split('/')[1])
        let name = option.nameFile + '.' + extension;
        let path_origem = option.file.path;
        let path_destino = env.files.uploadsPath + option.path + name;
        mv(path_origem, path_destino, async function (err) {
          if (!err) {
            Upload.find({where:{idObjeto: option.idObjeto}}).then((doc) => {
              if (doc.length > 0) {
                Upload.update({idObjeto: option.idObjeto}, {
                  usuario: option.user,
                  model: option.model.name,
                  idObjeto: option.idObjeto,
                  local: path_destino,
                  nome: name,
                  extensao: extension,
                  url: env.files.uploadsUrl + option.path + name
                }).then(() => resolve(env.files.uploadsUrl + option.path + name)).catch(reject)
              } else {
                new Upload({
                  usuario: option.user,
                  model: option.model.name,
                  idObjeto: option.idObjeto,
                  local: path_destino,
                  nome: name,
                  extensao: extension,
                  url: env.files.uploadsUrl + option.path + name
                }).save().then(() => resolve(env.files.uploadsUrl + option.path + name)).catch(reject)
              }
            }).catch(reject)
          } else {
            reject({ name: "upload", message: err })
          }
        })
      } catch (error) {
        reject({ name: "upload", message: error })
      }
    })
  }

  // Metodo que fara tratamento de extenções de arquivos que serao feito upload
  fileExtension(extension: string): string {
    switch (extension) {
      case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        extension = 'xlsx'
        break;
      case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
        extension = 'doc'
        break;
      case 'vnd.ms-powerpoint':
        extension = 'ppt'
        break;
      case 'x-rar-compressed':
        extension = 'rar'
        break;
      case 'plain':
        extension = 'log'
        break;
      case 'octet-stream':
        extension = 'pxd'
        break;
      case 'svg+xml':
        extension = 'svg'
        break;
      case 'vnd.microsoft.icon':
        extension = 'icon'
        break;
    }
    return extension
  }

  // Metodo que tranforma um enum para Array
  enumToArrayNumber(type: any): Array<number> {
    const keys = Object.keys(type).filter(k => typeof type[k as any] === "number"); // ["A", "B"]
    const values = keys.map(k => parseInt(type[k as any])); // [0, 1]
    return values != null ? values : [];
  }

  // Metodo que deleta uma folder
  deleteFolder(path: string) {
    rimraf.sync(path)
  }

  // Metodo que deleta um arquivo de upload
  deleteFile(url: string) {
    const file = url.split(env.files.uploadsUrl)[1]
    if (file != 'system/default.png') {
      fs.unlinkSync(env.files.uploadsPath + file)
    }
  }

  // Metodo que gera o token do usuario
  gerarToken(valor: string) {
    return jsonwebtoken.sign({ valor: valor }, env.security.secret, {
      expiresIn: '1h',
    })
  }

  // Metodo que gera o token do usuario
  decryptToken(valor: string) {
    return jsonwebtoken.verify(valor, env.security.secret)
  }

  // Metodo que critografar valores
  encrypt(valor: string) {
    return bcrypt.hash(valor, env.security.saltRounds)
  }

  // Metodo que compara o hash
  compareCrypt(data: string, encrypted: string) {
    return bcrypt.compare(data, encrypted)
  }

  // Metodo que criar folders
  defaultFolder(folder: string) {
    if (!fs.existsSync(folder)) {
      shell.mkdir('-p', folder)
    }
  }

  // Metodo gerador de nome
  generateName() {
    const date = new Date().valueOf();
    let text = '';
    const possibleText =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      text += possibleText.charAt(
        Math.floor(Math.random() * possibleText.length)
      );
    }
    return date + '.' + text;
  }
}

export default new Utils();
