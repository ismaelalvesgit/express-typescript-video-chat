/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Interface utilizado principalmente na Class ControllerBase 
 * localizado em ´@/utils/controllerBase.ts´
 * @Callback exportação da interface RequestFile
*/

interface RequestFile {
    typeUpload: "single" | "multiple"
    files: Array<{ field: string, path: string }>
}

export default RequestFile