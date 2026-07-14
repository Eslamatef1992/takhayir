import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface OrderItemAttributes {
  id: number;
  order_id: number;
  order_vendor_group_id: number;
  product_id: number | null;
  variant_id: number | null;
  vendor_id: number;
  product_name_snapshot: string;
  sku_snapshot: string | null;
  price: number;
  quantity: number;
  total: number;
  created_at?: Date;
  updated_at?: Date;
}

export type OrderItemCreationAttributes = Optional<
  OrderItemAttributes, 'id' | 'product_id' | 'variant_id' | 'sku_snapshot'
>;

export class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public order_id!: number;
  public order_vendor_group_id!: number;
  public product_id!: number | null;
  public variant_id!: number | null;
  public vendor_id!: number;
  public product_name_snapshot!: string;
  public sku_snapshot!: string | null;
  public price!: number;
  public quantity!: number;
  public total!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    order_vendor_group_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: true },
    variant_id: { type: DataTypes.INTEGER, allowNull: true },
    vendor_id: { type: DataTypes.INTEGER, allowNull: false },
    product_name_snapshot: { type: DataTypes.STRING(200), allowNull: false },
    sku_snapshot: { type: DataTypes.STRING(100), allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  },
  { sequelize, tableName: 'order_items', underscored: true }
);

export default OrderItem;
