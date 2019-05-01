interface ChannelOptions {
  durable?: boolean;
}

interface MessageOptions {
   correlationId: string;
   replyTo: string;
}

interface ConsumeMessage {
  content: Buffer,
  properties: MessageOptions;
}

class Channel {
  
  public assertQueue = (queue: string, options: ChannelOptions) => {

  }

  public sendToQueue = (queue: string, data: Buffer) => {

  }

  public ack = (msg: ConsumeMessage) => {

  }
}

class Connection {
  
  private url: String;

  public constructor(url: string) {
    this.url = url;
  }

  public createChannel = () => {
    return new Channel();
  }
}

const connect = (url: string) => {
  return new Connection(url);
}

export {

}