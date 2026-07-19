import { useLanguage } from '../i18n/LanguageContext';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button
      type="button"
      className={className ? className : 'lang-switch'}
      onClick={toggleLanguage}
      aria-label="Switch language"
      title={language === 'en' ? 'العربية' : 'English'}
    >
      {language === 'en' ? 'العربية' : 'English'}
    </button>
  );
}
