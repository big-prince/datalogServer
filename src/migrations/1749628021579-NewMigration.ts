import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1749628021579 implements MigrationInterface {
    name = 'NewMigration1749628021579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "dailyDataUsage"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "dailyDataUsage" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "dailyDataUsage"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "dailyDataUsage" double precision`);
    }

}
