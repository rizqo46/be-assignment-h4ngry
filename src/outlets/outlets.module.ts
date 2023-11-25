import { Module } from '@nestjs/common';
import { OutletsService } from './outlets.service';
import { OutletsController } from './outlets.controller';

@Module({
  controllers: [OutletsController],
  providers: [OutletsService],
})
export class OutletsModule {}
