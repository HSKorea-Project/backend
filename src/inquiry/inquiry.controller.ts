import { 
    Controller, 
    Delete, 
    Get,
    Patch, 
    Post, 
    Query, 
    UploadedFile,
    UseInterceptors, 
    Body, 
    Param,
    UseGuards
} from "@nestjs/common";
import { InquiryService } from "./inquiry.service";
import { 
    CreateInquiryDTO, 
    PaginationDTO, 
    UpdateInquiryDTO, 
    InquiryResponseDTO, 
    InquiryListResponseDTO, 
    SearchInquiryDTO 
} from "./inquiry.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { BadRequestException } from "src/global/error/custom.exception";
import { ApiResponse } from "@nestjs/swagger";
import { UserGuard, AdminGuard } from "../guards";
import { userInfo } from "os";

const FILE_UPLOAD_OPTIONS = {
    limits: { fileSize: 10 * 1024 * 1024 }, //10M로 제한
    fileFilter: (req, file, callback) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new BadRequestException('pdf, jpeg, png만 업로드 가능합니다'), false);
        }
    }
};

@Controller('inquiry')
export class InquiryController {
    constructor(private readonly inquiryService: InquiryService) {}
    
    // 전체 문의 목록 조회
    @Get('/list')
    @ApiResponse({ type: InquiryListResponseDTO, isArray: true })
    async findAll(@Query() paginationDTO: PaginationDTO) {
        return this.inquiryService.findAll(paginationDTO);
    }
    
    // 견적 문의 검색
    @Get('/search')
    @ApiResponse({ type: InquiryListResponseDTO, isArray: true })
    async search(@Query() searchInquiryDTO: SearchInquiryDTO){
        return this.inquiryService.search(searchInquiryDTO);
    }
    
    // 견적 문의 조회
    @Get('/:inquiryId')
    @ApiResponse({ type: InquiryResponseDTO })
    @UseGuards(UserGuard)
    async findOne (
        @Param('inquiryId') inquiryId: string
    ){
        return this.inquiryService.findOne(inquiryId)
    }
    
    // 견적 문의 생성
    @Post()
    @ApiResponse({ type: InquiryResponseDTO })
    @UseInterceptors(FileInterceptor('fileUrl', FILE_UPLOAD_OPTIONS))
    async create(
        @Body() createInquiryDTO : CreateInquiryDTO,
        @UploadedFile() file?: Express.Multer.File
    ){
        return this.inquiryService.create(createInquiryDTO, file)
    }

    // 견적 문의 수정
    @Patch('/:inquiryId')
    @ApiResponse({ type: InquiryResponseDTO })
    @UseInterceptors(FileInterceptor('fileUrl', FILE_UPLOAD_OPTIONS))
    @UseGuards(UserGuard)
    async update(
        @Param('inquiryId') inquiryId: string,
        @Body() updateInquiryDTO : UpdateInquiryDTO,
        @UploadedFile() file?: Express.Multer.File
    ){
        return this.inquiryService.update(inquiryId, updateInquiryDTO, file)
    }

    // 견적 문의 삭제
    @Delete('/:inquiryId')
    @UseGuards(UserGuard)
    async remove(
        @Param('inquiryId') inquiryId: string,
    ){
        return this.inquiryService.remove(inquiryId)
    }

}