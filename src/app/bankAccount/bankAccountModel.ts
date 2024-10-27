
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../database/pgsql';

export interface IBankAccount {
    id: number;
    accountId: string;
    balance: number;
    status: "ativa" | "inativa";
}

class bankAccountModel extends Model<IBankAccount> implements IBankAccount {
    public id!: number;
    public accountId!: string;
    public balance!: number;
    public status!: "ativa" | "inativa";
}

bankAccountModel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    accountId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    balance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM("ativa", "inativa"),
        allowNull: false,
        defaultValue: 'ativa',
    },
}, {
    sequelize,
    modelName: 'BankAccount',
});

export default bankAccountModel;