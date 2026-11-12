import type { RateApi } from './cached-rate-provider';

export class HttpRateApi implements RateApi {
  constructor(private baseUrl: string) {}

  async fetchRate(from: string, to: string): Promise<number> {
    const url = `${this.baseUrl}/rate?from=${from}&to=${to}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('RATE_API_ERROR');
    }

    const data = await response.json();

    if (typeof data.rate !== 'number') {
      throw new Error('INVALID_RATE_FORMAT');
    }

    return data.rate;
  }
}