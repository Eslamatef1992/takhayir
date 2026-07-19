import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';

export type Language = 'en' | 'ar';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  dir: 'ltr' | 'rtl';
  /** Translate a static UI string. Falls back to the English source if no Arabic entry exists. */
  t: (text: string) => string;
  /** Pick the right field from a bilingual pair (e.g. product.name / product.name_ar). */
  pick: (en?: string | null, ar?: string | null) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'takhayir_language';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'ar' || saved === 'en') return saved;
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const dir: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language, dir]);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
  }

  function toggleLanguage() {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  }

  function t(text: string): string {
    if (language === 'en') return text;
    return translations[text] || text;
  }

  function pick(en?: string | null, ar?: string | null): string {
    if (language === 'ar' && ar) return ar;
    return en || '';
  }

  const value = useMemo(() => ({ language, setLanguage, toggleLanguage, dir, t, pick }), [language, dir]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
