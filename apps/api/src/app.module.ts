import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { StorageService } from './storage.service';
import { MeController } from './me.controller';
import { UploadsModule } from './uploads/uploads.module';
import { UploadsController } from './uploads/uploads.controller';

@Module({
  imports: [PrismaModule, AuthModule, StorageModule, UploadsModule],
  controllers: [AppController, MeController, UploadsController],
  providers: [AppService, StorageService],
})
export class AppModule {}
