import createServiceLink from '@uhudev/service-link';

const URL = 'amqp://localhost:5762';
const QUEUE = 'USERS';

(async () => {
  try {
    const sender = await createServiceLink(QUEUE, URL);
    await sender.send({
      action: 'DELETE_USER',
      data: {
        id: 1
      }
    });
  } catch (e) {
    console.error(e);
  }
})();