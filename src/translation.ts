import axios from 'axios';

const cache = new Map<string, string>();

export async function translate(text: string, targetLang: string): Promise<string> {
  const key = `${text}|${targetLang}`;
  if (cache.has(key)) {
    return cache.get(key)!;
  }
  const response = await axios.get('https://api.mymemory.translated.net/get', {
    params: {
      q: text,
      langpair: `en|${targetLang}`,
    },
  });
  
  const translated = response.data.responseData.translatedText as string;
  cache.set(key, translated);
  return translated;
}

export function clearCache(): void {
  cache.clear();
}
