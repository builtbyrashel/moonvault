import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

interface ProcessImageJobData {
  imageId: string;
}

@Injectable()
export class ProcessingQueueService {
  constructor(
    @InjectQueue('image-processing') private queue: Queue<ProcessImageJobData>,
  ) {}

  async enqueueImageProcessing(imageId: string): Promise<void> {
    await this.queue.add('process-image', { imageId });
  }
}
