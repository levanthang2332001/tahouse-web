import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AdminStatsController } from './admin-stats.controller';

@Module({
  controllers: [AdminStatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
