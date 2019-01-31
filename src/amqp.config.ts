
const config = {
  instances: {
    uhudev: {
      url: "amqp://jncuiegn:kH3mdxxi83e_AloMGIN1ELOz5ODLLsjj@gopher.rmq.cloudamqp.com/jncuiegn"
    },
    local: {
      url: "amqp://localhost:5672"
    }
  }
}

export { config as default };
