import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export interface OrderAttributes {
  id: number;
  order_number: string;
  user_id: number | null;
  shipping_address_id: number | null;
  coupon_id: number | null;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  tax_total: number;
  grand_total: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  notes: string | null;
  // Guest checkout — populated only when user_id is null.
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  shipping_full_name: string | null;
  shipping_phone: string | null;
  shipping_country: string | null;
  shipping_city: string | null;
  shipping_area: string | null;
  shipping_street: string | null;
  shipping_building: string | null;
  shipping_notes: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type OrderCreationAttributes = Optional<
  OrderAttributes,
  | 'id' | 'user_id' | 'shipping_address_id' | 'coupon_id' | 'subtotal' | 'shipping_total' | 'discount_total'
  | 'tax_total' | 'grand_total' | 'currency' | 'status' | 'payment_status' | 'payment_method' | 'notes'
  | 'guest_name' | 'guest_email' | 'guest_phone' | 'shipping_full_name' | 'shipping_phone' | 'shipping_country'
  | 'shipping_city' | 'shipping_area' | 'shipping_street' | 'shipping_building' | 'shipping_notes'
>;

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public order_number!: string;
  public user_id!: number | null;
  public shipping_address_id!: number | null;
  public coupon_id!: number | null;
  public subtotal!: number;
  public shipping_total!: number;
  public discount_total!: number;
  public tax_total!: number;
  public grand_total!: number;
  public currency!: string;
  public status!: OrderStatus;
  public payment_status!: PaymentStatus;
  public payment_method!: string | null;
  public notes!: string | null;
  public guest_name!: string | null;
  public guest_email!: string | null;
  public guest_phone!: string | null;
  public shipping_full_name!: string | null;
  public shipping_phone!: string | null;
  public shipping_country!: string | null;
  public shipping_city!: string | null;
  public shipping_area!: string | null;
  public shipping_street!: string | null;
  public shipping_building!: string | null;
  public shipping_notes!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    shipping_address_id: { type: DataTypes.INTEGER, allowNull: true },
    coupon_id: { type: DataTypes.INTEGER, allowNull: true },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    shipping_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    discount_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    tax_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    grand_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'KWD' },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
      allowNull: false, defaultValue: 'pending'
    },
    payment_status: { type: DataTypes.ENUM('unpaid', 'paid', 'failed', 'refunded'), allowNull: false, defaultValue: 'unpaid' },
    payment_method: { type: DataTypes.STRING(50), allowNull: true },
    notes: { type: DataTypes.STRING(500), allowNull: true },
    guest_name: { type: DataTypes.STRING(200), allowNull: true },
    guest_email: { type: DataTypes.STRING(200), allowNull: true },
    guest_phone: { type: DataTypes.STRING(30), allowNull: true },
    shipping_full_name: { type: DataTypes.STRING(200), allowNull: true },
    shipping_phone: { type: DataTypes.STRING(30), allowNull: true },
    shipping_country: { type: DataTypes.STRING(100), allowNull: true },
    shipping_city: { type: DataTypes.STRING(100), allowNull: true },
    shipping_area: { type: DataTypes.STRING(150), allowNull: true },
    shipping_street: { type: DataTypes.STRING(200), allowNull: true },
    shipping_building: { type: DataTypes.STRING(100), allowNull: true },
    shipping_notes: { type: DataTypes.STRING(500), allowNull: true }
  },
  { sequelize, tableName: 'orders', underscored: true }
);

export default Order;
