import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type UserRole = 'admin' | 'vendor' | 'customer';
export type UserStatus = 'active' | 'suspended';

export interface UserAttributes {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  email_verified_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'last_name' | 'phone' | 'avatar_url' | 'email_verified_at' | 'status' | 'role'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public first_name!: string;
  public last_name!: string | null;
  public email!: string;
  public phone!: string | null;
  public password_hash!: string;
  public role!: UserRole;
  public status!: UserStatus;
  public avatar_url!: string | null;
  public email_verified_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: true },
    email: { type: DataTypes.STRING(191), allowNull: false, unique: true, validate: { isEmail: true } },
    phone: { type: DataTypes.STRING(30), allowNull: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'vendor', 'customer'), allowNull: false, defaultValue: 'customer' },
    status: { type: DataTypes.ENUM('active', 'suspended'), allowNull: false, defaultValue: 'active' },
    avatar_url: { type: DataTypes.STRING(500), allowNull: true },
    email_verified_at: { type: DataTypes.DATE, allowNull: true }
  },
  { sequelize, tableName: 'users', underscored: true }
);

export default User;
