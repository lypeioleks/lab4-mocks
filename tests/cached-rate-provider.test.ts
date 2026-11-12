import {
  describe,
  it,
  expect,
  vi,
} from 'vitest';

import {
  CachedRateProvider,
  type Clock,
  type RateApi,
} from '../src/cached-rate-provider';

import { HttpRateApi } from '../src/http-rate-api';

import { server, RATE_URL } from './msw/server';
import { http, HttpResponse } from 'msw';

describe('CachedRateProvider — варіант 3', () => {
  it('не викликає API повторно протягом 60 секунд', async () => {
    let currentTime = 0;

    const clock: Clock = {
      now: () => currentTime,
    };

    const api: RateApi = {
      fetchRate: vi.fn().mockResolvedValue(41.25),
    };

    const provider = new CachedRateProvider(api, clock);

    const firstRate = await provider.getRate('USD', 'UAH');

    currentTime += 30_000;

    const secondRate = await provider.getRate('USD', 'UAH');

    expect(firstRate).toBe(41.25);
    expect(secondRate).toBe(41.25);
    expect(api.fetchRate).toHaveBeenCalledTimes(1);
  });

  it('повторно звертається до API після закінчення 60 секунд', async () => {
    let currentTime = 0;

    const clock: Clock = {
      now: () => currentTime,
    };

    const api: RateApi = {
      fetchRate: vi
        .fn()
        .mockResolvedValueOnce(41.25)
        .mockResolvedValueOnce(42),
    };

    const provider = new CachedRateProvider(api, clock);

    const firstRate = await provider.getRate('USD', 'UAH');

    currentTime += 60_000;

    const secondRate = await provider.getRate('USD', 'UAH');

    expect(firstRate).toBe(41.25);
    expect(secondRate).toBe(42);
    expect(api.fetchRate).toHaveBeenCalledTimes(2);
  });

  it('використовує MSW для отримання курсу через HTTP', async () => {
    const api = new HttpRateApi('https://api.example.com');

    const clock: Clock = {
      now: () => 0,
    };

    const provider = new CachedRateProvider(api, clock);

    const rate = await provider.getRate('USD', 'UAH');

    expect(rate).toBe(41.25);
  });

  it('передає помилку API, якщо сервер повертає 503', async () => {
    server.use(
      http.get(RATE_URL, () => {
        return new HttpResponse(null, { status: 503 });
      }),
    );

    const api = new HttpRateApi('https://api.example.com');

    const clock: Clock = {
      now: () => 0,
    };

    const provider = new CachedRateProvider(api, clock);

    await expect(
      provider.getRate('USD', 'UAH'),
    ).rejects.toThrow('RATE_API_ERROR');
  });

  it('передає помилку, якщо сервер повертає неправильний формат', async () => {
    server.use(
      http.get(RATE_URL, () => {
        return HttpResponse.json({ rate: 'invalid' });
      }),
    );

    const api = new HttpRateApi('https://api.example.com');

    const clock: Clock = {
      now: () => 0,
    };

    const provider = new CachedRateProvider(api, clock);

    await expect(
      provider.getRate('USD', 'UAH'),
    ).rejects.toThrow('INVALID_RATE_FORMAT');
  });
});
