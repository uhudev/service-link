interface IRequestData {
  [key: string]: any;
}

type RequestData = IRequestData | string | number; 

interface IResponseData {
  [key: string]: any;
}

type ResponseData = IResponseData | string | number;

interface ServiceRequest {
  action: string;
  data: RequestData;
}

type SUCCESS = 'SUCCESS';
type FAILURE = 'FAILURE';

type JobStatus =  SUCCESS | FAILURE;

interface ServiceResponse {
  request: ServiceRequest,
  data?: Object,
  err?: string
  status: JobStatus
}