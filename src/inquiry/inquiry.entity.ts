import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ServiceType{
    HOME_MOVE = 'HOME_MOVE', // 가정
    OFFICE_MOVE = 'OFFICE_MOVE', // 사무실/관공서
    SCHOOL_MOVE = 'SCHOOL_MOVE', // 학교
    WAREHOUSE_MOVE = 'WAREHOUSE_MOVE', // 물류 창고
    HOSPITAL_MOVE = 'HOSPITAL_MOVE', // 병원 
    LAB_MOVE = 'LAB_MOVE', // 실험실
    FACTORY_MOVE = 'FACTORY_MOVE', // 공장
    COMMERCIAL_MOVE = 'COMMERCIAL_MOVE', //상업 시설
    ETC_MOVE = 'ETC_MOVE', // 기타
}

@Entity('Inquiry')
export class InquiryEntity extends BaseEntity{
    
    @PrimaryGeneratedColumn('uuid')
    inquiryId: string;

    @Column({
        type: 'varchar', 
        length: 50, 
        nullable: false, 
        comment: '고객사명'
    })
    companyName: string;

    @Column({
        type: 'varchar', 
        length: 10, 
        nullable: false, 
        comment: '고객명'
    })
    customerName: string;

    @Column({
        type: 'varchar', 
        length: 20, 
        nullable: false, 
        comment: '휴대폰 번호'
    })
    phone: string;

    @Column({
        type: 'timestamp', 
        nullable: true, // 임시로 true로 설정
        comment: '휴대폰 인증 시간'
    })
    expiredAt: Date;

    @Column({
        type: 'varchar', 
        length: 255, 
        nullable: false, 
        comment: '출발지 주소'})
    fromAddress: string;

    @Column({
        type: 'varchar', 
        length: 255, 
        nullable: false, 
        comment: '도착지 주소'
    })
    toAddress: string;

    @Column({
        type: 'varchar', 
        length: 50, 
        nullable: false, 
        comment: '평수/인원수'
    })
    spaceInfo: string;

    @Column({
        type: 'date', 
        nullable: false, 
        comment: '이사 예정일'
    })
    moveDate: Date;

    @Column({
        type: 'enum', 
        enum: ServiceType, 
        nullable: false, 
        comment: '서비스 유형'
    })
    serviceType: ServiceType;

    @Column({
        type: 'boolean', 
        default:false, 
        nullable: false, 
        comment: '폐기물 처리'
    })
    wasteDisposal: boolean;

    @Column({
        type: 'boolean', 
        default:false, 
        nullable: false, 
        comment: '에어컨 설치'
    })
    acInstallation: boolean;

    @Column({
        type: 'text', 
        nullable: true, 
        comment: '문의 내용'
    })
    contents: string;

    @Column({
        type: 'varchar',
        length: 500, 
        nullable: true, 
        comment: '파일 URL'
    })
    fileUrl: string;

    @Column({
        type: 'varchar',
        length: 255, 
        nullable: false, 
        comment: '비밀번호'
    })
    passwordHash: string;

    @Column({
        type: 'boolean', 
        default: false, 
        nullable: false, 
        comment: '약관동의'
    })
    agreement: boolean;

    @CreateDateColumn({
        type: 'timestamp',
        nullable: false,
        comment: '생성일'
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        nullable: true,
        comment: '수정일'
    })
    updatedAt: Date;

}