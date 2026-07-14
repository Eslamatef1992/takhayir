import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ProductVariantAttributes {
  id: number;
  product_id: number;
  name: string;
  sku: string | null;
  price: number | null;
  stock_quantity: number;
  attributes: Record<string, unknown> | null;
  created_at?: Date;
  updated_at?: Date;
}

export type ProductVariantCreationAttributes = Optional<
  ProductVariantAttributes, 'id' | 'sku' | 'price' | 'stock_quantity' | 'attributes'
>;

export class ProductVariant extends Model<ProductVariantAttributes, ProductVariantCreationAttributes> implements ProductVariantAttributes {
  public id!: number;
  public product_id!: number;
  public name!: string;
  public sku!: string | null;
  public price!: number | null;
  public stock_quantity!: number;
  public attributes!: Record<string, unknown> | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ProductVariant.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(200), allowNull: false },
    sku: { type: DataTypes.STRING(100), allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    stock_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    attributes: { type: DataTypes.JSON, allowNull: true }
  },
  { sequelize, tableName: 'product_variants', underscored: true }
);

export default ProductVariant;
