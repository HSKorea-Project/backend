import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const postId = req.params.id;

    const isAdmin = req.session?.user?.role === 'admin';
    const hasAccess = req.session?.postAccess?.[postId];

    if (isAdmin || hasAccess) {
      return true;
    }

    throw new ForbiddenException('게시글 접근 권한이 없습니다.');
  }
}