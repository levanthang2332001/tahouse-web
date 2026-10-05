export interface ILogPayload {
  '@timestamp': string;
  service: string;
  environment: string;
  hostname: string;
  method: string;
  statusCode: number;
  duration: number;
  url: string;
  headers: Record<string, unknown>;
  body: string;
  query: string;
  response: string;
}

export interface IKafkaLoggerConfig {
  brokers: string;
  username: string;
  password: string;
  clientId: string;
  topic: string;
  batchSize: number;
  batchInterval: number;
  enabled: boolean;
}
