import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OrderStatus } from './Order';

export interface OrderVendorGroupAttributes {
  id: number;
  order_id: number;
  vendor_id: number;
  status: OrderStatus;
  subtotal: number;
  commission_rate: number;
  commission_amount: number;
  payout_amount: number;
  tracking_number: string | null;
  shipped_at: Date | null;
  delivered_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export type OrderVendorGroupCreationAttributes = Optional<
  OrderVendorGroupAttributes,
  | 'id' | 'status' | 'subtotal' | 'commission_rate' | 'commission_amount' | 'payout_amount'
  | 'tracking_number' | 'shipped_at' | 'delivered_at'
>;

export class OrderVendorGroup
  extends Model<OrderVendorGroupAttributes, OrderVendorGroupCreationAttributes>
  implements OrderVendorGroupAttributes {
  public id!: number;
  public order_id!: number;
  public vendor_id!: number;
  public status!: OrderStatus;
  public subtotal!: number;
  public commission_rate!: number;
  public commission_amount!: number;
  public payout_amount!: number;
  public tracking_number!: string | null;
  public shipped_at!: Date | null;
  public delivered_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OrderVendorGroup.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    vendor_id: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
      allowNull: false, defaultValue: 'pending'
    },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    commission_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    commission_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    payout_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    tracking_number: { type: DataTypes.STRING(100), allowNull: true },
    shipped_at: { type: DataTypes.DATE, allowNull: true },
    delivered_at: { type: DataTypes.DATE, allowNull: true }
  },
  { sequelize, tableName: 'order_vendor_groups', underscored: true }
);

export default OrderVendorGroup;
