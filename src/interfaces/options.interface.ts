/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Interface utilizado principalmente na Class ControllerBase 
 * localizado em ´@/utils/controllerBase.ts´
 * @Callback exportação da interface Options
*/

interface Options {
    basePath?: string
    skipLinks?: boolean
    query?: string
    url?: string
    page?: number
    pageSize?: number
    count?: number
    excludeFields?: Array<string>
}

export default Options