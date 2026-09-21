export interface LevelCommission {
  level_no: number;
  type: string;
  level_name: string;
  commission_percentage: number;
}

export interface LevelCapping{
  id:number;
  level_id:string;
  level_no:number;
  level_name:string;
  day_limit:string;
  week_limit:string;
  monthly_limit:string;
  created_at:string;
}

export interface Milestone {
  id: number;
  level_id: string | number;
  milestone_name: string;
  tour_details: string;
  reward_cash: string;
  cash_com?:string;
  level_name?: string;
  level_no?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMilestonePayload {
  level_id: string | number;
  milestone_name: string;
  tour_details: string;
  reward_cash: string;
}

export interface UpdateMilestonePayload {
  level_id?: string | number;
  milestone_name?: string;
  tour_details?: string;
  reward_cash?: string;
}

export type MilestonesResponse = ServerResponse<Milestone[]>;
export type MilestoneResponse = ServerResponse<Milestone>;

import type { ServerResponse } from '@/lib/constantFunction';
