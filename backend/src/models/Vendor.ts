import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type VendorStatus = 'pending' | 'approved' | 'suspended' | 'rejected';

export interface VendorAttributes {
  id: number;
  user_id: number;
  store_name: string;
  store_name_ar: string | null;
  store_slug: string;
  store_logo: string | null;
  store_banner: string | null;
  description: string | null;
  description_ar: string | null;
  business_type: string | null;
  tax_number: string | null;
  registration_number: string | null;
  business_license_url: string | null;
  category_id: number | null;
  iban: string | null;
  commission_rate: number;
  status: VendorStatus;
  rejection_reason: string | null;
  rating_avg: number;
  is_featured: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type VendorCreationAttributes = Optional<
  VendorAttributes,
  | 'id' | 'store_name_ar' | 'store_logo' | 'store_banner' | 'description' | 'description_ar' | 'business_type'
  | 'tax_number' | 'registration_number' | 'business_license_url' | 'category_id' | 'iban' | 'commission_rate'
  | 'status' | 'rejection_reason' | 'rating_avg' | 'is_featured'
>;

export class Vendor extends Model<VendorAttributes, VendorCreationAttributes> implements VendorAttributes {
  public id!: number;
  public user_id!: number;
  public store_name!: string;
  public store_name_ar!: string | null;
  public store_slug!: string;
  public store_logo!: string | null;
  public store_banner!: string | null;
  public description!: string | null;
  public description_ar!: string | null;
  public business_type!: string | null;
  public tax_number!: string | null;
  public registration_number!: string | null;
  public business_license_url!: string | null;
  public category_id!: number | null;
  public iban!: string | null;
  public commission_rate!: number;
  public status!: VendorStatus;
  public rejection_reason!: string | null;
  public rating_avg!: number;
  public is_featured!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Vendor.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    store_name: { type: DataTypes.STRING(150), allowNull: false },
    store_name_ar: { type: DataTypes.STRING(150), allowNull: true },
    store_slug: { type: DataTypes.STRING(170), allowNull: false, unique: true },
    store_logo: { type: DataTypes.STRING(500), allowNull: true },
    store_banner: { type: DataTypes.STRING(500), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    description_ar: { type: DataTypes.TEXT, allowNull: true },
    business_type: { type: DataTypes.STRING(100), allowNull: true },
    tax_number: { type: DataTypes.STRING(100), allowNull: true },
    registration_number: { type: DataTypes.STRING(100), allowNull: true },
    business_license_url: { type: DataTypes.STRING(500), allowNull: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    iban: { type: DataTypes.STRING(50), allowNull: true },
    commission_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 10.0 },
    status: { type: DataTypes.ENUM('pending', 'approved', 'suspended', 'rejected'), allowNull: false, defaultValue: 'pending' },
    rejection_reason: { type: DataTypes.STRING(500), allowNull: true },
    rating_avg: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
    is_featured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { sequelize, tableName: 'vendors', underscored: true }
);

export default Vendor;
