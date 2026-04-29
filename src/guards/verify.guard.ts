import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class PhoneVerifiedGaurd implements CanActivate{
    canActivate(context: ExecutionContext): boolean{
        const req = context.switchToHttp().getRequest();
        if (!req.session?.phoneVerified) throw new ForbiddenException('휴대폰 인증이 필요합니다.');
        return true;
    }
}