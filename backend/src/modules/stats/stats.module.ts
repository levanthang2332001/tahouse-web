import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AdminStatsController } from './admin-stats.controller';
import { StatsRepository } from './repositories/stats.repository';

@Module({
  controllers: [AdminStatsController],
  providers: [StatsService, StatsRepository],
  exports: [StatsService, StatsRepository],
})
export class StatsModule {}
