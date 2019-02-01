import * as amqp from 'amqplib';
import * as uuid from 'uuid';
import { EventEmitter } from 'events';

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

  public send = async (msg: any) => {
    const correlationId = uuid();
    console.log("Sending message with correlationId: " + correlationId + ' to:' + this.queue);
    this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(msg)), {
      replyTo: this.ownQueue,
      correlationId,
      contentType: 'JSON'
    });
    return await this.createJob({
      id: correlationId,
      data: Buffer.from(JSON.stringify(msg))
    });
  }

  public listen = (fn: (content: Buffer) => Promise<Buffer>) => {
    console.log('listenning on:' + this.queue);
    this.channel.consume(this.queue, async (msg: amqp.ConsumeMessage | null) => {
      if(msg) {
        this.channel.ack(msg);
        const result = await fn(msg.content);
        this.channel.sendToQueue(msg.properties.replyTo, result, {
          correlationId: msg.properties.correlationId
        });
      }
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