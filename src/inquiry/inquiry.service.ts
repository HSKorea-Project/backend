import { ForbiddenException, Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InquiryEntity, Status } from "./inquiry.entity"
import { Like, Repository, DataSource } from "typeorm";
import { 
    CreateInquiryDTO, 
    UpdateInquiryDTO, 
    PaginationDTO, 
    SearchInquiryDTO 
} from "./inquiry.dto"
import { hash } from 'src/global/common/utils/bcrypt.util';
import { NotFoundException } from "src/global/error/custom.exception";
import { S3Service } from "src/global/s3/s3.service";

@Injectable()
export class InquiryService implements OnModuleInit{
    constructor(
        @InjectRepository(InquiryEntity)
        private readonly inquiryRepository: Repository<InquiryEntity>,
        private readonly s3Service: S3Service,
        private readonly dataSource: DataSource,
    ) {}

    async onModuleInit() {
        await this.dataSource.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
        await this.dataSource.query(`
            CREATE INDEX IF NOT EXISTS idx_inquiry_trgm
            ON "Inquiry"
            USING GIN (
                (coalesce(company_name, '') || ' ' || coalesce(customer_name, '')) gin_trgm_ops
            )    
        `);
    }

    // 견적 문의 전체 조회
    async findAll(paginationDTO: PaginationDTO) {
        const { page, limit } = paginationDTO;
        const skip = (page - 1) * limit; // Offset 적용함
        
        const [data, total] = await this.inquiryRepository.findAndCount({
            select: {
                inquiryId: true,
                isNew: true,
                companyName: true,
                customerName: true,
                moveDate: true,
                createdAt: true,
                status: true,
            },
            skip,
            take: limit,
            order: {createdAt: 'DESC'}
        });

        const totalPages = Math.ceil(total / limit);
        return{
            message: '견적 문의 목록 조회 성공',
            data: {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        };
    }

    // password 포함 내부 단건 조회 - update, remove
    private async findOneEntity(inquiryId: string): Promise<InquiryEntity>{
        const foundInquiry = await this.inquiryRepository.findOne({
            where: { inquiryId },
        });
        if (!foundInquiry) throw new NotFoundException('해당 문의를 찾을 수 없습니다.');
        return foundInquiry;
    }

    // password 미포함 외부 단건 조회 - 클라이언트 응답 시
    async findOne(inquiryId: string, isAdmin: boolean = false) {
        const inquiry = await this.findOneEntity(inquiryId);
        if (isAdmin && inquiry.isNew){
            await this.inquiryRepository.update(
                { inquiryId },
                { isNew: false }
            );
            inquiry.isNew = false;
        }
        // 비밀번호 제외하고 조회
        const { passwordHash, agreement, ...result} = inquiry;
        return { message: '조회 성공', data: result };
    }
    
    // 견적 문의 생성
    async create(createInquiryDTO: CreateInquiryDTO, file?: Express.Multer.File) {
        // 비밀번호 암호화
        const hashedPassword = await hash(createInquiryDTO.passwordHash);
        // 재할당 가능하도록 설정
        let fileUrl: string | undefined = undefined;
        let fileName: string | undefined = undefined;
        if(file) {
            const uploaded = await this.s3Service.uploadFile(file);
            fileUrl = uploaded.fileUrl;
            fileName = uploaded.fileName;
        }

        const newInquiry = this.inquiryRepository.create({
            ...createInquiryDTO,
            passwordHash: hashedPassword,
            fileUrl,
            fileName
        });
        
        await this.inquiryRepository.save(newInquiry);
        // 비밀번호는 반환 X
        const { passwordHash, agreement, ...result } = newInquiry;
        return { message: '해당 문의가 생성 되었습니다', data: result };
    }

    // 견적 문의 수정
    async update(inquiryId: string, updateInquiryDTO: UpdateInquiryDTO, file?: Express.Multer.File) {
        const inquiry = await this.findOneEntity(inquiryId);

        // 접수 완료/취소 상태일 때 수정 불가능
        if (inquiry.status !== Status.PENDING){
            throw new ForbiddenException('접수 완료/삭제된 문의는 수정할 수 없습니다.');
        }

        // 비밀번호가 있는 상태에서 재설정 가능
        if (updateInquiryDTO.passwordHash){
            updateInquiryDTO.passwordHash = await hash(updateInquiryDTO.passwordHash);
        }
        // 파일이 있는 상태에서 재설정 가능
        if (file){ // 새 파일 먼저 업로드
            const {fileUrl: newFileUrl, fileName: newFileName } = await this.s3Service.uploadFile(file);

            try{
                // DB 저장
                updateInquiryDTO.fileUrl = newFileUrl;
                updateInquiryDTO.fileName = newFileName;
                const updateInquiry = { ...inquiry, ...updateInquiryDTO };
                await this.inquiryRepository.save(updateInquiry);
                // DB 성공 후에 기존 파일은 삭제함
                if (inquiry.fileUrl) {
                    await this.s3Service.deleteFile(inquiry.fileUrl);
                }
                const { passwordHash, passwordConfirm, agreement, ...result } = updateInquiry; 
                return { message: '해당 문의가 수정되었습니다.', data: result };
            }catch (err){
                await this.s3Service.deleteFile(newFileUrl);
                throw err; 
            }
        }
        const updateInquiry = { ...inquiry, ...updateInquiryDTO };
        await this.inquiryRepository.save(updateInquiry);
        const { passwordHash, passwordConfirm, agreement, ...result } = updateInquiry; 
        return { message: '해당 문의가 수정되었습니다.', data: result };
    }

    // 견적 문의 삭제
    async remove(inquiryId: string): Promise<{ message: string }>{
        const inquiry = await this.findOneEntity(inquiryId);
        await this.inquiryRepository.remove(inquiry);

        return { message: '해당 문의가 삭제되었습니다.'};
    }

    // 견적 문의 검색
    async search(searchInquiryDTO: SearchInquiryDTO) {
        const { page, limit, keyword } = searchInquiryDTO;
        const skip = (page - 1) * limit;
        const searchQuery = this.inquiryRepository.createQueryBuilder('inquiry').select([
            'inquiry.inquiryId',
            'inquiry.companyName',
            'inquiry.customerName',
            'inquiry.serviceType',
            'inquiry.moveDate',
            'inquiry.createdAt',
            'inquiry.status',
        ])
        .orderBy('inquiry.createdAt', 'DESC')
        .skip(skip)
        .take(limit)

        if (keyword) {
            searchQuery.where(
                `replace(inquiry.company_name || inquiry.customer_name, ' ', '') ILIKE :keyword`,
                { keyword: `%${keyword.replace(/\s/g, '')}%` }
            );
        }

        const [data, total] = await searchQuery.getManyAndCount();
        const totalPages = Math.ceil(total / limit);
        return {
            message: '해당 문의가 검색되었습니다.',
            data: {
                data,
                meta: { 
                    total, 
                    page, 
                    limit, 
                    totalPages, 
                    hasNext: page < totalPages, 
                    hasPrev: page > 1 
                }
            }
        };
    }

    // 견적 문의 상태 변경
    async updateStatus(inquiryId: string, status: Status){
        const inquiry = await this.findOneEntity(inquiryId);
        inquiry.status = status;
        await this.inquiryRepository.save(inquiry);
        return { message: '상태가 변경되었습니다.', data: { inquiryId, status } };
    }
}