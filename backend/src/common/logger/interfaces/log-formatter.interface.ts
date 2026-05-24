import { ILogPayload } from './log-payload.interface';

export interface ILogFormatter {
  format(data: Partial<ILogPayload>): ILogPayload;
}
