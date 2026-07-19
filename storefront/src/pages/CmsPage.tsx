import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

interface Page {
  id: number;
  slug: string;
  title: string;
  title_ar: string | null;
  body: string;
  body_ar: string | null;
  meta_description: string | null;
}

export default function CmsPage() {
  const { slug } = useParams();
  const { t, pick } = useLanguage();
  const [page, setPage] = useState<Page | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    apiClient
      .get<ApiEnvelope<Page>>(`/cms/public/${slug}`)
      .then((res) => setPage(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="spinner">{t('Loading...')}</div>;
  if (notFound || !page) return <p className="text-muted">{t('This page could not be found.')}</p>;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>{pick(page.title, page.title_ar)}</h1>
      <div style={{ lineHeight: 1.75, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: pick(page.body, page.body_ar) }} />
    </div>
  );
}
