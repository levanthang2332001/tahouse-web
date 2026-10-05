import { ILogPayload } from './log-payload.interface';

export interface ILogSender {
  send(logs: ILogPayload[]): Promise<void>;
  isReady(): boolean;
}
