import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    RedisModule
  ],
  controllers: [GradesController],
  providers: [GradesService],
})
export class GradesModule {}
