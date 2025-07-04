import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { translate } from '../src/translation';

describe('translate', () => {
  it('calls the translation API and returns text', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('https://api.mymemory.translated.net/get').reply(200, {
      responseData: { translatedText: 'alma' },
    });

    const result = await translate('apple', 'hu');
    expect(result).toBe('alma');
    mock.restore();
  });
});
