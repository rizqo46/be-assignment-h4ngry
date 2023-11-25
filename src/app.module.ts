import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { OutletsModule } from './outlets/outlets.module';

@Module({
  imports: [ConfigModule.forRoot(), SharedModule, OutletsModule],
})
export class AppModule {}
