import createServiceLink from '@uhudev/service-link';

const URL = 'amqp://localhost:5762';
const QUEUE = 'USERS';

let users = [
  { id: 1, username: 'user' }
];

const deleteUserById = (id: number) => {
  const deletedUser = users.find(user => user.id === id);
  users = users.filter(user => user.id !== id);
  return deletedUser;
}

(async () => {
  try {
    const receiver = await createServiceLink(QUEUE, URL);
    await receiver.listen((msg: Buffer) => {
      const msg = JSON.parse(msg.toString());
      switch(msg.action) {
        case('DELETE_USER'): {
          return deleteUserById(msg.data.id);
        }
        default: {
          throw new Error('Unkown action!');
        }
      }
    })
  } catch (e) {
    console.error(e);
  }
})();