//@Author ismael alves
import { format, addDays } from 'date-fns'

export default [
    {
        nome: `ismael alves ${new Date()}`, 
        email:"admin@admin.com", 
        senha:"123456",
        descricao: "descricao 01",
        dataNascimento: `${format(addDays(new Date('2002-06-22'), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")}`,   
        foto: './test/fixtures/assets/test.png',
    },
    {
        nome: `raquel barra ${new Date()}`, 
        email:"test@admin.com", 
        senha:"123456",
        dataNascimento: `${format(addDays(new Date('2002-06-22'), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")}`, 
    }
]