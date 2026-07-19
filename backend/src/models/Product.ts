import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type ProductStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'archived';

export interface ProductAttributes {
  id: number;
  vendor_id: number;
  category_id: number | null;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  description_ar: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  weight_kg: number | null;
  status: ProductStatus;
  rejection_reason: string | null;
  is_featured: boolean;
  rating_avg: number;
  rating_count: number;
  attributes: Record<string, unknown> | null;
  created_at?: Date;
  updated_at?: Date;
}

export type ProductCreationAttributes = Optional<
  ProductAttributes,
  | 'id' | 'category_id' | 'name_ar' | 'description' | 'description_ar' | 'sku' | 'compare_at_price' | 'stock_quantity'
  | 'weight_kg' | 'status' | 'rejection_reason' | 'is_featured' | 'rating_avg' | 'rating_count' | 'attributes'
>;

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public vendor_id!: number;
  public category_id!: number | null;
  public name!: string;
  public name_ar!: string | null;
  public slug!: string;
  public description!: string | null;
  public description_ar!: string | null;
  public sku!: string | null;
  public price!: number;
  public compare_at_price!: number | null;
  public stock_quantity!: number;
  public weight_kg!: number | null;
  public status!: ProductStatus;
  public rejection_reason!: string | null;
  public is_featured!: boolean;
  public rating_avg!: number;
  public rating_count!: number;
  public attributes!: Record<string, unknown> | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vendor_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    name_ar: { type: DataTypes.STRING(200), allowNull: true },
    slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    description_ar: { type: DataTypes.TEXT, allowNull: true },
    sku: { type: DataTypes.STRING(100), allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    compare_at_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    stock_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    weight_kg: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    status: { type: DataTypes.ENUM('draft', 'pending', 'active', 'rejected', 'archived'), allowNull: false, defaultValue: 'pending' },
    rejection_reason: { type: DataTypes.STRING(500), allowNull: true },
    is_featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    rating_avg: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
    rating_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    attributes: { type: DataTypes.JSON, allowNull: true }
  },
  { sequelize, tableName: 'products', underscored: true }
);

export default Product;
