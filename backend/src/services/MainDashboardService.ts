import { MainDashboardRepository, MainDashboardData } from '../repositories/MainDashboardRepository';

export class MainDashboardService {
    constructor(private dashboardRepo: MainDashboardRepository) {}
  
    async getDashboardData(restaurentId: string, filter?: '7days' | '30days' | 'month' | 'year'): Promise<MainDashboardData> {
      return await this.dashboardRepo.getDashboardData(restaurentId, filter);
    }
  }