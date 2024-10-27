import sequelize from '../../database/pgsql';
import { Request, Response } from 'express';
import bankAccountModel from '../bankAccount/bankAccountModel';
import logModel, { ILog } from '../logs/logModel';

export default {
    deposito: async (req: Request, res: Response): Promise<any> => {
        const transaction = await sequelize.transaction();
        try {

            const amount = req.body.amount as number;

            if (!amount || isNaN(amount) || amount <= 0) {
                return res.status(401).json({ msg: 'Valor não autorizado' });
            }

            if (!req.body.accountId) {
                return res.status(404).json({ msg: 'accountId não encontrado' });
            }

            const accOld = await bankAccountModel.findOne({ where: { accountId: req.body.accountId } });
            if (!accOld) {
                return res.status(404).json({ msg: 'Conta não encontrada' });
            }

            if (accOld.status == 'inativa') {
                return res.status(401).json({ msg: 'Conta inativa' });
            }

            const log = {
                logType: 'deposito',
                fromAccountId: accOld.accountId,
                fromAccountOldBalance: accOld.balance,
                amount,
            } as ILog;

            const accNew = await accOld.increment('balance', { by: amount, transaction });

            log.fromAccountNewBalance = accNew.balance;
            await logModel.create(log, { transaction });

            await transaction.commit();
            return res.status(200).json({ msg: 'successo', acc: accNew });
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(500).json(error);
        }
    },

    saque: async (req: Request, res: Response): Promise<any> => {
        const transaction = await sequelize.transaction();
        try {

            const amount = req.body.amount as number;

            if (!amount || isNaN(amount) || amount <= 0) {
                return res.status(401).json({ msg: 'Valor não autorizado' });
            }

            if (!req.body.accountId) {
                return res.status(404).json({ msg: 'accountId não encontrado' });
            }

            const accOld = await bankAccountModel.findOne({ where: { accountId: req.body.accountId } });
            if (!accOld) {
                return res.status(404).json({ msg: 'Conta não encontrada' });
            }

            if (accOld.status == 'inativa') {
                return res.status(401).json({ msg: 'Conta inativa' });
            }

            if (amount > accOld.balance) {
                return res.status(401).json({ msg: 'Saldo insuficiente' });
            }

            const log = {
                logType: 'saque',
                fromAccountId: accOld.accountId,
                fromAccountOldBalance: accOld.balance,
                amount,
            } as ILog;

            const accNew = await accOld.decrement('balance', { by: amount, transaction });

            log.fromAccountNewBalance = accNew.balance;
            await logModel.create(log, { transaction });

            await transaction.commit();
            return res.status(200).json({ msg: 'successo', acc: accNew });
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(500).json(error);
        }
    },

    transferencia: async (req: Request, res: Response): Promise<any> => {
        const transaction = await sequelize.transaction();
        try {

            const amount = req.body.amount as number;

            if (!amount || isNaN(amount) || amount <= 0) {
                return res.status(401).json({ msg: 'Valor não autorizado' });
            }

            if (!req.body.fromAccountId) {
                return res.status(404).json({ msg: 'fromAccountId não encontrado' });
            }

            const fromAcc = await bankAccountModel.findOne({ where: { accountId: req.body.fromAccountId } });
            if (!fromAcc) {
                return res.status(404).json({ msg: 'Conta de origem não encontrada' });
            }

            if (fromAcc.status == 'inativa') {
                return res.status(401).json({ msg: 'Conta origem inativa' });
            }

            if (amount > fromAcc.balance) {
                return res.status(401).json({ msg: 'Saldo insuficiente' });
            }

            if (!req.body.toAccountId) {
                return res.status(404).json({ msg: 'toAccountId não encontrado' });
            }

            const toAcc = await bankAccountModel.findOne({ where: { accountId: req.body.toAccountId } });
            if (!toAcc) {
                return res.status(404).json({ msg: 'Conta de destino não encontrada' });
            }

            if (toAcc.status == 'inativa') {
                return res.status(401).json({ msg: 'Conta destino inativa' });
            }

            if (req.body.fromAccountId == req.body.toAccountId) {
                return res.status(401).json({ msg: 'Transferencia para mesma conta não autorizada' });
            }

            const log = {
                logType: 'transferencia',
                fromAccountId: fromAcc.accountId,
                fromAccountOldBalance: fromAcc.balance,
                toAccountId: toAcc.accountId,
                toAccountOldBalance: toAcc.balance,
                amount,
            } as ILog;

            const fromAccNew = await fromAcc.decrement('balance', { by: amount, transaction });
            const toAccNew = await toAcc.increment('balance', { by: amount, transaction });

            log.fromAccountNewBalance = fromAccNew.balance;
            log.toAccountNewBalance = toAccNew.balance;
            await logModel.create(log, { transaction });

            await transaction.commit();
            return res.status(200).json({ msg: 'successo', fromAcc, toAcc });
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(500).json(error);
        }
    },

}