import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface VendorCategoryAttributes {
  id: number;
  vendor_id: number;
  category_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export type VendorCategoryCreationAttributes = Optional<VendorCategoryAttributes, 'id'>;

export class VendorCategory
  extends Model<VendorCategoryAttributes, VendorCategoryCreationAttributes>
  implements VendorCategoryAttributes {
  public id!: number;
  public vendor_id!: number;
  public category_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

VendorCategory.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vendor_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false }
  },
  { sequelize, tableName: 'vendor_categories', underscored: true }
);

export default VendorCategory;
