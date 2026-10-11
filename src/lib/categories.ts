import type { CategorySchema } from './schema';

export const CATEGORY_EMOJI: Record<string, string> = {
  creative: '🎨',
  office: '📊',
  cad: '📐',
  audio: '🎧',
  devtools: '🛠️',
  games: '🎮',
  os: '💻',
  other: '📦',
};

export function categoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? '📦';
}
