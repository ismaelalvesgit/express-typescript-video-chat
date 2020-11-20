import { Entity, Column, AfterInsert, BeforeInsert, BeforeUpdate, BeforeRemove } from "typeorm";
import { IsEmail, IsNotEmpty, MinLength, IsISO8601, IsIn } from "class-validator"
import BaseModel from "./baseModel";
import TipoUsuario from "@enum/TipoUsuario";
import env from "@config/env";
import utils from "@utils/utils";
import Upload from "./upload";

function enumToArrayNumber(type: any): Array<number> {
  const keys = Object.keys(type).filter(k => typeof type[k as any] === "number"); // ["A", "B"]
  const values = keys.map(k => parseInt(type[k as any])); // [0, 1]
  return values != null ? values : [];
}

@Entity()
class Usuario extends BaseModel {

  constructor(init?: Partial<Usuario>){
    super();
    Object.assign(this, init);
  }
  
  @Column()
  @IsNotEmpty({
    message: "Nome e requerido"
  })
  nome!: string;

  @Column({
    unique: true,
  })
  @IsEmail({}, {
    message: "Email não está valido"
  })
  @IsNotEmpty({
    message: "Email e requerido"
  })
  email!: string

  @Column({select: false})
  @IsNotEmpty({
    message: "Senha e requerida"
  })
  @MinLength(6, {
    message: "Senha deve conter no minimo 6 caracteres"
  })
  senha?: string;

  @Column({
    enum: enumToArrayNumber(TipoUsuario),
    default: TipoUsuario.CLIENT
  })
  tipoUsuario!: TipoUsuario;

  @Column({
    default: env.files.user
  })
  foto!:string;

  @Column({
    nullable: true
  })
  reset!:string;

  @Column()
  @IsISO8601({}, {
    message: "Data de nascimento não e uma data valida"
  })
  @IsNotEmpty({
    message: "Data de nascimento e requerido"
  })
  dataNascimento!: Date;

  toJson(): Usuario {
    delete this.senha
    return this
  }

  fromJson(init?: Partial<Usuario>){
    Object.assign(this, init);
  }

  @BeforeInsert()
  async BeforeInsert(){
    if(this.senha){
      this.senha = await utils.encrypt(this.senha)
    }
  }

  @BeforeUpdate()
  async BeforeUpdate(){
    if(this.senha){
      this.senha = await utils.encrypt(this.senha)
    }
  }

  @BeforeRemove()
  async BeforeRemove(){
    Upload.delete({idObjeto: this.id})
  }
}

export default Usuario;
