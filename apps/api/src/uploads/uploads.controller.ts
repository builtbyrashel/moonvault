import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuotaGuard } from '../storage/quota.guard';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadsService } from '../uploads/uploads.service';
import { JwtUser } from '../auth/types/types';

interface RequestWithUser extends Request {
  user: JwtUser;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

@Controller('uploads')
@UseGuards(JwtAuthGuard, QuotaGuard)
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadImageDto,
    @Req() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    return this.uploadsService.handleUpload(req.user.userId, file, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.uploadsService.getById(id, req.user.userId);
  }
}
