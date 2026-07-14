import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CartAttributes {
  id: number;
  user_id: number | null;
  session_id: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type CartCreationAttributes = Optional<CartAttributes, 'id' | 'user_id' | 'session_id'>;

export class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: number;
  public user_id!: number | null;
  public session_id!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Cart.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    session_id: { type: DataTypes.STRING(150), allowNull: true }
  },
  { sequelize, tableName: 'carts', underscored: true }
);

export default Cart;
