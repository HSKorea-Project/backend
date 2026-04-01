//에러 정의서
import { HttpStatus } from '@nestjs/common';

export const ERROR_CODE = {
  // 400 Bad Request
  BAD_REQUEST: {
    status: HttpStatus.BAD_REQUEST,
    errorCode: 'BAD_REQUEST',
    reason: '잘못된 요청입니다',
  },

  // 401 Unauthorized
  UNAUTHORIZED: {
    status: HttpStatus.UNAUTHORIZED,
    errorCode: 'UNAUTHORIZED',
    reason: '인증에 실패했습니다',
  },

  // 403 Forbidden
  FORBIDDEN: {
    status: HttpStatus.FORBIDDEN,
    errorCode: 'FORBIDDEN',
    reason: '접근 권한이 없습니다',
  },

  // 404 Not Found
  NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    errorCode: 'NOT_FOUND',
    reason: '리소스를 찾을 수 없습니다',
  },

  USER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    errorCode: 'USER_NOT_FOUND',
    reason: '사용자를 찾을 수 없습니다',
  },

  // 500 Internal Server Error
  INTERNAL_SERVER_ERROR: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: 'INTERNAL_SERVER_ERROR',
    reason: '서버 내부 오류가 발생했습니다',
  },
} as const;