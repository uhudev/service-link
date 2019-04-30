# Service Link

## Description

ServiceLink is an abstraction layer on top of message brokers (only RabbitMQ currently). It's goal to make remote procedure calls as simple as possible using a promise based send/receive flow. It's ideal for interprocess communication between microservices.

## How to install

```cmd
npm install @uhudev/service-link --save
```

or

```cmd
yarn add @uhudev/service-link
```

## Example



## Contributing

### Tests

To run the tests you need to setup a RabbitMQ message broker (unfortunately there is no reliable mock library for the underlying amqplib yet).



