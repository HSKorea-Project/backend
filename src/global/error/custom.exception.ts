import { HttpException, HttpStatus } from '@nestjs/common';

type ErrorCode = {
  status: number;
  errorCode: string;
  reason: string;
};

export class CustomException extends HttpException {
  // 400 Bad Request
  static readonly BAD_REQUEST: ErrorCode = {
    status: HttpStatus.BAD_REQUEST,
    errorCode: 'BAD_REQUEST',
    reason: '잘못된 요청입니다',
  };

  // 401 Unauthorized
  static readonly UNAUTHORIZED: ErrorCode = {
    status: HttpStatus.UNAUTHORIZED,
    errorCode: 'UNAUTHORIZED',
    reason: '인증에 실패했습니다',
  };

  // 403 Forbidden
  static readonly FORBIDDEN: ErrorCode = {
    status: HttpStatus.FORBIDDEN,
    errorCode: 'FORBIDDEN',
    reason: '접근 권한이 없습니다',
  };

  // 404 Not Found
  static readonly NOT_FOUND: ErrorCode = {
    status: HttpStatus.NOT_FOUND,
    errorCode: 'NOT_FOUND',
    reason: '리소스를 찾을 수 없습니다',
  };

  static readonly USER_NOT_FOUND: ErrorCode = {
    status: HttpStatus.NOT_FOUND,
    errorCode: 'USER_NOT_FOUND',
    reason: '사용자를 찾을 수 없습니다',
  };

  // 500 Internal Server Error
  static readonly INTERNAL_SERVER_ERROR: ErrorCode = {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: 'INTERNAL_SERVER_ERROR',
    reason: '서버 내부 오류가 발생했습니다',
  };

  constructor(error: ErrorCode) {
    super(
      {
        resultType: 'FAIL',
        code: error.status,
        errorCode: error.errorCode,
        reason: error.reason,
        data: null,
      },
      error.status,
    );
  }
}

// 400 Bad Request
export class BadRequestException extends CustomException {
  constructor(error: ErrorCode = CustomException.BAD_REQUEST) {
    super(error);
  }
}

// 401 Unauthorized
export class UnauthorizedException extends CustomException {
  constructor(error: ErrorCode = CustomException.UNAUTHORIZED) {
    super(error);
  }
}

// 403 Forbidden
export class ForbiddenException extends CustomException {
  constructor(error: ErrorCode = CustomException.FORBIDDEN) {
    super(error);
  }
}

// 404 Not Found
export class NotFoundException extends CustomException {
  constructor(error: ErrorCode = CustomException.NOT_FOUND) {
    super(error);
  }
}

// 500 Internal Server Error
export class InternalServerException extends CustomException {
  constructor(error: ErrorCode = CustomException.INTERNAL_SERVER_ERROR) {
    super(error);
  }
}
