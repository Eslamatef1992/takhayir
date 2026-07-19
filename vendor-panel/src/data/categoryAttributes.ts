// Hardcoded attribute fields shown on the "Add/edit product" form, chosen by
// matching keywords in the selected category's name. This lets an
// electronics vendor see Color/Storage/RAM fields while a fashion vendor
// sees Size/Color/Material, without needing a separate admin-managed
// attribute schema.

export interface AttributeField {
  key: string;
  label: string;
  type: 'select' | 'text';
  options?: string[];
}

const COLORS = ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Red', 'Green', 'Pink', 'Gray', 'Purple'];

const RULES: { keywords: string[]; fields: AttributeField[] }[] = [
  {
    keywords: ['phone', 'mobile', 'iphone', 'smartphone', 'tablet', 'ipad'],
    fields: [
      { key: 'color', label: 'Color', type: 'select', options: COLORS },
      { key: 'storage', label: 'Storage', type: 'select', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
      { key: 'ram', label: 'RAM', type: 'select', options: ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB'] },
      { key: 'warranty', label: 'Warranty', type: 'select', options: ['No warranty', '6 Months', '1 Year', '2 Years'] }
    ]
  },
  {
    keywords: ['laptop', 'computer', 'pc', 'notebook'],
    fields: [
      { key: 'color', label: 'Color', type: 'select', options: COLORS },
      { key: 'storage', label: 'Storage', type: 'select', options: ['128GB', '256GB', '512GB', '1TB', '2TB'] },
      { key: 'ram', label: 'RAM', type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
      { key: 'processor', label: 'Processor', type: 'text' },
      { key: 'warranty', label: 'Warranty', type: 'select', options: ['No warranty', '1 Year', '2 Years', '3 Years'] }
    ]
  },
  {
    keywords: ['tv', 'television', 'audio', 'speaker', 'headphone', 'electronic', 'camera', 'gaming', 'console'],
    fields: [
      { key: 'color', label: 'Color', type: 'select', options: COLORS },
      { key: 'warranty', label: 'Warranty', type: 'select', options: ['No warranty', '1 Year', '2 Years'] }
    ]
  },
  {
    keywords: ['fashion', 'clothing', 'apparel', 'shoe', 'shoes', 'bag', 'accessor', 'wear', 'dress'],
    fields: [
      { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { key: 'color', label: 'Color', type: 'select', options: COLORS },
      { key: 'material', label: 'Material', type: 'text' }
    ]
  },
  {
    keywords: ['home', 'furniture', 'kitchen', 'decor', 'appliance'],
    fields: [
      { key: 'color', label: 'Color', type: 'select', options: COLORS },
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'dimensions', label: 'Dimensions', type: 'text' }
    ]
  },
  {
    keywords: ['beauty', 'cosmetic', 'skincare', 'fragrance', 'perfume', 'makeup'],
    fields: [
      { key: 'shade', label: 'Shade / Color', type: 'text' },
      { key: 'volume', label: 'Volume / Size', type: 'text' }
    ]
  }
];

export function getAttributeFieldsForCategory(categoryName: string | null | undefined): AttributeField[] {
  if (!categoryName) return [];
  const name = categoryName.toLowerCase();
  const match = RULES.find((rule) => rule.keywords.some((kw) => name.includes(kw)));
  return match ? match.fields : [];
}
