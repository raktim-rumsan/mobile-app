import axios, {
  AxiosHeaderValue,
  AxiosInstance,
  CreateAxiosDefaults,
  HeadersDefaults,
} from 'axios';

export class ApiClient {
  private static instance: ApiClient | null = null;
  public client: AxiosInstance;

  private constructor(config: CreateAxiosDefaults) {
    this.client = axios.create(config);
  }

  public static getInstance(config: CreateAxiosDefaults = {}): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(config);
    }
    return ApiClient.instance;
  }

  public get accessToken() {
    return this.client.defaults.headers['Authorization'] as string;
  }
  public set accessToken(token: string) {
    this.client.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  public get appId() {
    return this.client.defaults.headers['rs-app-id'] as string;
  }

  public set appId(appId: string) {
    this.client.defaults.headers['rs-app-id'] = appId;
  }

  public get clientId() {
    return this.client.defaults.headers['rs-client-id'] as string;
  }

  public set clientId(clientId: string) {
    this.client.defaults.headers['rs-client-id'] = clientId;
  }

  public get url() {
    return this.client.defaults.baseURL as string;
  }

  public set url(url: string) {
    this.client.defaults.baseURL = url;
  }

  public set headers(headers: { [key: string]: AxiosHeaderValue }) {
    this.client.defaults.headers = headers as HeadersDefaults & {
      [key: string]: AxiosHeaderValue;
    };
  }

  public getHeaders(name: string) {
    return this.client.defaults.headers[name];
  }

  public setAccessToken(token: string) {
    this.client.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  public setAppId(appId: string) {
    this.client.defaults.headers['rs-app-id'] = appId;
  }

  public setClientId(clientId: string) {
    this.client.defaults.headers['rs-client-id'] = clientId;
  }

  public setUrl(url: string) {
    this.client.defaults.baseURL = url;
  }

  public setHeaders(headers: { [key: string]: AxiosHeaderValue }) {
    this.client.defaults.headers = headers as HeadersDefaults & {
      [key: string]: AxiosHeaderValue;
    };
  }

  public addService(name: string, client: any) {
    Object.defineProperty(this, name, {
      get() {
        return new client(this.client);
      },
    });
  }

  public addServices(services: { name: string; client: any }[]) {
    services.forEach(({ name, client }) => {
      Object.defineProperty(this, name, {
        get() {
          return new client(this.client);
        },
      });
    });
  }
}

//TODO: Implement local storage retrieval for server info
const serverInfo = { url: null, clientId: '1111111' }; //await getServerInfo();
const baseURL = serverInfo?.url || process.env.EXPO_PUBLIC_SERVER_URL;

const ApiService = ApiClient.getInstance({
  baseURL,
});

export default ApiService;
