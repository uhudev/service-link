import { withTimeout } from '../utils';

describe('Timeout unit test', () => {
  it('Should withTimeout', async () => {
    const p = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 1500);
    });
    expect(withTimeout(1000, p)).rejects.toThrow('error');
  });

  it('Should not withTimeout', async () => {
    const fn = jest.fn();
    try {
      const p = new Promise((resolve, reject) => {
        setTimeout(() => {
          fn();
          resolve();
        }, 500);
      });
      const result = await withTimeout(1500, p);
    } catch (e) {
    } finally {
      expect(fn.mock.calls.length).toBe(1);
    }
  });
});