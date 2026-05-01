import { PutObjectCommand, S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileUploadRequest } from "solapi";
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class S3Service{
    private s3Client: S3Client
    constructor(private config: ConfigService) {
        this.s3Client = new S3Client({
            region: this.config.get<string>('S3_REGION')!, //undefined로 반환
            credentials: {
                accessKeyId: this.config.get<string>('S3_ACCESSKEY')!,
                secretAccessKey: this.config.get<string>('S3_SECRETKEY')!,
            }
        })
    }

    // S3 업로드
    async uploadFile(file: Express.Multer.File): Promise<{fileUrl: string, fileName: string}> {
        const fileName = `${uuidv4()}_${file.originalname}` // S3 업로드 할때 uuid_파일명으로 저장
        const bucket = this.config.get<string>('S3_BUCKET_NAME')!
        const region = this.config.get<string>('S3_REGION')!

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(file.originalname)}`// 관리자는 파일명.pdf로 다운
        })

        await this.s3Client.send(command)
        return {
            fileUrl: `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`,
            fileName: file.originalname
        };
    }

    // S3 파일 삭제
    async deleteFile(fileUrl: string): Promise<void> {
        // uuid만 확인하여 파일 삭제
        const key = fileUrl.split('/').pop() // URL의 마지막 부분 추출
        const bucket = this.config.get<string>('S3_BUCKET_NAME')!
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        })
        await this.s3Client.send(command)
    }

}
