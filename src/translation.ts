import axios from 'axios';

export async function translate(text: string, targetLang: string): Promise<string> {
  const response = await axios.get('https://api.mymemory.translated.net/get', {
    params: {
      q: text,
      langpair: `en|${targetLang}`,
    },
  });
  return response.data.responseData.translatedText as string;
}
