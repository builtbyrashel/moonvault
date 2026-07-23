import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { UploadsModule } from './uploads/uploads.module';
import { GalleryModule } from './gallery/gallery.module';
import { GalleryService } from './gallery/gallery.service';
import { GalleryController } from './gallery/gallery.controller';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    PrismaModule,
    AuthModule,
    StorageModule,
    UploadsModule,
    GalleryModule,
    ProfileModule,
  ],
  controllers: [AppController, GalleryController],
  providers: [AppService, GalleryService],
})
export class AppModule {}
