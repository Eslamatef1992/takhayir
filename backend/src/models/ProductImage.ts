import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ProductImageAttributes {
  id: number;
  product_id: number;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type ProductImageCreationAttributes = Optional<ProductImageAttributes, 'id' | 'sort_order' | 'is_primary'>;

export class ProductImage extends Model<ProductImageAttributes, ProductImageCreationAttributes> implements ProductImageAttributes {
  public id!: number;
  public product_id!: number;
  public url!: string;
  public sort_order!: number;
  public is_primary!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ProductImage.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    url: { type: DataTypes.STRING(500), allowNull: false },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    is_primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { sequelize, tableName: 'product_images', underscored: true }
);

export default ProductImage;
