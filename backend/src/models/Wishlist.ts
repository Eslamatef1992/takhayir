import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface WishlistAttributes {
  id: number;
  user_id: number;
  product_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export type WishlistCreationAttributes = Optional<WishlistAttributes, 'id'>;

export class Wishlist extends Model<WishlistAttributes, WishlistCreationAttributes> implements WishlistAttributes {
  public id!: number;
  public user_id!: number;
  public product_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Wishlist.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false }
  },
  { sequelize, tableName: 'wishlists', underscored: true }
);

export default Wishlist;
