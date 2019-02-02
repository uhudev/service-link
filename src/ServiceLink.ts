import * as amqp from 'amqplib';
import * as uuid from 'uuid';
import { EventEmitter } from 'events';
import { bufferize, objectify } from './utils';

interface IRequest {
  id: string;
  data: Buffer;
}

class ServiceLink extends EventEmitter {

  private channel: amqp.Channel;
  private ownQueue: string;
  private queue: string;

  // Storing only the correlationId and pop when received response and emit the response
  
  static create = async (queue: string, channel: amqp.Channel) => {
    try {
      // These async calls should be run in parallel
      const qAssertion = await channel.assertQueue(queue);
      const ownQueue = uuid();
      const ownQueueAssertion = await channel.assertQueue(ownQueue);
      return new ServiceLink(queue, channel, ownQueue);
    } catch (e) {
      throw e;
    }
  }

  private constructor(queue: string, channel: amqp.Channel, ownQueue: string) {
    super();
    this.channel = channel;
    this.ownQueue = ownQueue;
    this.queue = queue;
    this.listenToReply();
  }

  private createJob = async (request: IRequest) => {
    return new Promise((resolve, reject) => {
      this.on(request.id, (response) => {
        resolve(JSON.parse(response));
      });
    });
  }

  public send = async (request: ServiceRequest) => {
    const correlationId = uuid();
    this.channel.sendToQueue(this.queue, bufferize(request), {
      replyTo: this.ownQueue,
      correlationId,
      contentType: 'JSON'
    });
    return await this.createJob({
      id: correlationId,
      data: bufferize(request)
    });
  }

  public listen = (fn: (request: ServiceRequest) => Promise<ResponseData> | ResponseData) => {
    console.log('listenning on:' + this.queue);
    this.channel.consume(this.queue, (msg: amqp.ConsumeMessage | null) => {
      if(msg) {
        this.channel.ack(msg);
        const requestObject = objectify(msg.content);
        try {
          const x = fn(requestObject);
          if(x instanceof Promise) {
            x.then(result => {
              this.reply(msg.properties.replyTo, {request: requestObject, status: 'SUCCESS', data: result}, msg.properties.correlationId);
            }).catch(err => {
              this.reply(msg.properties.replyTo, {request: requestObject, status: 'FAILURE', data: x}, msg.properties.correlationId);
            });
          } else {
            this.reply(msg.properties.replyTo, {request: requestObject, status: 'SUCCESS', data: x}, msg.properties.correlationId);
          }
        } catch (e) {
          this.reply(msg.properties.replyTo, {
            request: requestObject,
            status: 'FAILURE',
            data: {}
          }, msg.properties.correlationId);
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
        console.log('received a reply with correlationId:' + msg.properties.correlationId);
        this.channel.ack(msg);
        this.emit(msg.properties.correlationId, msg.content);
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

const createServiceLink = async (queue: string, connectionURL: string) => {
  try {
    const ch = await createChannel(connectionURL);
    return await ServiceLink.create(queue, ch);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export default createServiceLink;