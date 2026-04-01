// 모든 에러를 최종적으로 처리하는 곳
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    return response.status(500).json({
      resultType: 'FAIL',
      code: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
      reason: '서버 내부 오류가 발생했습니다',
      data: null,
    });
  }
}