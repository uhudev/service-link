import ServiceRequest from './ServiceRequest';

export interface ResponseDataObject {
  [key: string]: any;
}

export type ResponseData = ResponseDataObject | string | number;

export type SUCCESS = 'SUCCESS';
export type FAILURE = 'FAILURE';

export type JobStatus =  SUCCESS | FAILURE;

export interface ServiceResponse {
  request: ServiceRequest,
  data?: ResponseData,
  err?: string
  status: JobStatus
}

class Success implements ServiceResponse {
  
  public readonly status: JobStatus = 'SUCCESS';
  public readonly request: ServiceRequest;
  public readonly data: ResponseData;

  constructor(request: ServiceRequest, data: ResponseData) {
    this.request = request;
    this.data = data;
  }
}

class Failure implements ServiceResponse {
  
  public readonly status: JobStatus = 'FAILURE';
  public readonly request: ServiceRequest;
  public readonly err: string;

  constructor(request: ServiceRequest, err: string) {
    this.request = request;
    this.err = err;
  }
}

export { 
  Success,
  Failure 
};