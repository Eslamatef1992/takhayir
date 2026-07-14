import slugifyLib from 'slugify';

export function toSlug(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, trim: true });
}

export async function uniqueSlug<T>(
  base: string,
  exists: (slug: string) => Promise<T | null>
): Promise<string> {
  const baseSlug = toSlug(base) || 'item';
  let candidate = baseSlug;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await exists(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return candidate;
}
