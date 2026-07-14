import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type PaymentGateway = 'tap' | 'deema' | 'taly' | 'cod';
export type PaymentRecordStatus = 'initiated' | 'pending' | 'captured' | 'failed' | 'cancelled' | 'refunded';

export interface PaymentAttributes {
  id: number;
  order_id: number;
  gateway: PaymentGateway;
  gateway_reference: string | null;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  raw_response: Record<string, unknown> | null;
  created_at?: Date;
  updated_at?: Date;
}

export type PaymentCreationAttributes = Optional<
  PaymentAttributes, 'id' | 'gateway_reference' | 'currency' | 'status' | 'raw_response'
>;

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: number;
  public order_id!: number;
  public gateway!: PaymentGateway;
  public gateway_reference!: string | null;
  public amount!: number;
  public currency!: string;
  public status!: PaymentRecordStatus;
  public raw_response!: Record<string, unknown> | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Payment.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    gateway: { type: DataTypes.ENUM('tap', 'deema', 'taly', 'cod'), allowNull: false },
    gateway_reference: { type: DataTypes.STRING(150), allowNull: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'SAR' },
    status: {
      type: DataTypes.ENUM('initiated', 'pending', 'captured', 'failed', 'cancelled', 'refunded'),
      allowNull: false, defaultValue: 'initiated'
    },
    raw_response: { type: DataTypes.JSON, allowNull: true }
  },
  { sequelize, tableName: 'payments', underscored: true }
);

export default Payment;
