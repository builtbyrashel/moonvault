import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [PrismaModule, AuthModule, StorageModule, UploadsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
