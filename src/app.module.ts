import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { OutletsModule } from './outlets/outlets.module';
import { MenusModule } from './menus/menus.module';

@Module({
  imports: [ConfigModule.forRoot(), SharedModule, OutletsModule, MenusModule],
})
export class AppModule {}
