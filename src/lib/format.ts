import type { Lang } from './types';

const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDate(iso: string, lang: Lang): string {
  const [, m, d] = iso.split('-').map(Number);
  return lang === 'ja' ? `${m}月${d}日` : `${MONTHS_EN[m - 1]} ${d}`;
}

export function formatDateFull(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  return lang === 'ja' ? `${y}年${m}月${d}日` : `${MONTHS_EN[m - 1]} ${d}, ${y}`;
}
