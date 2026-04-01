import { HttpException } from '@nestjs/common';
import { ERROR_CODE } from './error.code';

export type ErrorCodeType = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export class CustomException extends HttpException {
  constructor(error: ErrorCodeType) {
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
  constructor(error: ErrorCodeType = ERROR_CODE.BAD_REQUEST) {
    super(error);
  }
}

// 401 Unauthorized
export class UnauthorizedException extends CustomException {
  constructor(error: ErrorCodeType = ERROR_CODE.UNAUTHORIZED) {
    super(error);
  }
}

// 403 Forbidden
export class ForbiddenException extends CustomException {
  constructor(error: ErrorCodeType = ERROR_CODE.FORBIDDEN) {
    super(error);
  }
}

// 404 Not Found
export class NotFoundException extends CustomException {
  constructor(error: ErrorCodeType = ERROR_CODE.NOT_FOUND) {
    super(error);
  }
}

// 500 Internal Server Error
export class InternalServerException extends CustomException {
  constructor(error: ErrorCodeType = ERROR_CODE.INTERNAL_SERVER_ERROR) {
    super(error);
  }
}