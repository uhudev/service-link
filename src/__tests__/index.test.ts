import createServiceLink, { createChannel } from '../ServiceLink';

const URL = 'amqp://localhost:5672';
const QUEUE = 'MASTER';

const fib = (n: number): number => {
  if(n < 0) throw new Error('Argument cannot be negative!');
  switch(n) {
    case(0): return 0;
    case(1): return 1;
    default: return fib(n-1) + fib(n-2); 
  }
}

describe('ServiceLink integration tests', () => {
  it('Test connection', async () => {
    expect.assertions(1);
    const ch = await createChannel(URL);
    expect(ch).toBeTruthy();
  });
  it('Reply with the request message', async () => {
    const service1 = await createServiceLink(QUEUE, URL);
    const service2 = await createServiceLink(QUEUE, URL);
    const request: ServiceRequest = { 
      action: 'FIBONACCI', 
      data: 6
    }
    service2.listen((request: ServiceRequest) => {
      if(request.action === 'FIBONACCI') {
        if(typeof request.data === 'number') {
          return fib(request.data)
        } else {
          throw Error('invalid argument');
        }
      } else {
        throw new Error();
      }
    });
    const response = await service1.send(request);
    expect(response).toMatchObject({ 
      request,
      status: 'SUCCESS',
      data: 8
    });
  });
});