import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1749686083575 implements MigrationInterface {
    name = 'NewMigration1749686083575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "notificationPrefs"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "dailyDataUsage"`);
        await queryRunner.query(`ALTER TABLE "sim" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sim" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "dailyUsageEstimate" numeric(10,2)`);
        await queryRunner.query(`CREATE TYPE "public"."setting_usageunit_enum" AS ENUM('GB', 'MB')`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "usageUnit" "public"."setting_usageunit_enum" NOT NULL DEFAULT 'GB'`);
        await queryRunner.query(`CREATE TYPE "public"."setting_preferreddisplayunit_enum" AS ENUM('GB', 'MB')`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "preferredDisplayUnit" "public"."setting_preferreddisplayunit_enum" NOT NULL DEFAULT 'GB'`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "notifications" json NOT NULL DEFAULT '{"expiryReminders":true,"highUsageWarnings":false,"usageSummaries":false}'`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sim" ALTER COLUMN "phoneNumber" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sim" DROP CONSTRAINT "UQ_d4669399f99f93909b5c873f6c3"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP CONSTRAINT "FK_bbcafb8c4c78d890f75caa632d5"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD CONSTRAINT "UQ_bbcafb8c4c78d890f75caa632d5" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "setting" ADD CONSTRAINT "FK_bbcafb8c4c78d890f75caa632d5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" DROP CONSTRAINT "FK_bbcafb8c4c78d890f75caa632d5"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP CONSTRAINT "UQ_bbcafb8c4c78d890f75caa632d5"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD CONSTRAINT "FK_bbcafb8c4c78d890f75caa632d5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sim" ADD CONSTRAINT "UQ_d4669399f99f93909b5c873f6c3" UNIQUE ("phoneNumber")`);
        await queryRunner.query(`ALTER TABLE "sim" ALTER COLUMN "phoneNumber" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "notifications"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "preferredDisplayUnit"`);
        await queryRunner.query(`DROP TYPE "public"."setting_preferreddisplayunit_enum"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "usageUnit"`);
        await queryRunner.query(`DROP TYPE "public"."setting_usageunit_enum"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "dailyUsageEstimate"`);
        await queryRunner.query(`ALTER TABLE "sim" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "sim" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "dailyDataUsage" integer`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "notificationPrefs" json`);
    }

}
