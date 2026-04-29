import { ValidationPipe } from "@nestjs/common";
import { BadRequestException } from "src/global/error/custom.exception";
import { IsPasswordComfirm } from "../global/common/utils/password-confirm.vaildator";
import { fileUploadRequestSchema } from "solapi";

// 필수 항목 검증 pipe
const FIELD_NAME_MAP: Record<string, string> = {
    companyName: '고객사명',
    customerName: '고객명',
    phone: '휴대폰 번호',
    fromAddress: '출발지 주소',
    toAddress: '도착지 주소',
    spaceInfo: '평수/인원수',
    moveDate: '이사 예정일',
    serviceType: '서비스 유형',
    passwordHash: '비밀번호',
    passwordConfirm: '비밀번호 확인',
    agreement: '약관 동의',
}

const FORMAT_MESSAGE_MAP: Record<string, string> = {
    minLength: '비밀번호는 최소 4자 이상이어야 합니다.',
    matches: '입력 형식이 올바르지 않습니다.',
    IsPasswordComfirm: '비밀번호가 일치하지 않습니다.'
};

// 파일 관련 pipe - pdf, png, jpg, jpeg, webp만 업로드하도록 구성
export const FILE_UPLOAD_OPTIONS = {
    limits: { fileSize: 10 * 1024 * 1024 }, //10M로 제한
    fileFilter: (req, file, callback) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new BadRequestException('pdf, png, jpg, jpeg, webp만 업로드 가능합니다'), false);
        }
    }
};


export const INQUIRY_VALIDATION_PIPE = new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (err) => {
        const emptyErrors = err.filter(e =>
            Object.keys(e.constraints ?? {}).some(k => k === 'isNotEmpty' || k === 'isEnum' || k === 'equals' )
        );
        const formatErrors = err.filter(e =>
            Object.keys(e.constraints ?? {}).some(k => k === 'minLength' || k === 'matches' || k === 'isPasswordConfirm')
        );
        if (emptyErrors.length > 0) {
            const fields = emptyErrors.map(e => FIELD_NAME_MAP[e.property] ?? e.property).join(', ');
            return new BadRequestException(`필수 항목을 모두 입력해주세요.(${fields})`, 'MISSING_REQUIRED_FIELD');
        }
        const reason = FORMAT_MESSAGE_MAP[Object.keys(formatErrors[0]?.constraints ?? {})[0]] ?? '입력값을 확인해주세요.';
        return new BadRequestException(reason, 'INVALID_FORMAT');
    }
});