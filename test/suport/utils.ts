import utils from '../../src/utils/utils'

class UtilsTest{

    deleteFolder(paths = []){
        paths.forEach((path)=>{
            utils.deleteFolder(path)
        })
    }
}

export default new UtilsTest()