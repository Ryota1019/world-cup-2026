import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { Lang, LocalizedText } from '../lib/types';
import { dict, type DictKey } from './dict';

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (k: DictKey) => string;
  L: (x: LocalizedText | undefined) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('lang') as Lang) || 'ja',
  );
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
    document.documentElement.lang = l;
  }, []);
  const t = useCallback((k: DictKey) => dict[k]?.[lang] ?? k, [lang]);
  const L = useCallback((x: LocalizedText | undefined) => (x ? x[lang] : ''), [lang]);

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, toggle: () => setLang(lang === 'ja' ? 'en' : 'ja'), t, L }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): Ctx {
  const c = useContext(LanguageContext);
  if (!c) throw new Error('useLang must be used within LanguageProvider');
  return c;
}
