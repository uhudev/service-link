import createServiceLink, { createChannel } from '../ServiceLink';

const URL = 'amqp://localhost:5672';
const QUEUE = 'MASTER';

describe('ServiceLink integration tests', () => {
  it('Test connection', async () => {
    expect.assertions(1);
    const ch = await createChannel(URL);
    expect(ch).toBeTruthy();
  });
  it('Reply with the request message', async () => {
    const service1 = await createServiceLink(QUEUE, URL);
    const service2 = await createServiceLink(QUEUE, URL);
    service2.listen((data: Buffer) => {
      return new Promise((resolve, reject) => resolve(data));
    })
    const response = await service1.send({ data: 5 });
    expect(response).toMatchObject({ data: 5});
  });
});