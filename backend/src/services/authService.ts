import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ApiError } from '../utils/ApiError';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { toSlug, uniqueSlug } from '../utils/slugify';
import { sendMail } from '../utils/mailer';
import { User, Vendor } from '../models';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

interface RegisterInput {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'customer' | 'vendor';
  store_name?: string;
}

function buildAuthResponse(user: User) {
  const payload = { id: user.id, role: user.role, email: user.email, admin_role: user.admin_role };
  return {
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      admin_role: user.admin_role,
      status: user.status
    },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const password_hash = await bcrypt.hash(input.password, 10);
  const role = input.role === 'vendor' ? 'vendor' : 'customer';

  const user = await User.create({
    first_name: input.first_name,
    last_name: input.last_name ?? null,
    email: input.email,
    phone: input.phone ?? null,
    password_hash,
    role,
    status: 'active',
    avatar_url: null,
    email_verified_at: null
  });

  if (role === 'vendor') {
    if (!input.store_name) throw ApiError.badRequest('store_name is required to register a vendor account');
    const store_slug = await uniqueSlug(input.store_name, (slug) => Vendor.findOne({ where: { store_slug: slug } }));
    await Vendor.create({
      user_id: user.id,
      store_name: input.store_name,
      store_slug,
      store_logo: null,
      store_banner: null,
      description: null,
      business_type: null,
      tax_number: null,
      registration_number: null,
      iban: null,
      commission_rate: 10.0,
      status: 'pending',
      rejection_reason: null,
      rating_avg: 0
    });
  }

  return buildAuthResponse(user);
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  if (user.status === 'suspended') throw ApiError.forbidden('This account has been suspended');

  return buildAuthResponse(user);
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const user = await User.findByPk(userId);
  if (!user) throw ApiError.notFound('User not found');

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw ApiError.unauthorized('Current password is incorrect');

  user.password_hash = await bcrypt.hash(newPassword, 10);
  await user.save();
}

export async function requestPasswordReset(email: string) {
  const user = await User.findOne({ where: { email } });

  // Always behave the same way whether or not the account exists, so callers
  // can't use this endpoint to discover which emails are registered.
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  user.password_reset_token_hash = hashToken(token);
  user.password_reset_expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  const frontendUrl = process.env.CLIENT_STOREFRONT_URL || 'https://www.takhayir.com';
  const resetLink = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;

  await sendMail({
    to: user.email,
    subject: 'Reset your Takhayir password',
    html: `
      <p>Hi ${user.first_name},</p>
      <p>We received a request to reset your Takhayir password. Click the link below to choose a new one:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `
  });
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const user = await User.findOne({ where: { password_reset_token_hash: tokenHash } });

  if (!user || !user.password_reset_expires || user.password_reset_expires.getTime() < Date.now()) {
    throw ApiError.badRequest('This reset link is invalid or has expired. Please request a new one.');
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  user.password_reset_token_hash = null;
  user.password_reset_expires = null;
  await user.save();
}

export { toSlug };
