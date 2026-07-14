import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface NotificationAttributes {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type NotificationCreationAttributes = Optional<NotificationAttributes, 'id' | 'type' | 'is_read'>;

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public user_id!: number;
  public title!: string;
  public message!: string;
  public type!: string;
  public is_read!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Notification.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.STRING(500), allowNull: false },
    type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'general' },
    is_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { sequelize, tableName: 'notifications', underscored: true }
);

export default Notification;
