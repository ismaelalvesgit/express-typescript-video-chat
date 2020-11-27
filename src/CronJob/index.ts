/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Utilizado para execução de job cronometrados de acordo com 
 * a data traspasada para consultar datas periodicas clique aqui https://cronjob.xyz/
*/
import { CronJob } from 'cron'
const timezone = process.env.TZ

new CronJob('* * * * *', async ()=>{
    console.log("Cron job: ",new Date())
}, null, true, timezone)