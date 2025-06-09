import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1749429494455 implements MigrationInterface {
    name = 'NewMigration1749429494455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "data_log" DROP CONSTRAINT "FK_77ca91bc2f0560d663cad2876c2"`);
        await queryRunner.query(`ALTER TABLE "data_log" DROP CONSTRAINT "PK_888f1e5257d322f9f878bd22576"`);
        await queryRunner.query(`ALTER TABLE "data_log" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD CONSTRAINT "PK_888f1e5257d322f9f878bd22576" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "data_log" DROP COLUMN "simId"`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD "simId" uuid`);
        await queryRunner.query(`ALTER TABLE "sim" DROP CONSTRAINT "PK_49fb2bc9d3a2b3fd0da14540b56"`);
        await queryRunner.query(`ALTER TABLE "sim" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "sim" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "sim" ADD CONSTRAINT "PK_49fb2bc9d3a2b3fd0da14540b56" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "setting" DROP CONSTRAINT "PK_fcb21187dc6094e24a48f677bed"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "setting" ADD CONSTRAINT "PK_fcb21187dc6094e24a48f677bed" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "PK_82fae97f905930df5d62a702fc9"`);
        await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "token" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD CONSTRAINT "FK_77ca91bc2f0560d663cad2876c2" FOREIGN KEY ("simId") REFERENCES "sim"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "data_log" DROP CONSTRAINT "FK_77ca91bc2f0560d663cad2876c2"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "PK_82fae97f905930df5d62a702fc9"`);
        await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "token" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "setting" DROP CONSTRAINT "PK_fcb21187dc6094e24a48f677bed"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD CONSTRAINT "PK_fcb21187dc6094e24a48f677bed" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "sim" DROP CONSTRAINT "PK_49fb2bc9d3a2b3fd0da14540b56"`);
        await queryRunner.query(`ALTER TABLE "sim" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "sim" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sim" ADD CONSTRAINT "PK_49fb2bc9d3a2b3fd0da14540b56" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "data_log" DROP COLUMN "simId"`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD "simId" integer`);
        await queryRunner.query(`ALTER TABLE "data_log" DROP CONSTRAINT "PK_888f1e5257d322f9f878bd22576"`);
        await queryRunner.query(`ALTER TABLE "data_log" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD CONSTRAINT "PK_888f1e5257d322f9f878bd22576" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD CONSTRAINT "FK_77ca91bc2f0560d663cad2876c2" FOREIGN KEY ("simId") REFERENCES "sim"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
