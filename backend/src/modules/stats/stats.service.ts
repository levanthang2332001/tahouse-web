import { Injectable } from '@nestjs/common';
import { StatsRepository } from './repositories/stats.repository';
import { IAdminDashboardStatsResponse } from './types/stats.types';

@Injectable()
export class StatsService {
  constructor(private readonly statsRepository: StatsRepository) {}

  async getDashboardStats(): Promise<IAdminDashboardStatsResponse> {
    return this.statsRepository.getDashboardStats();
  }
}
