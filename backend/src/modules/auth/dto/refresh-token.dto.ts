import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { DefaultErrorCode } from '@/common/decorators';
import { ErrorCode } from '@/common/constants';

@DefaultErrorCode(ErrorCode.AUTH_VALIDATION_ERROR)
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh Token được cấp khi đăng nhập',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  refreshToken: string;
}
