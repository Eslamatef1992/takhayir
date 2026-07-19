import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PageAttributes {
  id: number;
  slug: string;
  title: string;
  body: string;
  meta_description: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type PageCreationAttributes = Optional<PageAttributes, 'id' | 'meta_description'>;

export class Page extends Model<PageAttributes, PageCreationAttributes> implements PageAttributes {
  public id!: number;
  public slug!: string;
  public title!: string;
  public body!: string;
  public meta_description!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Page.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    body: { type: DataTypes.TEXT('long'), allowNull: false },
    meta_description: { type: DataTypes.STRING(300), allowNull: true }
  },
  { sequelize, tableName: 'pages', underscored: true }
);

export default Page;
