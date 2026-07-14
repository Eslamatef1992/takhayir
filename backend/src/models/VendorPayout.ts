import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type PayoutStatus = 'pending' | 'paid' | 'failed';

export interface VendorPayoutAttributes {
  id: number;
  vendor_id: number;
  amount: number;
  status: PayoutStatus;
  period_start: string;
  period_end: string;
  paid_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export type VendorPayoutCreationAttributes = Optional<VendorPayoutAttributes, 'id' | 'status' | 'paid_at'>;

export class VendorPayout extends Model<VendorPayoutAttributes, VendorPayoutCreationAttributes> implements VendorPayoutAttributes {
  public id!: number;
  public vendor_id!: number;
  public amount!: number;
  public status!: PayoutStatus;
  public period_start!: string;
  public period_end!: string;
  public paid_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

VendorPayout.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vendor_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'paid', 'failed'), allowNull: false, defaultValue: 'pending' },
    period_start: { type: DataTypes.DATEONLY, allowNull: false },
    period_end: { type: DataTypes.DATEONLY, allowNull: false },
    paid_at: { type: DataTypes.DATE, allowNull: true }
  },
  { sequelize, tableName: 'vendor_payouts', underscored: true }
);

export default VendorPayout;
