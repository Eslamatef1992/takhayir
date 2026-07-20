import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { ProductCard, ProductSummary } from '../components/ProductCard';
import { SlidersIcon } from '../components/Icons';
import { useLanguage } from '../i18n/LanguageContext';

interface Category {
  id: number;
  name: string;
  name_ar?: string | null;
  slug: string;
  parent_id: number | null;
}

interface CategoryDetail extends Category {
  children?: Category[];
}

const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' }
];

export default function ProductListPage({ mode }: { mode: 'category' | 'search' | 'vendor' }) {
  const { t, pick } = useLanguage();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<CategoryDetail | null>(null);

  const categoryFilter = searchParams.get('category') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || '';

  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  useEffect(() => {
    setMinPriceInput(minPriceParam);
    setMaxPriceInput(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  // Category options for the sidebar: full top-level list on search/vendor pages,
  // the current category's own children (if any) when browsing a category.
  useEffect(() => {
    if (mode === 'category') {
      if (!params.slug) return;
      apiClient
        .get<ApiEnvelope<CategoryDetail>>(`/categories/${params.slug}`)
        .then((res) => setCurrentCategory(res.data.data))
        .catch(() => setCurrentCategory(null));
    } else {
      apiClient
        .get<ApiEnvelope<Category[]>>('/categories', { params: { flat: true } })
        .then((res) => setTopCategories(res.data.data.filter((c) => !c.parent_id)))
        .catch(() => undefined);
    }
  }, [mode, params.slug]);

  useEffect(() => {
    setLoading(true);
    const query: Record<string, string> = { limit: '24' };
    if (mode === 'category') {
      query.category = params.slug || '';
    } else if (mode === 'vendor') {
      query.vendor = params.slug || '';
      if (categoryFilter) query.category = categoryFilter;
    } else {
      query.q = searchParams.get('q') || '';
      if (categoryFilter) query.category = categoryFilter;
    }
    if (minPriceParam) query.minPrice = minPriceParam;
    if (maxPriceParam) query.maxPrice = maxPriceParam;
    if (sortParam) query.sort = sortParam;

    apiClient
      .get<ApiEnvelope<ProductSummary[]>>('/products', { params: query })
      .then((res) => {
        setProducts(res.data.data);
        setTotal(res.data.meta?.total ?? res.data.data.length);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, params.slug, searchParams, currentCategory]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  function toggleCategoryFilter(slug: string) {
    updateParam('category', categoryFilter === slug ? '' : slug);
  }

  function handlePriceApply(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (minPriceInput) next.set('minPrice', minPriceInput);
    else next.delete('minPrice');
    if (maxPriceInput) next.set('maxPrice', maxPriceInput);
    else next.delete('maxPrice');
    setSearchParams(next);
  }

  const hasActiveFilters = Boolean(categoryFilter || minPriceParam || maxPriceParam || sortParam);

  function clearAllFilters() {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    next.delete('minPrice');
    next.delete('maxPrice');
    next.delete('sort');
    setSearchParams(next);
  }

  const subcategories = useMemo(() => currentCategory?.children || [], [currentCategory]);
  const showCategorySection = mode === 'category' ? subcategories.length > 0 : topCategories.length > 0;

  const title =
    mode === 'category'
      ? `${t('Category')}: ${pick(currentCategory?.name || params.slug || '', currentCategory?.name_ar)}`
      : mode === 'vendor'
      ? `${t('Store')}: ${params.slug}`
      : `${t('Search results for')} "${searchParams.get('q') || ''}"`;

  const sidebar = (
    <aside className={`plp-sidebar${mobileFiltersOpen ? ' open' : ''}`}>
      <div className="card plp-filter-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span className="plp-filter-title" style={{ marginBottom: 0 }}>{t('Filters')}</span>
          {hasActiveFilters && (
            <button type="button" className="plp-clear-btn" onClick={clearAllFilters}>
              {t('Clear all')}
            </button>
          )}
        </div>

        {showCategorySection && (
          <div className="plp-filter-section">
            <div className="plp-filter-title">{mode === 'category' ? t('Subcategories') : t('Category')}</div>
            {mode === 'category' ? (
              subcategories.map((c) => (
                <Link key={c.id} to={`/categories/${c.slug}`} className="plp-filter-option">
                  {pick(c.name, c.name_ar)}
                </Link>
              ))
            ) : (
              <>
                <button
                  type="button"
                  className={`plp-filter-option${!categoryFilter ? ' active' : ''}`}
                  onClick={() => updateParam('category', '')}
                >
                  {t('All Categories')}
                </button>
                {topCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`plp-filter-option${categoryFilter === c.slug ? ' active' : ''}`}
                    onClick={() => toggleCategoryFilter(c.slug)}
                  >
                    {pick(c.name, c.name_ar)}
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        <div className="plp-filter-section">
          <div className="plp-filter-title">{t('Price')}</div>
          <form onSubmit={handlePriceApply} className="plp-price-row">
            <input
              type="number"
              min="0"
              step="0.001"
              placeholder={t('Min')}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
            />
            <span className="text-faint">&ndash;</span>
            <input
              type="number"
              min="0"
              step="0.001"
              placeholder={t('Max')}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
            />
          </form>
          <button type="button" className="btn btn-outline btn-sm btn-block" style={{ marginTop: 10 }} onClick={handlePriceApply}>
            {t('Apply')}
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div>
      <div className="plp-toolbar">
        <h1 style={{ marginBottom: 0, wordBreak: 'break-word', fontSize: 22 }}>{title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {total !== null && (
            <span className="plp-result-count">
              {total} {t('results found')}
            </span>
          )}
          <select
            value={sortParam}
            onChange={(e) => updateParam('sort', e.target.value)}
            style={{ width: 'auto', minWidth: 160 }}
            aria-label={t('Sort by')}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.label)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-outline btn-sm plp-mobile-filter-toggle"
            onClick={() => setMobileFiltersOpen((v) => !v)}
          >
            <SlidersIcon size={15} /> {t('Filters')}
          </button>
        </div>
      </div>

      <div className="plp-layout">
        {sidebar}

        <div>
          {loading ? (
            <div className="grid-products">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: '3 / 4' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <p className="text-muted">{t('No products found.')}</p>
            </div>
          ) : (
            <div className="grid-products">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
