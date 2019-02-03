interface RequestData {
  [key: string]: any;
}

interface ResponseData {
  [key: string]: any;
}

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