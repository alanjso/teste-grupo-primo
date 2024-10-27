import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../src/database/pgsql';
import bankAccountModel, { IBankAccount } from '../src/app/bankAccount/bankAccountModel';
import transactionServices from '../src/app/transactions/transactionServices';
import { Request } from 'express';
import { getMockRes } from '@jest-mock/express';

describe('Bank Account Transactions', () => {
    beforeAll(async () => {
        sequelize.authenticate().then(() => {
        }).catch(error => {
            console.log(`** Erro ao conectar com o Postgres! **`)
            console.log(`** ${error} **`)
        });
        await sequelize.sync({ alter: true });

        const acc123 = {
            accountId: 'teste123',
            balance: 0
        } as IBankAccount;
        await bankAccountModel.create(acc123);

        const acc456 = {
            accountId: 'teste456',
            balance: 0
        } as IBankAccount;
        await bankAccountModel.create(acc456);
    });

    it('Depositar R$100 na conta teste123 e saldo final ser R$100', async () => {
        const req = {
            body: {
                accountId: 'teste123',
                amount: 100
            }
        } as Request;

        const { res } = getMockRes();
        await transactionServices.deposito(req, res);

        const result1 = await bankAccountModel.findOne({ where: { accountId: 'teste123' } });

        expect(res.json).toHaveBeenCalled();
        expect(result1?.balance).toBe(100);
    });

    it('Sacar R$50 na conta teste123 e saldo final ser R$50', async () => {
        const req = {
            body: {
                accountId: 'teste123',
                amount: 50
            }
        } as Request;

        const { res } = getMockRes();
        await transactionServices.saque(req, res);

        const result1 = await bankAccountModel.findOne({ where: { accountId: 'teste123' } });

        expect(res.json).toHaveBeenCalled();
        expect(result1?.balance).toBe(50);
    });

    it('Transferir R$30 da conta teste123(saldo final R$20) para teste456(saldo final R$30)', async () => {
        const req = {
            body: {
                fromAccountId: "teste123",
                toAccountId: "teste456",
                amount: 30
            }
        } as Request;

        const { res } = getMockRes();
        await transactionServices.transferencia(req, res);

        const result1 = await bankAccountModel.findOne({ where: { accountId: 'teste123' } });
        const result2 = await bankAccountModel.findOne({ where: { accountId: 'teste456' } });

        expect(res.json).toHaveBeenCalled();
        expect(result1?.balance).toBe(20);
        expect(result2?.balance).toBe(30);
    });

    afterAll(async () => {
        await bankAccountModel.destroy({ where: { accountId: 'teste123' } });
        await bankAccountModel.destroy({ where: { accountId: 'teste456' } });
    });

});

describe('Concorrencia Transactions', () => {
    beforeEach(async () => {
        const acc123 = {
            accountId: 'teste123',
            balance: 0
        } as IBankAccount;
        await bankAccountModel.create(acc123);

        const acc456 = {
            accountId: 'teste456',
            balance: 0
        } as IBankAccount;
        await bankAccountModel.create(acc456);

        const acc789 = {
            accountId: 'teste789',
            balance: 0
        } as IBankAccount;
        await bankAccountModel.create(acc789);
    });

    afterEach(async () => {
        await bankAccountModel.destroy({ where: { accountId: 'teste123' } });
        await bankAccountModel.destroy({ where: { accountId: 'teste456' } });
        await bankAccountModel.destroy({ where: { accountId: 'teste789' } });
    });

    it('Concorrência 1:	Depósito(Conta: 123, Valor: 50) Saque(Conta: 123, Valor: 30) Saldo da Conta 123: 20', async () => {
        const req1 = {
            body: {
                accountId: 'teste123',
                amount: 50
            }
        } as Request;

        const { res: res1 } = getMockRes();
        await transactionServices.deposito(req1, res1);

        const req2 = {
            body: {
                accountId: 'teste123',
                amount: 30
            }
        } as Request;

        const { res: res2 } = getMockRes();
        await transactionServices.saque(req2, res2);

        const result1 = await bankAccountModel.findOne({ where: { accountId: 'teste123' } });

        expect(res1.json).toHaveBeenCalled();
        expect(res2.json).toHaveBeenCalled();
        expect(result1?.balance).toBe(20);
    });

    it('Concorrência 2: Depósito(Conta: 123, Valor: 100) Transferência(De: 123, Para: 456, Valor: 50) | Saldo da Conta 123: 50 Saldo da Conta 456: 50', async () => {
        const req1 = {
            body: {
                accountId: 'teste123',
                amount: 100
            }
        } as Request;

        const { res: res1 } = getMockRes();
        await transactionServices.deposito(req1, res1);

        const req2 = {
            body: {
                fromAccountId: "teste123",
                toAccountId: "teste456",
                amount: 50
            }
        } as Request;

        const { res: res2 } = getMockRes();
        await transactionServices.transferencia(req2, res2);

        const result1 = await bankAccountModel.findOne({ where: { accountId: 'teste123' } });
        const result2 = await bankAccountModel.findOne({ where: { accountId: 'teste456' } });

        expect(res1.json).toHaveBeenCalled();
        expect(res2.json).toHaveBeenCalled();
        expect(result1?.balance).toBe(50);
        expect(result2?.balance).toBe(50);
    });

    it('Concorrência 3: Transf(De: 123, Para: 456, Valor: 20) Trans(De: 456, Para: 789, Valor: 10) | Saldo da Conta 123: 80 | Saldo da Conta 456: 10 | Saldo da Conta 789: 10', async () => {
        const req1 = {
            body: {
                accountId: 'teste123',
                amount: 100
            }
        } as Request;

        const { res: res1 } = getMockRes();
        await transactionServices.deposito(req1, res1);

        const req2 = {
            body: {
                fromAccountId: "teste123",
                toAccountId: "teste456",
                amount: 20
            }
        } as Request;

        const { res: res2 } = getMockRes();
        await transactionServices.transferencia(req2, res2);

        const req3 = {
            body: {
                fromAccountId: "teste456",
                toAccountId: "teste789",
                amount: 10
            }
        } as Request;

        const { res: res3 } = getMockRes();
        await transactionServices.transferencia(req3, res3);

        const result1 = await bankAccountModel.findOne({ where: { accountId: 'teste123' } });
        const result2 = await bankAccountModel.findOne({ where: { accountId: 'teste456' } });
        const result3 = await bankAccountModel.findOne({ where: { accountId: 'teste789' } });

        expect(res1.json).toHaveBeenCalled();
        expect(res2.json).toHaveBeenCalled();
        expect(res3.json).toHaveBeenCalled();
        expect(result1?.balance).toBe(80);
        expect(result2?.balance).toBe(10);
        expect(result3?.balance).toBe(10);
    });

    afterAll(async () => {
        await sequelize.close();
    });

});
