import sequelize from '../../database/pgsql';
import { Request, Response } from 'express';
import bankAccountModel, { IBankAccount } from './bankAccountModel';
import logModel, { ILog } from '../logs/logModel';

export default {

    list: async (req: Request, res: Response): Promise<any> => {
        try {
            const accounts = await bankAccountModel.findAndCountAll();
            return res.status(200).json({ msg: "sucesso", accounts });
        } catch (error) {
            return res.status(500).json(error);
        }
    },

    create: async (req: Request, res: Response): Promise<any> => {
        const transaction = await sequelize.transaction();
        try {

            const accNew = {
                ...req.body,
                accountId: req.body.accountId ? req.body.accountId : `${new Date().getTime()}`
            } as IBankAccount;

            const account = await bankAccountModel.create(accNew, { transaction });
            const log = {
                logType: 'criada',
                fromAccountId: account.accountId,
                amount: req.body.balance ? req.body.balance : 0
            } as ILog;
            await logModel.create(log, { transaction });
            await transaction.commit();
            return res.status(202).json({ msg: 'sucesso', account });
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(500).json(error);
        }
    },

    edit: async (req: Request, res: Response): Promise<any> => {
        const transaction = await sequelize.transaction();
        try {
            const accOld = await bankAccountModel.findByPk(req.params.id);
            if (!accOld) {
                return res.status(404).json({ msg: 'Conta não encontrada' });
            }

            const accUpdated = {
                ...req.body,
                accountId: accOld?.accountId,
                id: accOld?.id
            } as IBankAccount;

            const accNew = await bankAccountModel.update(accUpdated, { where: { id: req.params.id }, transaction, returning: true });

            const log = {
                logType: 'atualizada',
                fromAccountId: accNew[1][0].accountId,
                fromAccountOldBalance: accOld.balance,
                fromAccountNewBalance: accNew[1][0].balance,
                amount: (accNew[1][0].balance - accOld.balance),
            } as ILog;
            await logModel.create(log, { transaction });

            await transaction.commit();
            return res.status(200).json({ msg: 'successo', acc: accNew[1][0] });
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(500).json(error);
        }
    },

    getById: async (req: Request, res: Response): Promise<any> => {
        try {
            const acc = await bankAccountModel.findByPk(req.params.id);
            if (!acc) {
                return res.status(404).json({ msg: 'Conta não encontrada' });
            }
            return res.status(200).json({ acc });
        } catch (error) {
            return res.status(500).json(error);
        }
    },

    getByAccountId: async (req: Request, res: Response): Promise<any> => {
        try {
            const acc = await bankAccountModel.findOne({ where: { accountId: req.params.accountId } });
            if (!acc) {
                return res.status(404).json({ msg: 'Conta não encontrada' });
            }
            return res.status(200).json({ acc });
        } catch (error) {
            return res.status(500).json(error);
        }
    },

    delete: async (req: Request, res: Response): Promise<any> => {
        const transaction = await sequelize.transaction();
        try {
            const accOld = await bankAccountModel.findByPk(req.params.id, { transaction });
            if (!accOld) {
                return res.status(404).json({ msg: 'Conta não encontrada' });
            }

            const accNew = await bankAccountModel.update({ status: 'inativa' }, { where: { id: req.params.id }, transaction, returning: true });

            const log = {
                logType: 'deletada',
                fromAccountId: accNew[1][0].accountId,
            } as ILog;
            await logModel.create(log, { transaction });

            await transaction.commit();
            return res.status(200).json({ msg: 'deletada', acc: accNew[1][0] });
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            return res.status(500).json(error);
        }
    },

}