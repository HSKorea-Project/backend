//성공 응답 형식 통일
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => ({
        resultType: 'SUCCESS',
        message: data?.message ?? '요청 성공',
        data: data?.data ?? null,
        })),
    );
  }
}