//@Author ismael alves
import { body } from 'express-validator'

class AuthValidator{

    loginValidator(){
        return [
            body('senha')
                .notEmpty().withMessage('senha e requirida')
                .isLength({ min: 6 }).withMessage('senha deve conter no minimo 6 caractres'),
            body('email')
                .isEmail().withMessage('email necesita ser valido :)')
                .notEmpty().withMessage('email e requirido')
        ]
    }

    resetSenhaValidator(){
        return [
            body('email')
                .isEmail().withMessage('email necesita ser valido :)')
                .notEmpty().withMessage('email e requirido')
        ]
    }
}

export default new AuthValidator()