import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient, ApiEnvelope } from '../api/client';

interface Page {
  id: number;
  slug: string;
  title: string;
  body: string;
  meta_description: string | null;
}

export default function CmsPage() {
  const { slug } = useParams();
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

  if (loading) return <div className="spinner">Loading...</div>;
  if (notFound || !page) return <p className="text-muted">This page could not be found.</p>;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>{page.title}</h1>
      <div style={{ lineHeight: 1.75, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: page.body }} />
    </div>
  );
}
