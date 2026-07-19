import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface VariantValueAttributes {
  id: number;
  variant_type_id: number;
  value: string;
  created_at?: Date;
  updated_at?: Date;
}

export type VariantValueCreationAttributes = Optional<VariantValueAttributes, 'id'>;

export class VariantValue extends Model<VariantValueAttributes, VariantValueCreationAttributes> implements VariantValueAttributes {
  public id!: number;
  public variant_type_id!: number;
  public value!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

VariantValue.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    variant_type_id: { type: DataTypes.INTEGER, allowNull: false },
    value: { type: DataTypes.STRING(100), allowNull: false }
  },
  { sequelize, tableName: 'variant_values', underscored: true }
);

export default VariantValue;
