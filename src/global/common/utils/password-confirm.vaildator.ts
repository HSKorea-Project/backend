// 비밀번호 두 값이 일치하는 커스텀 validator
import { registerDecorator, ValidationArguments } from "class-validator";

export function IsPasswordComfirm(){
    return function (object: object, propertyName: string){
        registerDecorator({
            name: 'isPasswordConfirm',
            target: object.constructor,
            propertyName,
            validator: {
                validate(value: string, args: ValidationArguments) {
                    const obj = args.object as any;
                    return value === obj.passwordHash;
                },
                defaultMessage() {
                    return '해당 비밀번호가 일치하지 않습니다.';
                },
            },
        });       
    };
}