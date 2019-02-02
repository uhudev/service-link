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

type JobStatus = 'SUCCESS' | 'FAILURE';

interface ServiceResponse {
  request: ServiceRequest,
  data: Object,
  status: JobStatus
}