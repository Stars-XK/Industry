import { Module, Global } from '@nestjs/common';
import { TDengineService } from './tdengine.service';

@Global()
@Module({
  providers: [TDengineService],
  exports: [TDengineService],
})
export class TDengineModule {}
