import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiError';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { toSlug, uniqueSlug } from '../utils/slugify';
import { User, Vendor } from '../models';

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
  const payload = { id: user.id, role: user.role, email: user.email };
  return {
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
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

export { toSlug };
