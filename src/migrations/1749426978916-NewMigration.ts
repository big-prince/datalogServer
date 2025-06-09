import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigration1749426978916 implements MigrationInterface {
    name = 'NewMigration1749426978916'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "data_log" ("id" SERIAL NOT NULL, "source" character varying NOT NULL, "dataSize" double precision NOT NULL, "price" double precision NOT NULL, "validityDays" integer NOT NULL, "purchaseDate" TIMESTAMP NOT NULL, "expiryDate" TIMESTAMP, "userId" integer, "simId" integer, CONSTRAINT "PK_888f1e5257d322f9f878bd22576" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sim" ("id" SERIAL NOT NULL, "nickname" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_49fb2bc9d3a2b3fd0da14540b56" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "setting" ("id" SERIAL NOT NULL, "dailyDataUsage" double precision, "notificationPrefs" json, "userId" integer, CONSTRAINT "PK_fcb21187dc6094e24a48f677bed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "email" character varying NOT NULL, "phoneNumber" character varying, "password" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_f2578043e491921209f5dadd080" UNIQUE ("phoneNumber"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isRevoked" boolean NOT NULL DEFAULT false, CONSTRAINT "REL_94f168faad896c0786646fa3d4" UNIQUE ("userId"), CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD CONSTRAINT "FK_1254497ad82d7debac2e8537622" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "data_log" ADD CONSTRAINT "FK_77ca91bc2f0560d663cad2876c2" FOREIGN KEY ("simId") REFERENCES "sim"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sim" ADD CONSTRAINT "FK_d465ce4bafe6de350e403772218" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "setting" ADD CONSTRAINT "FK_bbcafb8c4c78d890f75caa632d5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP CONSTRAINT "FK_bbcafb8c4c78d890f75caa632d5"`);
        await queryRunner.query(`ALTER TABLE "sim" DROP CONSTRAINT "FK_d465ce4bafe6de350e403772218"`);
        await queryRunner.query(`ALTER TABLE "data_log" DROP CONSTRAINT "FK_77ca91bc2f0560d663cad2876c2"`);
        await queryRunner.query(`ALTER TABLE "data_log" DROP CONSTRAINT "FK_1254497ad82d7debac2e8537622"`);
        await queryRunner.query(`DROP TABLE "token"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "setting"`);
        await queryRunner.query(`DROP TABLE "sim"`);
        await queryRunner.query(`DROP TABLE "data_log"`);
    }

}
