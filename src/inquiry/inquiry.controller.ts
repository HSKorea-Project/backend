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
    UseGuards,
    UsePipes,
    Request
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
import { ApiResponse } from "@nestjs/swagger";
import { UserGuard } from "../guards";
import { ApiCookieAuth } from '@nestjs/swagger';

import type { Request as Req } from 'express';
import { FILE_UPLOAD_OPTIONS, INQUIRY_VALIDATION_PIPE } from "./inquiry.pipe";
import { PhoneVerifiedGaurd } from "../guards/verify.guard";

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
    @ApiCookieAuth('connect.sid')
    @UseGuards(UserGuard)
    async findOne (
        @Param('inquiryId') inquiryId: string,
        @Request() req: Req, //세션에서 관리자 여부 확인
    ){
        const isAdmin = req.session?.user?.role === 'admin';
        return this.inquiryService.findOne(inquiryId, isAdmin);
    }
    
    // 견적 문의 생성
    @Post()
    @ApiResponse({ type: InquiryResponseDTO })
    @UseInterceptors(FileInterceptor('fileUrl', FILE_UPLOAD_OPTIONS))
    @UsePipes(INQUIRY_VALIDATION_PIPE)
    @UseGuards(PhoneVerifiedGaurd)
    async create(
        @Body() createInquiryDTO : CreateInquiryDTO,
        @UploadedFile() file?: Express.Multer.File,
    ){
        return this.inquiryService.create(createInquiryDTO, file)
    }

    // 견적 문의 수정
    @Patch('/:inquiryId')
    @ApiResponse({ type: InquiryResponseDTO })
    @ApiCookieAuth('connect.sid')
    @UseInterceptors(FileInterceptor('fileUrl', FILE_UPLOAD_OPTIONS))
    @UseGuards(UserGuard)
    @UsePipes(INQUIRY_VALIDATION_PIPE)
    async update(
        @Param('inquiryId') inquiryId: string,
        @Body() updateInquiryDTO : UpdateInquiryDTO,
        @UploadedFile() file?: Express.Multer.File
    ){
        return this.inquiryService.update(inquiryId, updateInquiryDTO, file)
    }

    // 견적 문의 삭제
    @Delete('/:inquiryId')
    @ApiCookieAuth('connect.sid')
    @UseGuards(UserGuard)
    async remove(
        @Param('inquiryId') inquiryId: string,
    ){
        return this.inquiryService.remove(inquiryId)
    }

}