import ServiceLink, { createChannel } from '../ServiceLink';
import ServiceRequest, { IServiceRequest } from '../ServiceRequest';
import config from '../amqp.config';

const URL = config.instances.uhudev.url;
const QUEUE = config.instances.uhudev.queue;

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
    try {
      expect.assertions(1);
      const ch = await createChannel(URL);
      expect(ch).toBeTruthy();
    } catch (e) {
      expect(true).toBe(false);
    }
  });
  it('Should return the fibonacci number', async () => {
    try {
      const service1 = await ServiceLink.create(QUEUE, URL);
      const service2 = await ServiceLink.create(QUEUE, URL);
      const request: ServiceRequest = { 
        action: 'FIBONACCI', 
        data: 6
      }
      service2.listen((request: IServiceRequest) => {
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
    } catch (e) {
      expect(true).toBe(false);
    }

  });
  it('Should get a FAILURE response status', async () => {
    const service1 = await ServiceLink.create(QUEUE, URL);
    const service2 = await ServiceLink.create(QUEUE, URL);
    service2.listen((request: ServiceRequest) => {
      const { action, data } = request;
      if(action === 'FIBONACCI') {
        return fib(-1);
      } else {
        throw new Error('No such action');
      }
    });
    const response = await service1.send({
      action: 'FIBONACCI',
      data: -1
    })
    expect(response.status).toBe('FAILURE');
  });
  it("Shouldn't get a response", async () => {
    const service1 = await ServiceLink.create('OTHER_QUEUE', URL);
    const service2 = await ServiceLink.create(QUEUE, URL);
    service2.listen((request: ServiceRequest) => {
      const { action, data } = request;
      if(action === 'FIBONACCI') {
        if(typeof data === 'number') {
          return fib(data);
        } else {
          throw new Error('Data is not a number');
        }  
      } else {
        throw new Error('No such action');
      }
    });
    expect(service1.send({
      action: 'FIBONACCI',
      data: 10,
      timeout: 100
    })).rejects.toThrow('error');
  });
});