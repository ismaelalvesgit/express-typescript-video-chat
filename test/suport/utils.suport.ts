import utils from '../../src/utils/utils'

class UtilsSuport{

    deleteFolder(paths: Array<string>){
        paths.forEach((path)=>{
            utils.deleteFolder(path)
        })
    }
}

export default new UtilsSuport()