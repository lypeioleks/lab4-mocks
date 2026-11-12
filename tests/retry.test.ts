import {
  describe,
  it,
  expect,
  vi,
  afterEach,
} from 'vitest';

import { withRetry } from '../src/retry';

describe('withRetry — повторні спроби', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('повторює запит після помилки та отримує успішний результат', async () => {
    vi.useFakeTimers();

    const action = vi
      .fn()
      .mockRejectedValueOnce(new Error('TEMPORARY_ERROR'))
      .mockResolvedValue('SUCCESS');

    const promise = withRetry(action, 3, 1000);

    await vi.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toBe('SUCCESS');
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('завершується помилкою після вичерпання всіх спроб', async () => {
    vi.useFakeTimers();

    const action = vi
      .fn()
      .mockRejectedValue(new Error('TIMEOUT'));

    const promise = withRetry(action, 3, 1000);

    const assertion = expect(promise).rejects.toThrow('TIMEOUT');

    await vi.advanceTimersByTimeAsync(2000);

    await assertion;
    expect(action).toHaveBeenCalledTimes(3);
  });
});