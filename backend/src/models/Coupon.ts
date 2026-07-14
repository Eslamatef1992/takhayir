import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type CouponType = 'fixed' | 'percent';

export interface CouponAttributes {
  id: number;
  vendor_id: number | null;
  code: string;
  type: CouponType;
  value: number;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  starts_at: Date | null;
  expires_at: Date | null;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type CouponCreationAttributes = Optional<
  CouponAttributes,
  'id' | 'vendor_id' | 'min_order_amount' | 'usage_limit' | 'used_count' | 'starts_at' | 'expires_at' | 'is_active'
>;

export class Coupon extends Model<CouponAttributes, CouponCreationAttributes> implements CouponAttributes {
  public id!: number;
  public vendor_id!: number | null;
  public code!: string;
  public type!: CouponType;
  public value!: number;
  public min_order_amount!: number;
  public usage_limit!: number | null;
  public used_count!: number;
  public starts_at!: Date | null;
  public expires_at!: Date | null;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Coupon.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vendor_id: { type: DataTypes.INTEGER, allowNull: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    type: { type: DataTypes.ENUM('fixed', 'percent'), allowNull: false, defaultValue: 'percent' },
    value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    min_order_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    usage_limit: { type: DataTypes.INTEGER, allowNull: true },
    used_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    starts_at: { type: DataTypes.DATE, allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  { sequelize, tableName: 'coupons', underscored: true }
);

export default Coupon;
