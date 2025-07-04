import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1751598243448 implements MigrationInterface {
    name = 'NewMigration1751598243448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_preference" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "purchasePreferences" json, "aiSettings" json, "customInsights" json, "onboardingCompleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_5b141fbd1fef95a0540f7e7d1e" UNIQUE ("userId"), CONSTRAINT "PK_0532217bd629d0ccf06499c5841" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_preference" ADD CONSTRAINT "FK_5b141fbd1fef95a0540f7e7d1e2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_preference" DROP CONSTRAINT "FK_5b141fbd1fef95a0540f7e7d1e2"`);
        await queryRunner.query(`DROP TABLE "user_preference"`);
    }

}
