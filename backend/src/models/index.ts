import { sequelize } from '../config/database';
import { User } from './User';
import { Vendor } from './Vendor';
import { Category } from './Category';
import { Product } from './Product';
import { ProductImage } from './ProductImage';
import { ProductVariant } from './ProductVariant';
import { Address } from './Address';
import { Cart } from './Cart';
import { CartItem } from './CartItem';
import { Coupon } from './Coupon';
import { Order } from './Order';
import { OrderVendorGroup } from './OrderVendorGroup';
import { OrderItem } from './OrderItem';
import { Payment } from './Payment';
import { Review } from './Review';
import { Wishlist } from './Wishlist';
import { Notification } from './Notification';
import { VendorPayout } from './VendorPayout';
import { Banner } from './Banner';

// User <-> Vendor (1:1)
User.hasOne(Vendor, { foreignKey: 'user_id', as: 'vendorProfile' });
Vendor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category self-referencing (parent/children)
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

// Vendor -> Products
Vendor.hasMany(Product, { foreignKey: 'vendor_id', as: 'products' });
Product.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

// Category -> Vendors
Category.hasMany(Vendor, { foreignKey: 'category_id', as: 'vendors' });
Vendor.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Category -> Products
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Product -> Images / Variants
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User -> Addresses
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Cart
User.hasMany(Cart, { foreignKey: 'user_id', as: 'carts' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

ProductVariant.hasMany(CartItem, { foreignKey: 'variant_id', as: 'cartItems' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// Coupon
Vendor.hasMany(Coupon, { foreignKey: 'vendor_id', as: 'coupons' });
Coupon.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

// Orders
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'customer' });

Address.hasMany(Order, { foreignKey: 'shipping_address_id', as: 'orders' });
Order.belongsTo(Address, { foreignKey: 'shipping_address_id', as: 'shippingAddress' });

Coupon.hasMany(Order, { foreignKey: 'coupon_id', as: 'orders' });
Order.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });

Order.hasMany(OrderVendorGroup, { foreignKey: 'order_id', as: 'vendorGroups' });
OrderVendorGroup.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Vendor.hasMany(OrderVendorGroup, { foreignKey: 'vendor_id', as: 'orderGroups' });
OrderVendorGroup.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

OrderVendorGroup.hasMany(OrderItem, { foreignKey: 'order_vendor_group_id', as: 'items' });
OrderItem.belongsTo(OrderVendorGroup, { foreignKey: 'order_vendor_group_id', as: 'vendorGroup' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Vendor.hasMany(OrderItem, { foreignKey: 'vendor_id', as: 'orderItems' });
OrderItem.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

// Payments
Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Reviews
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

Vendor.hasMany(Review, { foreignKey: 'vendor_id', as: 'reviews' });
Review.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

// Wishlist
User.hasMany(Wishlist, { foreignKey: 'user_id', as: 'wishlist' });
Wishlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Product.hasMany(Wishlist, { foreignKey: 'product_id', as: 'wishlistedBy' });
Wishlist.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Vendor payouts
Vendor.hasMany(VendorPayout, { foreignKey: 'vendor_id', as: 'payouts' });
VendorPayout.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

export {
  sequelize,
  User,
  Vendor,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  Address,
  Cart,
  CartItem,
  Coupon,
  Order,
  OrderVendorGroup,
  OrderItem,
  Payment,
  Review,
  Wishlist,
  Notification,
  VendorPayout,
  Banner
};
