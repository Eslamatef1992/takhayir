import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type UserRole = 'admin' | 'vendor' | 'customer';
export type UserStatus = 'active' | 'suspended';
// Only meaningful when role === 'admin'. super_admin has unrestricted access;
// the others are fixed permission presets enforced by the gateAdminRole middleware.
export type AdminRole = 'super_admin' | 'orders_manager' | 'product_manager' | 'support';

export interface UserAttributes {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  password_hash: string;
  role: UserRole;
  admin_role: AdminRole | null;
  status: UserStatus;
  avatar_url: string | null;
  email_verified_at: Date | null;
  password_reset_token_hash: string | null;
  password_reset_expires: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  | 'id' | 'last_name' | 'phone' | 'avatar_url' | 'email_verified_at' | 'status' | 'role' | 'admin_role'
  | 'password_reset_token_hash' | 'password_reset_expires'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public first_name!: string;
  public last_name!: string | null;
  public email!: string;
  public phone!: string | null;
  public password_hash!: string;
  public role!: UserRole;
  public admin_role!: AdminRole | null;
  public status!: UserStatus;
  public avatar_url!: string | null;
  public email_verified_at!: Date | null;
  public password_reset_token_hash!: string | null;
  public password_reset_expires!: Date | null;
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
    admin_role: {
      type: DataTypes.ENUM('super_admin', 'orders_manager', 'product_manager', 'support'),
      allowNull: true
    },
    status: { type: DataTypes.ENUM('active', 'suspended'), allowNull: false, defaultValue: 'active' },
    avatar_url: { type: DataTypes.STRING(500), allowNull: true },
    email_verified_at: { type: DataTypes.DATE, allowNull: true },
    password_reset_token_hash: { type: DataTypes.STRING(255), allowNull: true },
    password_reset_expires: { type: DataTypes.DATE, allowNull: true }
  },
  { sequelize, tableName: 'users', underscored: true }
);

export default User;
