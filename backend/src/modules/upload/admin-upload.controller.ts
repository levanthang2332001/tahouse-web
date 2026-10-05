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
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ApiRoute, SwaggerTag } from '@/common/constants';
import { JwtAuthGuard } from '@/common/guards';
import { UploadService } from './upload.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';

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
      description:
        'Danh sách nhiều tệp tin tải lên đồng thời (Hình ảnh, Video, PDF, ZIP...)',
    },
    folder: {
      type: 'string',
      description:
        'Thư mục gốc lưu trữ trên Cloudflare R2 (mặc định: products, hoặc brands, categories, avatars, banners, documents, videos)',
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
    summary:
      'API Upload tổng hợp duy nhất lên Cloudflare R2 & Lưu trữ Document Media MongoDB',
    description: `Tải lên 1 hoặc nhiều tệp tin bất kỳ (Hình ảnh, Video, Tài liệu PDF/DOC/ZIP...) trực tiếp lên Cloudflare R2.
Hệ thống tự động:
1. Phân loại định dạng tệp (image, video, document, audio, other).
2. Tự động sinh đường dẫn phân cấp theo: [folder]/[brand]/[category]/[subcategory]/[productCode]/[filename].
3. Tự động trích xuất dung lượng size, kích thước width, height, aspectRatio, và duration video.
4. Upload trực tiếp buffer lên Cloudflare R2 (100% không dùng lưu trữ local).
5. Tạo document lưu toàn bộ thông số metadata vào collection "media" trong MongoDB Atlas để quản lý.`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: unifiedUploadSchema })
  @ApiResponse({
    status: 201,
    description: 'Tải lên Cloudflare R2 và lưu document Media thành công',
  })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB tối đa mỗi file
        files: 20, // Tối đa 20 file trong 1 request
      },
    }),
  )
  async uploadMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadMediaDto,
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'Please provide at least one file (file or files) in form-data',
      );
    }

    const username = req.user?.username || 'admin';
    return this.uploadService.uploadFiles(files, dto, username);
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
  @ApiParam({ name: 'id', description: 'ID của document Media trong MongoDB' })
  async getMediaDetail(@Param('id') id: string) {
    return this.uploadService.findById(id);
  }

  @Delete(ApiRoute.ADMIN_UPLOAD_DETAIL)
  @ApiOperation({
    summary: 'Xóa tài nguyên Media khỏi Cloudflare R2 và MongoDB theo ID',
  })
  @ApiParam({ name: 'id', description: 'ID của document Media trong MongoDB' })
  async deleteMediaById(@Param('id') id: string) {
    return this.uploadService.deleteMedia(id);
  }

  @Delete(ApiRoute.ADMIN_UPLOAD)
  @ApiOperation({
    summary: 'Xóa tài nguyên Media theo URL hoặc Key hoặc ID qua Body',
  })
  async deleteMediaByBody(@Body('url') url: string, @Body('id') id: string) {
    const target = id || url;
    if (!target) {
      throw new BadRequestException('Resource ID, Key, or URL is required');
    }
    return this.uploadService.deleteMedia(target);
  }
}
