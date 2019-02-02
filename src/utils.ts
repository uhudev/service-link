export const bufferize = (x: Object) => Buffer.from(JSON.stringify(x));
export const objectify = (x: Buffer) => JSON.parse(x.toString());

