import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiClient, ApiEnvelope } from '../api/client';
import { CloseIcon, TrashIcon } from './Icons';
import talyIcon from '../assets/payments/taly.svg';
import visaIcon from '../assets/payments/visa.svg';
import mastercardIcon from '../assets/payments/mastercard.svg';
import knetIcon from '../assets/payments/knet.svg';
import applePayIcon from '../assets/payments/apple-pay.svg';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

interface RecommendedProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  images?: { url: string; is_primary: boolean }[];
}

function imageFor(p: { images?: { url: string; is_primary: boolean }[] } | undefined) {
  const img = p?.images?.find((i) => i.is_primary) || p?.images?.[0];
  return img ? `${API_ORIGIN}${img.url}` : null;
}

export function CartDrawer() {
  const { items, total, isDrawerOpen, closeDrawer, updateItem, removeItem, addItem } = useCart();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    apiClient.get<ApiEnvelope<RecommendedProduct[]>>('/products', { params: { limit: 8, sort: 'rating' } }).then((res) => {
      const cartProductIds = new Set(items.map((i) => i.product_id));
      setRecommended(res.data.data.filter((p) => !cartProductIds.has(p.id)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  function goTo(path: string) {
    closeDrawer();
    navigate(path);
  }

  return (
    <div className="cart-drawer-overlay" onClick={closeDrawer}>
      <div className="cart-drawer-panels" onClick={(e) => e.stopPropagation()}>
        {recommended.length > 0 && (
          <div className="cart-drawer-recs">
            <h3>You'll love this too</h3>
            <div className="cart-drawer-recs-list">
              {recommended.slice(0, 8).map((p) => {
                const img = imageFor(p);
                return (
                  <div key={p.id} className="cart-drawer-rec-row">
                    <Link to={`/products/${p.slug}`} onClick={closeDrawer} className="cart-drawer-rec-img">
                      {img ? <img src={img} alt={p.name} /> : null}
                    </Link>
                    <div className="cart-drawer-rec-info">
                      <Link to={`/products/${p.slug}`} onClick={closeDrawer} className="cart-drawer-rec-name">
                        {p.name}
                      </Link>
                      <div className="cart-drawer-rec-price">{Number(p.price).toFixed(3)} KWD</div>
                    </div>
                    <button className="cart-drawer-rec-add" onClick={() => addItem(p.id)} aria-label="Add to cart">
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="cart-drawer-cart">
          <div className="cart-drawer-header">
            <h3>Your cart</h3>
            <button className="cart-drawer-close" onClick={closeDrawer} aria-label="Close">
              <CloseIcon size={18} />
            </button>
          </div>

          <div className="cart-drawer-items">
            {items.length === 0 && (
              <p className="text-muted" style={{ padding: '20px 0' }}>
                Your cart is empty.
              </p>
            )}
            {items.map((item) => {
              const img = imageFor(item.product);
              return (
                <div key={item.id} className="cart-drawer-item">
                  <div className="cart-drawer-item-img">{img && <img src={img} alt={item.product?.name} />}</div>
                  <div className="cart-drawer-item-info">
                    <Link to={`/products/${item.product?.slug}`} onClick={closeDrawer} className="cart-drawer-item-name">
                      {item.product?.name}
                      {item.variant && ` — ${item.variant.name}`}
                    </Link>
                    <div className="cart-drawer-item-price">KWD {Number(item.price_snapshot).toFixed(3)}</div>
                    <div className="cart-drawer-item-qty">
                      <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}>&minus;</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                      <button className="cart-drawer-item-remove" onClick={() => removeItem(item.id)} aria-label="Remove">
                        <TrashIcon size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {items.length > 0 && (
            <div className="cart-drawer-footer">
              <div className="cart-drawer-total-row">
                <span>Total</span>
                <span className="cart-drawer-total">KWD {total.toFixed(3)}</span>
              </div>
              <p className="text-faint" style={{ fontSize: 11.5, marginBottom: 14 }}>
                Taxes and shipping calculated at checkout
              </p>
              <div className="cart-drawer-actions">
                <button className="btn btn-outline" onClick={() => goTo('/cart')}>
                  View cart
                </button>
                <button className="btn btn-primary" onClick={() => goTo('/checkout')}>
                  Checkout
                </button>
              </div>
              <div className="cart-drawer-payments">
                <img src={talyIcon} alt="Taly" />
                <img src={applePayIcon} alt="Apple Pay" />
                <img src={knetIcon} alt="KNET" />
                <img src={visaIcon} alt="Visa" />
                <img src={mastercardIcon} alt="Mastercard" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
