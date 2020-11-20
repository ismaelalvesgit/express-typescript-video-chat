import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

abstract class BaseModel extends BaseEntity{

    @PrimaryGeneratedColumn()
    id!: number;
    
    @CreateDateColumn({type: "timestamp"})
    dataRegistro!: Date;
  
    @UpdateDateColumn({type: "timestamp"})
    dataAtualizacao!: Date;

    toJson(){}

    fromJson(init:any){}
}

export default BaseModel