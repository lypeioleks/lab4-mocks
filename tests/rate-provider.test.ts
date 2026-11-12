import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';

import { HttpRateProvider } from '../src/rate-provider';
import { server, RATE_URL } from './msw/server';

describe('HttpRateProvider — HTTP-запити через MSW', () => {
  const provider = new HttpRateProvider(
    'https://api.example.com',
  );

  it('повертає курс із відповіді сервера', async () => {
    const rate = await provider.getRate('USD', 'UAH');

    expect(rate).toBe(41.25);
  });

  it('повертає помилку, якщо сервер відповідає статусом 503', async () => {
    server.use(
      http.get(RATE_URL, () => {
        return new HttpResponse(null, { status: 503 });
      }),
    );

    await expect(
      provider.getRate('USD', 'UAH'),
    ).rejects.toThrow('RATE_UNAVAILABLE');
  });

  it('повертає помилку, якщо формат відповіді неправильний', async () => {
    server.use(
      http.get(RATE_URL, () => {
        return HttpResponse.json({ rate: '41.25' });
      }),
    );

    await expect(
      provider.getRate('USD', 'UAH'),
    ).rejects.toThrow('INVALID_RATE_FORMAT');
  });
});