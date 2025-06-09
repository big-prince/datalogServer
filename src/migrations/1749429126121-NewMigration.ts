import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1749429126121 implements MigrationInterface {
    name = 'NewMigration1749429126121'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "data_log" DROP CONSTRAINT "FK_1254497ad82d7debac2e8537622"`);
        await queryRunner.query(`ALTER TABLE "data_log" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "sim" DROP CONSTRAINT "FK_d465ce4bafe6de350e403772218"`);
        await queryRunner.query(`ALTER TABLE "sim" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "sim" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "setting" DROP CONSTRAINT "FK_bbcafb8c4c78d890f75caa632d5"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "REL_94f168faad896c0786646fa3d4"`);
        await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "token" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "UQ_94f168faad896c0786646fa3d4a" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD CONSTRAINT "FK_1254497ad82d7debac2e8537622" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sim" ADD CONSTRAINT "FK_d465ce4bafe6de350e403772218" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "setting" ADD CONSTRAINT "FK_bbcafb8c4c78d890f75caa632d5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP CONSTRAINT "FK_bbcafb8c4c78d890f75caa632d5"`);
        await queryRunner.query(`ALTER TABLE "sim" DROP CONSTRAINT "FK_d465ce4bafe6de350e403772218"`);
        await queryRunner.query(`ALTER TABLE "data_log" DROP CONSTRAINT "FK_1254497ad82d7debac2e8537622"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "UQ_94f168faad896c0786646fa3d4a"`);
        await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "token" ADD "userId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "REL_94f168faad896c0786646fa3d4" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "setting" ADD CONSTRAINT "FK_bbcafb8c4c78d890f75caa632d5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sim" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "sim" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "sim" ADD CONSTRAINT "FK_d465ce4bafe6de350e403772218" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "data_log" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD CONSTRAINT "FK_1254497ad82d7debac2e8537622" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
