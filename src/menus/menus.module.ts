import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { OutletsModule } from 'src/outlets/outlets.module';

@Module({
  imports: [OutletsModule],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
