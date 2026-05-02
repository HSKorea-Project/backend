import { 
    IsBoolean, 
    IsDateString, 
    IsEnum, 
    IsNotEmpty, 
    IsOptional, 
    IsString, 
    IsInt, 
    Min, 
    Max, 
    Equals, 
    Matches, 
    MinLength
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { Transform } from "class-transformer";
import { ServiceType } from "./inquiry.entity";
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsPasswordComfirm } from "src/global/common/utils/password-confirm.vaildator";

// 견적 문의 생성
export class CreateInquiryDTO {
    // 고객사명
    @ApiProperty({
        description: '고객사 명',
        example: 'HSKorea',
    })
    @IsNotEmpty()
    @IsString()
    companyName: string;

    // 고객명
    @ApiProperty({
        description: '고객명',
        example: '양우영',
    })
    @IsNotEmpty()
    @IsString()
    customerName: string;

    //휴대폰 번호
    @ApiProperty({
        description: '휴대폰 번호',
        example: '010-9179-7217',
    })
    @IsNotEmpty()
    @IsString()
    phone: string;

    // 출발지 주소
    @ApiProperty({
        description: '출발지 주소',
        example: '경기도 화성시 봉담읍 샘마을길 58',
    })
    @IsString()
    @IsNotEmpty()
    fromAddress: string;

    // 도착지 주소
    @ApiProperty({
        description: '도착지 주소',
        example: '경기도 시흥시 정왕동 ',
    })
    @IsNotEmpty()
    @IsString()
    toAddress: string;

    // 평수/인원수
    @ApiProperty({
        description: '평수/인원수',
        example: '100평',
    })
    @IsNotEmpty()
    @IsString()
    spaceInfo: string;

    // 이사 예정일
    @ApiProperty({
        description: '이사 예정일',
        example: '2026-07-07',
    })
    @IsNotEmpty()
    @IsDateString()
    moveDate: Date;

    // 서비스 유형
    @ApiProperty({
        description: '서비스 유형',
        example: 'WAREHOUSE_MOVE',
    })  
    @IsEnum(ServiceType)
    serviceType: ServiceType;

    // 폐기물 처리
    @ApiProperty({
        description: '폐기물 처리',
        example: 'true',
    })  
    @Transform(({ value }) => value === true ||value === 'true')
    @IsBoolean()
    wasteDisposal: boolean;

    // 에어컨 설치
    @ApiProperty({
        description: '에어컨 설치',
        example: 'true',
    }) 
    @Transform(({ value }) => value === true ||value === 'true')
    @IsBoolean()
    acInstallation: boolean;

    // 문의 내용
    @ApiProperty({
        description: '문의 내용',
        example: '이사 짐 관련해서 문의 드릴려고 합니다!',
    }) 
    @IsOptional()
    @IsString()
    contents?: string;

    // 파일 URL
    @ApiProperty({
        description: '파일 URL',
        example: 'https://amazon.....',
    }) 
    @IsOptional()
    @IsString()
    fileUrl?: string;
    
    // 파일명
    @IsOptional()
    @IsString()
    fileName?: string;

    // 비밀번호
    @ApiProperty({
        description: '비밀번호',
        example: 'qkqwhgdk',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    passwordHash: string;

    // 비밀번호 재확인
    @ApiProperty({
        description: '비밀번호 재확인',
        example: 'qkqwhgdk',
    })
    @IsString()
    @IsPasswordComfirm()
    passwordConfirm: string;

    // 약관동의
    @ApiProperty({
        description: '약관 동의',
        example: 'true',
    })
    @Transform(({ value }) => value === 'true' || value === true )
    @IsBoolean()
    @Equals(true)
    agreement: boolean;
}

// 견적 문의 수정 - 휴대폰 번호는 제외
export class UpdateInquiryDTO extends PartialType(
    OmitType(CreateInquiryDTO, ['phone'] as const)
) {}

// 견적 전체 조회 (페이지네이션)
export class PaginationDTO {
    @IsOptional()
    @Type(() => Number) // TODO: Query String -> Number로 변환
    @IsInt()
    @Min(1) // 0 또는 음수 방지
    page: number = 1; // 1페이지씩 시작

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 10; // 한 페이지에 10개
}


// 목록 조회 응답
export class InquiryListResponseDTO {
    inquiryId: string;
    companyName: string;
    customerName: string;
    serviceType: ServiceType;
    moveDate: Date;
    createdAt: Date;
}

// 견적 검색
export class SearchInquiryDTO extends PaginationDTO {
    @IsString()
    keyword?: string;
}

// 스웨거 - 단건 조회/생성/수정 응답
export class InquiryResponseDTO {
    inquiryId: string;
    companyName: string;
    customerName: string;
    phone: string;
    fromAddress: string;
    toAddress: string;
    spaceInfo: string;
    moveDate: Date;
    serviceType: ServiceType;
    wasteDisposal: boolean;
    acInstallation: boolean;
    contents?: string;
    fileUrl?: string;
    agreement: boolean;
    createdAt: Date;
    updatedAt: Date;
}
