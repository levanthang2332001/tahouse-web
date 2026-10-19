import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let mockContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockResponse: { statusCode: number };

  beforeEach(() => {
    interceptor = new TransformInterceptor();
    mockResponse = { statusCode: 200 };

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ExecutionContext;
  });

  it('should wrap raw response in standardized success contract format', async () => {
    const rawData = { items: [{ id: 'prod-1', name: 'Lock' }], total: 1 };
    mockCallHandler = {
      handle: () => of(rawData),
    };

    const observable = interceptor.intercept(mockContext, mockCallHandler);
    const result = await lastValueFrom(observable);

    expect(result).toEqual({
      success: true,
      code: 200,
      message: 'success',
      data: rawData,
    });
  });

  it('should preserve response when already formatted with success contract', async () => {
    const preformatted = {
      success: true,
      code: 201,
      message: 'custom message',
      data: { id: 'created-id' },
    };
    mockCallHandler = {
      handle: () => of(preformatted),
    };

    const observable = interceptor.intercept(mockContext, mockCallHandler);
    const result = await lastValueFrom(observable);

    expect(result).toEqual(preformatted);
  });
});
