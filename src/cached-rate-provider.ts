export interface RateApi {
  fetchRate(from: string, to: string): Promise<number>;
}

export interface Clock {
  now(): number;
}

interface CacheEntry {
  rate: number;
  expiresAt: number;
}

export class CachedRateProvider {
  private cache = new Map<string, CacheEntry>();

  constructor(
    private api: RateApi,
    private clock: Clock,
    private cacheDurationMs = 60_000,
  ) {}

  async getRate(from: string, to: string): Promise<number> {
    const key = `${from}-${to}`;
    const now = this.clock.now();

    const cached = this.cache.get(key);

    if (cached && now < cached.expiresAt) {
      return cached.rate;
    }

    const rate = await this.api.fetchRate(from, to);

    this.cache.set(key, {
      rate,
      expiresAt: now + this.cacheDurationMs,
    });

    return rate;
  }
}