import * as amqp from 'amqplib';
import * as uuid from 'uuid';
import { EventEmitter } from 'events';
import { bufferize, objectify, withTimeout } from './utils';
import { Success, Failure, ResponseData, ServiceResponse } from './ServiceResponse';
import ServiceRequest, { IServiceRequest } from './ServiceRequest';
import { clearTimeout } from 'timers';

interface IRequest {
  id: string;
  data: Buffer;
}

const DEFAULT_TIMEOUT = 4000;

class ServiceLink {

  private channel: amqp.Channel;
  private ownQueue: string;
  private queue: string;
  private emitter: EventEmitter = new EventEmitter();
  
  public static create = async (queue: string, connectionURL: string) => {
    try {
      // These async calls should be run in parallel
      const ch = await createChannel(connectionURL);
      await ch.assertQueue(queue);
      const ownQueue = uuid();
      await ch.assertQueue(ownQueue);
      return new ServiceLink(queue, ch, ownQueue);
    } catch (e) {
      throw e;
    }
  }

  private constructor(queue: string, channel: amqp.Channel, ownQueue: string) {
    this.channel = channel;
    this.ownQueue = ownQueue;
    this.queue = queue;
    this.listenToReply();
  }

  // Storing only the correlationId and pop when received response and emit the response
  private createJob = async (request: IRequest): Promise<ServiceResponse> => {
    return new Promise((resolve, reject) => {
      this.emitter.on(request.id, (response) => {
        resolve(JSON.parse(response));
      });
    });
  }

  public send = async (request: IServiceRequest): Promise<ServiceResponse> => {
    try {
      const correlationId = uuid();
      this.channel.sendToQueue(this.queue, bufferize(request), {
        replyTo: this.ownQueue,
        correlationId,
        contentType: 'JSON'
      });
      const response = withTimeout(request.timeout || DEFAULT_TIMEOUT,
        this.createJob({
          id: correlationId,
          data: bufferize(request)
        })
      )
      return response;
    } catch (e) {
      throw new Error('Sending or processing message failed!');
    }
  }

  public listen = (fn: (request: ServiceRequest) => Promise<ResponseData> | ResponseData) => {
    this.channel.consume(this.queue, (msg: amqp.ConsumeMessage | null) => {
      if(msg) {
        this.channel.ack(msg);
        const requestObject = objectify(msg.content);
        try {
          const x = fn(requestObject);
          if(x instanceof Promise) {
            x.then(result => {
              this.reply(msg.properties.replyTo, new Success(requestObject, result), msg.properties.correlationId);
            }).catch(err => {
              this.reply(msg.properties.replyTo, new Failure(requestObject, err.toString()), msg.properties.correlationId);
            });
          } else {
            this.reply(msg.properties.replyTo, new Success(requestObject, x), msg.properties.correlationId);
          }
        } catch (e) {
          this.reply(msg.properties.replyTo, new Failure(requestObject, e.message), msg.properties.correlationId);
        }
        
      }
    });
  }

  private reply = (queue: string, response: ServiceResponse, correlationId: string) => {
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(response)), {
      correlationId
    });
  }

  private listenToReply = async () => {
    this.channel.consume(this.ownQueue, (msg: amqp.ConsumeMessage | null) => {
      if(msg) {
        this.channel.ack(msg);
        this.emitter.emit(msg.properties.correlationId, msg.content);
      }
    })
  }
}

export const createChannel = async (connectionURL: string) => {
  try {
    const conn = await amqp.connect(connectionURL);
    const ch = await conn.createChannel();
    return ch;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export { ServiceLink as default };