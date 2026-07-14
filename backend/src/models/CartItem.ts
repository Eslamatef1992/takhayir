import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CartItemAttributes {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  price_snapshot: number;
  created_at?: Date;
  updated_at?: Date;
}

export type CartItemCreationAttributes = Optional<CartItemAttributes, 'id' | 'variant_id' | 'quantity'>;

export class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  public id!: number;
  public cart_id!: number;
  public product_id!: number;
  public variant_id!: number | null;
  public quantity!: number;
  public price_snapshot!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CartItem.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cart_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    variant_id: { type: DataTypes.INTEGER, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price_snapshot: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  },
  { sequelize, tableName: 'cart_items', underscored: true }
);

export default CartItem;
