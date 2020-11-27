/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Class utilizada como MODEL da entidade Upload utilizada principalmente no arquivo loclizado em `@utils/utils.ts` 
 * @Callback exportação da class Upload
*/

import { Column, Entity, ManyToOne } from "typeorm";
import BaseModel from "./baseModel";
import Usuario from "./usuario";

@Entity()
class Upload extends BaseModel {

    constructor(init?: Partial<Upload>) {
        super();
        Object.assign(this, init);
    }

    @Column()
    nome!: string;

    @Column()
    local!: string;

    @Column()
    extensao!: string;

    @Column()
    url!: string;

    @Column()
    model!: string;

    @Column()
    idObjeto!: number;

    @ManyToOne(type => Usuario, user => user.id, { cascade: ['remove', 'soft-remove'], onDelete: 'CASCADE' })
    usuario!: Usuario;

    fromJson(init?: Partial<Upload>) {
        Object.assign(this, init);
    }

}

export default Upload