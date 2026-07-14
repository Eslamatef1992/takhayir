import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AddressAttributes {
  id: number;
  user_id: number;
  label: string | null;
  full_name: string;
  phone: string;
  country: string;
  city: string;
  area: string | null;
  street: string | null;
  building: string | null;
  notes: string | null;
  is_default: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type AddressCreationAttributes = Optional<
  AddressAttributes, 'id' | 'label' | 'area' | 'street' | 'building' | 'notes' | 'is_default'
>;

export class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
  public id!: number;
  public user_id!: number;
  public label!: string | null;
  public full_name!: string;
  public phone!: string;
  public country!: string;
  public city!: string;
  public area!: string | null;
  public street!: string | null;
  public building!: string | null;
  public notes!: string | null;
  public is_default!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Address.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    label: { type: DataTypes.STRING(100), allowNull: true },
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    phone: { type: DataTypes.STRING(30), allowNull: false },
    country: { type: DataTypes.STRING(100), allowNull: false },
    city: { type: DataTypes.STRING(100), allowNull: false },
    area: { type: DataTypes.STRING(100), allowNull: true },
    street: { type: DataTypes.STRING(255), allowNull: true },
    building: { type: DataTypes.STRING(100), allowNull: true },
    notes: { type: DataTypes.STRING(500), allowNull: true },
    is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { sequelize, tableName: 'addresses', underscored: true }
);

export default Address;
