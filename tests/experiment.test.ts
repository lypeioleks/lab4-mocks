import { describe, it, expect, vi } from 'vitest';
import { OrderService } from '../src/order-service';
import type {
  RateProvider,
  OrderRepository,
  Notifier,
} from '../src/order-service';

describe('Експеримент — перевірка взаємодії', () => {
  it('зберігає замовлення лише один раз', async () => {
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

    await service.placeOrder({
      id: 'EXP-1',
      amountUsd: 100,
      email: 'test@example.com',
    });

    expect(repo.save).toHaveBeenCalledTimes(1);
  });
});