import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface VariantTypeAttributes {
  id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

export type VariantTypeCreationAttributes = Optional<VariantTypeAttributes, 'id'>;

export class VariantType extends Model<VariantTypeAttributes, VariantTypeCreationAttributes> implements VariantTypeAttributes {
  public id!: number;
  public name!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

VariantType.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true }
  },
  { sequelize, tableName: 'variant_types', underscored: true }
);

export default VariantType;
