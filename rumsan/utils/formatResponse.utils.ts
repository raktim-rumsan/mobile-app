import { AxiosResponse } from 'axios';
import { Response } from '../types';

export type FormattedResponse<T> = {
  data: T;
  response: Response<T>;
  httpReponse: AxiosResponse;
};

export const formatResponse = <T>(
  response: AxiosResponse,
): FormattedResponse<T> => {
  return {
    data: <T>response.data.data,
    response: <Response<T>>response.data,
    httpReponse: response,
  };
};
