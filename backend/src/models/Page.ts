import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PageAttributes {
  id: number;
  slug: string;
  title: string;
  title_ar: string | null;
  body: string;
  body_ar: string | null;
  meta_description: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type PageCreationAttributes = Optional<PageAttributes, 'id' | 'title_ar' | 'body_ar' | 'meta_description'>;

export class Page extends Model<PageAttributes, PageCreationAttributes> implements PageAttributes {
  public id!: number;
  public slug!: string;
  public title!: string;
  public title_ar!: string | null;
  public body!: string;
  public body_ar!: string | null;
  public meta_description!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Page.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    title_ar: { type: DataTypes.STRING(200), allowNull: true },
    body: { type: DataTypes.TEXT('long'), allowNull: false },
    body_ar: { type: DataTypes.TEXT('long'), allowNull: true },
    meta_description: { type: DataTypes.STRING(300), allowNull: true }
  },
  { sequelize, tableName: 'pages', underscored: true }
);

export default Page;
