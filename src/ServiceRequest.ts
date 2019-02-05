interface IRequestData {
  [key: string]: any;
}

export type RequestData = IRequestData | string | number; 

export interface IServiceRequest<T=RequestData> {
  action: string;
  data?: T;
}

class ServiceRequest implements IServiceRequest {
  public readonly action: string;
  public readonly data: RequestData;
  constructor(action: string, data: RequestData) {
    this.action = action;
    this.data = data;
  }
}

export { ServiceRequest as default }