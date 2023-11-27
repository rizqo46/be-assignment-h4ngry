import { Module } from '@nestjs/common';
import { OutletsService } from './outlets.service';
import { OutletsController } from './outlets.controller';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [OutletsController],
  providers: [OutletsService],
  exports: [OutletsService],
})
export class OutletsModule {}
