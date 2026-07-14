import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewAttributes {
  id: number;
  product_id: number;
  user_id: number;
  vendor_id: number;
  order_item_id: number | null;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  created_at?: Date;
  updated_at?: Date;
}

export type ReviewCreationAttributes = Optional<ReviewAttributes, 'id' | 'order_item_id' | 'comment' | 'status'>;

export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: number;
  public product_id!: number;
  public user_id!: number;
  public vendor_id!: number;
  public order_item_id!: number | null;
  public rating!: number;
  public comment!: string | null;
  public status!: ReviewStatus;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Review.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    vendor_id: { type: DataTypes.INTEGER, allowNull: false },
    order_item_id: { type: DataTypes.INTEGER, allowNull: true },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'approved' }
  },
  { sequelize, tableName: 'reviews', underscored: true }
);

export default Review;
