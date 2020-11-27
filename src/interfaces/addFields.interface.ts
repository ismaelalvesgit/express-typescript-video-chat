/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Interface utilizado principalmente na Class ControllerBase 
 * localizado em ´@/utils/controllerBase.ts´
 * @Callback exportação da interface AddFields
*/
interface AddFields {
    user?: boolean
    path?: string
    params?: string
    ip?: string
}

export default AddFields