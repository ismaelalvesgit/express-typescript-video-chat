/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Class utilizada como class base para os demais models localizados em ´@/models/*.ts´
 * @Callback exportação da class BaseModel
*/

import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

abstract class BaseModel extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @CreateDateColumn({ type: "timestamp" })
    dataRegistro!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    dataAtualizacao!: Date;

    toJson() { }

    fromJson(init: any) { }
}

export default BaseModel