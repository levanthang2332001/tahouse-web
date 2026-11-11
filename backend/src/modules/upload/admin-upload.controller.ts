import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiRoute, ErrorCode, SwaggerTag } from '@/common/constants';
import { BusinessException } from '@/common/exceptions';
import { JwtAuthGuard } from '@/common/guards';
import { UploadService } from './upload.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';
import { MediaUploadInterceptor } from './interceptors/media-upload.interceptor';
import {
  ALLOWED_UPLOAD_FOLDERS,
  formatMb,
  MAX_FILES_PER_REQUEST,
  MAX_IMAGE_BYTES,
  MAX_TOTAL_UPLOAD_BYTES,
  MAX_VIDEO_BYTES,
} from './upload.constants';

/** force=true|1 cho phép xóa tệp đang được sử dụng */
const parseForce = (value: unknown): boolean =>
  value === true || value === 'true' || value === '1';

const unifiedUploadSchema = {
  type: 'object',
  properties: {
    file: {
      type: 'string',
      format: 'binary',
      description:
        'Tệp tin đơn lẻ tải lên (hoặc dùng trường files để tải nhiều tệp cùng lúc)',
    },
    files: {
      type: 'array',
      items: {
        type: 'string',
        format: 'binary',
      },
      description: `Danh sách nhiều tệp tải lên đồng thời (tối đa ${MAX_FILES_PER_REQUEST} tệp, tổng ${formatMb(MAX_TOTAL_UPLOAD_BYTES)})`,
    },
    folder: {
      type: 'string',
      description: `Thư mục gốc lưu trữ trên Cloudflare R2 (mặc định: products). Chỉ chấp nhận: ${ALLOWED_UPLOAD_FOLDERS.join(', ')}`,
      enum: [...ALLOWED_UPLOAD_FOLDERS],
      example: 'products',
    },
    brand: {
      type: 'string',
      description: 'Thương hiệu sản phẩm (ví dụ: kaadas, philips, hafele)',
      example: 'kaadas',
    },
    category: {
      type: 'string',
      description: 'Danh mục chính (ví dụ: khoa-cua-dien-tu, dai-sanh)',
      example: 'khoa-cua-dien-tu',
    },
    subcategory: {
      type: 'string',
      description: 'Danh mục phụ (ví dụ: khoa-nhan-dien-khuon-mat, tay-gat)',
      example: 'khoa-nhan-dien-khuon-mat',
    },
    productCode: {
      type: 'string',
      description: 'Mã model sản phẩm (ví dụ: KL-589FG, K9)',
      example: 'KL-589FG',
    },
  },
};

@ApiTags(SwaggerTag.ADMIN_UPLOAD)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AdminUploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(ApiRoute.ADMIN_UPLOAD)
  @ApiOperation({
    summary: 'API Upload hình ảnh và video lên Cloudflare R2',
    description: `Tải lên 1 hoặc nhiều tệp tin Hình ảnh hoặc Video trực tiếp lên Cloudflare R2.
1. Định dạng được xác định bằng magic bytes (không tin Content-Type): ảnh JPG, PNG, WebP, GIF, AVIF (tối đa ${formatMb(MAX_IMAGE_BYTES)}) và video MP4, WebM, MOV (tối đa ${formatMb(MAX_VIDEO_BYTES)}). SVG và mọi định dạng khác bị từ chối (400).
2. Tối đa ${MAX_FILES_PER_REQUEST} tệp / request, tổng ${formatMb(MAX_TOTAL_UPLOAD_BYTES)} (413 nếu vượt).
3. Đường dẫn: [folder]/[brand]/[category]/[subcategory]/[productCode]/[tên-tệp]-[uuid].[ext]; folder phải thuộc danh sách cho phép.
4. 1 tệp: data là bản ghi Media (data.url). Nhiều tệp: data = { uploaded, failed, total, successCount, failureCount }; nếu không tệp nào thành công thì trả lỗi.`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: unifiedUploadSchema })
  @ApiResponse({
    status: 201,
    description: 'Tải lên Cloudflare R2 và lưu document Media thành công',
  })
  @UseInterceptors(MediaUploadInterceptor)
  async uploadMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadMediaDto,
  ) {
    if (!files || files.length === 0) {
      throw new BusinessException(
        ErrorCode.MEDIA_VALIDATION_ERROR,
        'Vui lòng chọn ít nhất một tệp để tải lên (trường file hoặc files).',
        'file',
      );
    }

    return this.uploadService.uploadFiles(files, dto);
  }

  @Get(ApiRoute.ADMIN_UPLOAD)
  @ApiOperation({
    summary: 'Lấy danh sách các tài nguyên Media đã lưu trữ trong hệ thống',
    description:
      'Hỗ trợ tìm kiếm, lọc theo brand, category, subcategory, productCode, fileType và phân trang.',
  })
  async getMediaList(@Query() query: QueryMediaDto) {
    return this.uploadService.findAll(query);
  }

  @Get(ApiRoute.ADMIN_UPLOAD_DETAIL)
  @ApiOperation({
    summary: 'Xem chi tiết thông số của 1 tài nguyên Media theo ID',
  })
  @ApiParam({ name: 'id', description: 'ID của bản ghi Media trong D1' })
  async getMediaDetail(@Param('id') id: string) {
    return this.uploadService.findById(id);
  }

  @Delete(ApiRoute.ADMIN_UPLOAD_DETAIL)
  @ApiOperation({
    summary: 'Xóa tài nguyên Media khỏi Cloudflare R2 và D1 theo ID',
    description:
      'Chỉ xóa được tệp có bản ghi trong D1 (404 nếu không có). Nếu tệp đang được dùng ở sản phẩm, thương hiệu hoặc cài đặt cửa hàng thì trả 409 kèm tóm tắt, trừ khi gửi force=true.',
  })
  @ApiParam({ name: 'id', description: 'ID của bản ghi Media trong D1' })
  @ApiQuery({ name: 'force', required: false, type: Boolean })
  async deleteMediaById(
    @Param('id') id: string,
    @Query('force') force?: string,
  ) {
    return this.uploadService.deleteMedia(id, { force: parseForce(force) });
  }

  @Delete(ApiRoute.ADMIN_UPLOAD)
  @ApiOperation({
    summary: 'Xóa tài nguyên Media theo ID hoặc URL/Key đã lưu qua Body',
    description:
      'URL/Key phải khớp 1 bản ghi Media trong D1 (404 nếu không có). force=true (body hoặc query) để xóa tệp đang được sử dụng.',
  })
  async deleteMediaByBody(
    @Body('url') url: string,
    @Body('id') id: string,
    @Body('force') bodyForce?: unknown,
    @Query('force') queryForce?: string,
  ) {
    const target = id || url;
    if (!target) {
      throw new BusinessException(
        ErrorCode.MEDIA_VALIDATION_ERROR,
        'Thiếu ID hoặc URL của tệp cần xóa.',
      );
    }
    return this.uploadService.deleteMedia(target, {
      force: parseForce(bodyForce) || parseForce(queryForce),
    });
  }
}
