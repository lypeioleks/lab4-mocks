import {
  describe,
  it,
  expect,
  vi,
  afterEach,
} from 'vitest';

import { OrderService } from '../src/order-service';
import type {
  RateProvider,
  OrderRepository,
  Notifier,
} from '../src/order-service';

describe('OrderService — фіксація часу', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('зберігає дату, яку встановили у фальшивому часі', async () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2026-11-12T10:00:00.000Z'));

    const rates: RateProvider = {
      getRate: vi.fn().mockResolvedValue(41),
    };

    const repo: OrderRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    };

    const notifier: Notifier = {
      send: vi.fn().mockResolvedValue(undefined),
    };

    const service = new OrderService(rates, repo, notifier);

    const record = await service.placeOrder({
      id: 'TIME-1',
      amountUsd: 100,
      email: 'test@example.com',
    });

    expect(record.createdAt).toBe('2026-11-12T10:00:00.000Z');
  });
});