export interface MlmPlanSettings {
  mrp: string;
  direct_partner_commission_percentage: string;
  distributor_price: string;
  distributor_price_mode: string;
  distributor_price_percentage: string;
  packets_per_package: string;
  holding_period_days: string;
  maximum_generation_level: string;
}

export interface GenerationCommission {
  id?: number;
  level: number;
  level_name: string;
  percentage: string;
}

export interface MlmRank {
  id: number;
  rank_name: string;
  milestone_threshold: string;
  threshold_type: string;
}

export interface MlmReward {
  id?: number;
  reward_type: string;
  reward_value: string;
  reward_description: string;
}

export interface MlmPlanResponse {
  status?: boolean;
  success?: boolean;
  message?: string;
  data?: {
    settings?: Partial<MlmPlanSettings>;
    plan_settings?: Partial<MlmPlanSettings>;
    commissions?: Array<Record<string, unknown>>;
    generation_commissions?: Array<Record<string, unknown>>;
    ranks?: Array<Record<string, unknown>>;
    rewards?: Array<Record<string, unknown>>;
  };
}

export type { ServerResponse } from '@/lib/constantFunction';
