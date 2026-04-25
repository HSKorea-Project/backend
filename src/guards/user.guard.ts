import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    console.log(req.session);

    const postId = req.params.inquiryId;

    const isAdmin = req.session?.user?.role === 'admin';
    const hasAccess = req.session?.inquiryAuth?.[postId];

    if (isAdmin || hasAccess) {
      return true;
    }

    throw new ForbiddenException('게시글 접근 권한이 없습니다.');
  }
}