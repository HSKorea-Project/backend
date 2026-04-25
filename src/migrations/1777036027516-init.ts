import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1777036027516 implements MigrationInterface {
    name = 'Init1777036027516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "admin_id" character varying(50) NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_be447ce6638a8ca99cad5ef6a5c" UNIQUE ("admin_id"), CONSTRAINT "PK_519fa28e9620ff7e67759daa754" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."Inquiry_service_type_enum" AS ENUM('HOME_MOVE', 'OFFICE_MOVE', 'SCHOOL_MOVE', 'WAREHOUSE_MOVE', 'HOSPITAL_MOVE', 'LAB_MOVE', 'FACTORY_MOVE', 'COMMERCIAL_MOVE', 'ETC_MOVE')`);
        await queryRunner.query(`CREATE TABLE "Inquiry" ("inquiry_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_name" character varying(50) NOT NULL, "customer_name" character varying(10) NOT NULL, "phone" character varying(20) NOT NULL, "expired_at" TIMESTAMP, "from_address" character varying(255) NOT NULL, "to_address" character varying(255) NOT NULL, "space_info" character varying(50) NOT NULL, "move_date" date NOT NULL, "service_type" "public"."Inquiry_service_type_enum" NOT NULL, "waste_disposal" boolean NOT NULL DEFAULT false, "ac_installation" boolean NOT NULL DEFAULT false, "contents" text, "file_url" character varying(500), "password_hash" character varying(255) NOT NULL, "agreement" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_e194fbdeb879052b61a71690fd5" PRIMARY KEY ("inquiry_id")); COMMENT ON COLUMN "Inquiry"."company_name" IS '고객사명'; COMMENT ON COLUMN "Inquiry"."customer_name" IS '고객명'; COMMENT ON COLUMN "Inquiry"."phone" IS '휴대폰 번호'; COMMENT ON COLUMN "Inquiry"."expired_at" IS '휴대폰 인증 시간'; COMMENT ON COLUMN "Inquiry"."from_address" IS '출발지 주소'; COMMENT ON COLUMN "Inquiry"."to_address" IS '도착지 주소'; COMMENT ON COLUMN "Inquiry"."space_info" IS '평수/인원수'; COMMENT ON COLUMN "Inquiry"."move_date" IS '이사 예정일'; COMMENT ON COLUMN "Inquiry"."service_type" IS '서비스 유형'; COMMENT ON COLUMN "Inquiry"."waste_disposal" IS '폐기물 처리'; COMMENT ON COLUMN "Inquiry"."ac_installation" IS '에어컨 설치'; COMMENT ON COLUMN "Inquiry"."contents" IS '문의 내용'; COMMENT ON COLUMN "Inquiry"."file_url" IS '파일 URL'; COMMENT ON COLUMN "Inquiry"."password_hash" IS '비밀번호'; COMMENT ON COLUMN "Inquiry"."agreement" IS '약관동의'; COMMENT ON COLUMN "Inquiry"."created_at" IS '생성일'; COMMENT ON COLUMN "Inquiry"."updated_at" IS '수정일'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Inquiry"`);
        await queryRunner.query(`DROP TYPE "public"."Inquiry_service_type_enum"`);
        await queryRunner.query(`DROP TABLE "Admins"`);
    }

}
