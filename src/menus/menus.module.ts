import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { OutletsModule } from 'src/outlets/outlets.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [OutletsModule, SharedModule],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
