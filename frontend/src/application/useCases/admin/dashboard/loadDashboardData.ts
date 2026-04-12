import {DashboardData} from "@domain/dashboard/entities";
import {DashboardApiAdapter} from "../../../../infrastructure/theme/dashboardApi";

export class LoadDashboardDataUseCase {
  static async execute(): Promise<DashboardData> {
    return await DashboardApiAdapter.getDashboardData();
  }
}
