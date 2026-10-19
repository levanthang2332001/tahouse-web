import { HttpException } from '@nestjs/common';
import { IErrorCodeDefinition } from '../constants/error-codes';

export class BusinessException extends HttpException {
  public readonly errorCode: number;
  public readonly errorName: string;
  public readonly field?: string;
  public readonly params?: Record<string, unknown>;

  constructor(
    errorDef: IErrorCodeDefinition,
    message: string,
    field?: string,
    params?: Record<string, unknown>,
  ) {
    super(
      {
        errorCode: errorDef.errorCode,
        errorName: errorDef.errorName,
        message,
        ...(field ? { field } : {}),
        ...(params ? { params } : {}),
      },
      errorDef.httpStatus,
    );
    this.errorCode = errorDef.errorCode;
    this.errorName = errorDef.errorName;
    this.field = field;
    this.params = params;
  }
}
