/**
 * @DateModification 27/01/2020
 * @Author Ismael Alves
 * @Description Class utilizada somente para validação de dados no controller auth utilizada 
 * somente no arquivo localizado `@/controllers/auth.controller.ts`
 * @Callback exportação da instancia AuthValidator
*/

import { body } from 'express-validator'

class AuthValidator {

    loginValidator() {
        return [
            body('senha')
                .notEmpty().withMessage('senha e requirida')
                .isLength({ min: 6 }).withMessage('senha deve conter no minimo 6 caractres'),
            body('email')
                .isEmail().withMessage('email necesita ser valido :)')
                .notEmpty().withMessage('email e requirido')
        ]
    }

    resetSenhaValidator() {
        return [
            body('email')
                .isEmail().withMessage('email necesita ser valido :)')
                .notEmpty().withMessage('email e requirido')
        ]
    }
}

export default new AuthValidator()