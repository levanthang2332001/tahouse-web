import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { BusinessException } from '@/common/exceptions';
import { ErrorCode } from '@/common/constants/error-codes';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    const mockResponse = {
      status: mockStatus,
    };
    const mockRequest = {
      method: 'GET',
      url: '/test',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should format standard HttpException into standardized error response', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      code: 404,
      message: 'Not Found',
      data: null,
    });
  });

  it('should format BusinessException with errorName and structured params', () => {
    const exception = new BusinessException(
      ErrorCode.PRODUCT_NOT_FOUND,
      'Product not found: test-slug',
      'id',
      { id: 'test-slug' },
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      code: ErrorCode.PRODUCT_NOT_FOUND.errorCode,
      errorName: 'PRODUCT_NOT_FOUND',
      message: 'Product not found: test-slug',
      data: {
        field: 'id',
        params: { id: 'test-slug' },
      },
    });
  });

  it('should fallback to 500 Internal Server Error for unhandled generic errors', () => {
    const error = new Error('Database connection failed');

    filter.catch(error, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      code: 500,
      message: 'Database connection failed',
      data: null,
    });
  });
});
