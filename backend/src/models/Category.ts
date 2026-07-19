import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CategoryAttributes {
  id: number;
  parent_id: number | null;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  description_ar: string | null;
  icon: string | null;
  image: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: Date;
  updated_at?: Date;
}

export type CategoryCreationAttributes = Optional<
  CategoryAttributes,
  'id' | 'parent_id' | 'name_ar' | 'description' | 'description_ar' | 'icon' | 'image' | 'is_active' | 'sort_order'
>;

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public parent_id!: number | null;
  public name!: string;
  public name_ar!: string | null;
  public slug!: string;
  public description!: string | null;
  public description_ar!: string | null;
  public icon!: string | null;
  public image!: string | null;
  public is_active!: boolean;
  public sort_order!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Category.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    parent_id: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    name_ar: { type: DataTypes.STRING(150), allowNull: true },
    slug: { type: DataTypes.STRING(170), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    description_ar: { type: DataTypes.TEXT, allowNull: true },
    icon: { type: DataTypes.STRING(500), allowNull: true },
    image: { type: DataTypes.STRING(500), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  },
  { sequelize, tableName: 'categories', underscored: true }
);

export default Category;
