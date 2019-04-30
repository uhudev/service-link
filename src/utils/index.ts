export const withTimeout = async (timeout: number, prom: Promise<any>) => {
  try {
    let id: null | NodeJS.Timeout = null;
    const tp = new Promise((resolve, reject) => {
      id = setTimeout(() => {
        reject(`Timeout: execution exceeded ${timeout} ms!`);
      }, timeout);
    });
    tp;
    const x = await prom;
    if(id) {
      clearTimeout(id)
    };
    return x;
  } catch (e) {
    throw e;
  }
} 

export const bufferize = (x: Object) => Buffer.from(JSON.stringify(x));
export const objectify = (x: Buffer) => JSON.parse(x.toString());