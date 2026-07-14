import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface BannerAttributes {
  id: number;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: Date;
  updated_at?: Date;
}

export type BannerCreationAttributes = Optional<
  BannerAttributes, 'id' | 'title' | 'subtitle' | 'link_url' | 'is_active' | 'sort_order'
>;

export class Banner extends Model<BannerAttributes, BannerCreationAttributes> implements BannerAttributes {
  public id!: number;
  public title!: string | null;
  public subtitle!: string | null;
  public image_url!: string;
  public link_url!: string | null;
  public is_active!: boolean;
  public sort_order!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Banner.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: true },
    subtitle: { type: DataTypes.STRING(300), allowNull: true },
    image_url: { type: DataTypes.STRING(500), allowNull: false },
    link_url: { type: DataTypes.STRING(500), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  },
  { sequelize, tableName: 'banners', underscored: true }
);

export default Banner;
