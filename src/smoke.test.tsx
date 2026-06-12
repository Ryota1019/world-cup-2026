// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import App from './App';

function renderAt(path: string): string {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('全ページが実データでエラーなく描画される', () => {
  const routes = ['/', '/schedule', '/standings', '/bracket', '/third', '/scorers', '/players'];
  for (const path of routes) {
    it(`route ${path}`, () => {
      const html = renderAt(path);
      expect(html.length).toBeGreaterThan(100);
      expect(html).toContain('🏆'); // 共通ヘッダー
    });
  }

  it('順位表に実データ(チーム名)が描画される', () => {
    const html = renderAt('/standings');
    expect(html).toContain('グループ');
    expect(html).toContain('日本'); // F組: Japan
    expect(html).toContain('ブラジル'); // C組: Brazil
  });
});
