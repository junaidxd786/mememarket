import { UserPortfolio, StakingTier } from '../types';
import { STAKING_TIERS, ANALYTICS_CONFIG } from '../utils/constants';

export class StakingService {
  private static instance: StakingService;

  static getInstance(): StakingService {
    if (!StakingService.instance) {
      StakingService.instance = new StakingService();
    }
    return StakingService.instance;
  }

  getStakingTier(amount: number): StakingTier {
    return STAKING_TIERS.find(tier =>
      amount >= tier.minAmount && amount <= tier.maxAmount
    ) || STAKING_TIERS[0];
  }

  calculateStakingRewards(portfolio: UserPortfolio): number {
    const tier = this.getStakingTier(portfolio.stakedCoins);
    const timeSinceLastClaim = Date.now() - portfolio.lastStakingClaim;
    const hoursSinceLastClaim = timeSinceLastClaim / (1000 * 60 * 60);

    // Calculate daily reward based on APR
    const dailyRate = tier.apr / 100 / 365;
    const dailyReward = portfolio.stakedCoins * dailyRate;

    // Calculate reward for the time period
    const reward = dailyReward * (hoursSinceLastClaim / 24);

    return Math.max(0, Math.floor(reward));
  }

  canClaimRewards(portfolio: UserPortfolio): boolean {
    const timeSinceLastClaim = Date.now() - portfolio.lastStakingClaim;
    return timeSinceLastClaim >= ANALYTICS_CONFIG.STAKING_CLAIM_INTERVAL;
  }

  stakeCoins(portfolio: UserPortfolio, amount: number): UserPortfolio {
    if (amount > portfolio.memeCoins) {
      throw new Error('Insufficient MemeCoins to stake');
    }

    return {
      ...portfolio,
      memeCoins: portfolio.memeCoins - amount,
      stakedCoins: portfolio.stakedCoins + amount,
      lastStakingClaim: Date.now() // Reset claim timer when staking
    };
  }

  unstakeCoins(portfolio: UserPortfolio, amount: number): UserPortfolio {
    if (amount > portfolio.stakedCoins) {
      throw new Error('Insufficient staked coins');
    }

    // Claim any pending rewards before unstaking
    const updatedPortfolio = this.claimRewards(portfolio);

    return {
      ...updatedPortfolio,
      stakedCoins: updatedPortfolio.stakedCoins - amount,
      memeCoins: updatedPortfolio.memeCoins + amount
    };
  }

  claimRewards(portfolio: UserPortfolio): UserPortfolio {
    const rewards = this.calculateStakingRewards(portfolio);

    return {
      ...portfolio,
      memeCoins: portfolio.memeCoins + rewards,
      stakingRewards: portfolio.stakingRewards + rewards,
      lastStakingClaim: Date.now()
    };
  }

  getStakingStats(portfolio: UserPortfolio) {
    const tier = this.getStakingTier(portfolio.stakedCoins);
    const rewards = this.calculateStakingRewards(portfolio);
    const timeUntilNextClaim = Math.max(0,
      ANALYTICS_CONFIG.STAKING_CLAIM_INTERVAL - (Date.now() - portfolio.lastStakingClaim)
    );

    return {
      currentTier: tier,
      pendingRewards: rewards,
      totalStaked: portfolio.stakedCoins,
      totalRewards: portfolio.stakingRewards,
      timeUntilNextClaim,
      nextTierThreshold: tier.maxAmount < Infinity ?
        STAKING_TIERS.find(t => t.minAmount > tier.maxAmount)?.minAmount || Infinity : Infinity
    };
  }
}

export const stakingService = StakingService.getInstance();
