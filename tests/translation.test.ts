import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { translate, clearCache } from '../src/translation';

describe('translate', () => {
  afterEach(() => {
    clearCache();
  });
  it('calls the translation API and returns text', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet('https://api.mymemory.translated.net/get').reply(200, {
      responseData: { translatedText: 'alma' },
    });

    const result = await translate('apple', 'hu');
    expect(result).toBe('alma');
    mock.restore();
  });

  it('caches repeated translations', async () => {
    const mock = new MockAdapter(axios);
    mock
      .onGet('https://api.mymemory.translated.net/get')
      .replyOnce(200, { responseData: { translatedText: 'helló' } });

    const first = await translate('hello', 'hu');
    expect(first).toBe('helló');

    const second = await translate('hello', 'hu');
    expect(second).toBe('helló');
    expect(mock.history.get.length).toBe(1);
    mock.restore();
  });
});
