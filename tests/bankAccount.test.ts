import dotenv from 'dotenv';
dotenv.config();
import sequelize from '../src/database/pgsql';
import bankAccountModel from '../src/app/bankAccount/bankAccountModel';
import bankAccountServices from '../src/app/bankAccount/bankAccountServices';
import { Request } from 'express';
import { getMockRes } from '@jest-mock/express';

describe('Bank Account CRUD', () => {
    beforeAll(async () => {
        sequelize.authenticate().then(() => {
        }).catch(error => {
            console.log(`** Erro ao conectar com o Postgres! **`)
            console.log(`** ${error} **`)
        });
        await sequelize.sync({ alter: true });
    });

    it('Criar uma conta sem saldo inicial:', async () => {
        const req = {
            body: {
                accountId: 'teste123'
            }
        } as Request;

        const { res } = getMockRes();
        await bankAccountServices.create(req, res);

        const result1 = await bankAccountModel.findOne({ where: { accountId: 'teste123' } });

        expect(res.json).toHaveBeenCalled();
        expect(result1?.balance).toBe(0);
    });

    it('Criar uma conta com saldo inicial:', async () => {
        const req = {
            body: {
                accountId: 'teste456',
                balance: 100
            }
        } as Request;

        const { res } = getMockRes();
        await bankAccountServices.create(req, res);

        const result1 = await bankAccountModel.findOne({ where: { accountId: 'teste456' } });

        expect(res.json).toHaveBeenCalled();
        expect(result1?.balance).toBe(100);
    });

    it('Soft delete de uma conta:', async () => {
        const id = (await bankAccountModel.findOne({ where: { accountId: 'teste123' } }))?.id;
        const req = {
            params: {
                id
            }
        } as unknown as Request;

        const { res } = getMockRes();
        await bankAccountServices.delete(req, res);

        const result1 = await bankAccountModel.findOne({ where: { accountId: 'teste123' } });

        expect(res.json).toHaveBeenCalled();
        expect(result1?.status).toBe('inativa');
    });

    afterAll(async () => {
        await bankAccountModel.destroy({ where: { accountId: 'teste123' } });
        await bankAccountModel.destroy({ where: { accountId: 'teste456' } });
        await sequelize.close();
    });

});
