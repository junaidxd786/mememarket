import { Alert, UserPortfolio, Prediction } from '../types';
import { ALERT_TYPES, ANALYTICS_CONFIG } from '../utils/constants';

export class AlertService {
  private static instance: AlertService;
  private alerts: Alert[] = [];
  private listeners: ((alerts: Alert[]) => void)[] = [];

  static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  subscribe(listener: (alerts: Alert[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getAlerts()));
  }

  addAlert(type: string, title: string, message: string, actionUrl?: string): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      title,
      message,
      createdAt: Date.now(),
      read: false,
      actionUrl
    };

    this.alerts.unshift(alert); // Add to beginning
    this.notifyListeners();
  }

  markAsRead(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      this.notifyListeners();
    }
  }

  markAllAsRead(): void {
    this.alerts.forEach(alert => alert.read = true);
    this.notifyListeners();
  }

  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  getUnreadAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.read);
  }

  checkExpiringBets(portfolio: UserPortfolio): void {
    portfolio.predictions
      .filter(p => p.status === 'active')
      .forEach(prediction => {
        const timeRemaining = prediction.created + (24 * 60 * 60 * 1000) - Date.now();
        const hoursRemaining = timeRemaining / (1000 * 60 * 60);

        if (hoursRemaining <= 2 && hoursRemaining > 0) {
          this.addAlert(
            ALERT_TYPES.EXPIRING_BET,
            'Bet Expiring Soon!',
            `Your bet on "${prediction.postTitle}" expires in ${Math.floor(hoursRemaining)} hours`,
            `/market/post/${prediction.postId}`
          );
        }
      });
  }

  checkStakingRewards(portfolio: UserPortfolio): void {
    const timeSinceLastClaim = Date.now() - portfolio.lastStakingClaim;
    const hoursSinceLastClaim = timeSinceLastClaim / (1000 * 60 * 60);

    if (hoursSinceLastClaim >= 1 && portfolio.stakedCoins > 0) {
      const pendingRewards = Math.floor(portfolio.stakedCoins * 0.05 / 24 * hoursSinceLastClaim); // Rough calculation

      if (pendingRewards > 10) { // Only notify if significant rewards
        this.addAlert(
          ALERT_TYPES.STAKING_REWARD,
          'Staking Rewards Available!',
          `You have ${pendingRewards} MemeCoins ready to claim from staking`,
          '/portfolio'
        );
      }
    }
  }

  checkTournamentUpdates(portfolio: UserPortfolio): void {
    if (portfolio.currentTournament) {
      this.addAlert(
        ALERT_TYPES.TOURNAMENT,
        'Tournament Update',
        `Your tournament ranking has been updated! Current points: ${portfolio.tournamentPoints}`,
        '/tournaments'
      );
    }
  }

  checkMarketOpportunities(portfolio: UserPortfolio, trendingPosts: any[]): void {
    // Check for high-potential posts
    const highPotentialPosts = trendingPosts.filter(post =>
      post.score > 1000 && post.commentCount > 50
    );

    if (highPotentialPosts.length > 0) {
      this.addAlert(
        ALERT_TYPES.MARKET_OPPORTUNITY,
        'Market Opportunity!',
        `${highPotentialPosts.length} high-potential posts detected. Great time to place bets!`,
        '/market'
      );
    }
  }

  checkAchievements(portfolio: UserPortfolio): void {
    // Check for potential achievements
    const totalPredictions = portfolio.predictions.length;
    const wonPredictions = portfolio.predictions.filter(p => p.status === 'won').length;

    if (totalPredictions >= 10 && wonPredictions >= 5) {
      this.addAlert(
        ALERT_TYPES.ACHIEVEMENT,
        'Achievement Unlocked!',
        'You\'ve earned the "Consistent Trader" achievement!',
        '/achievements'
      );
    }
  }

  // Periodic check function to be called by main app
  performPeriodicChecks(portfolio: UserPortfolio, trendingPosts: any[] = []): void {
    this.checkExpiringBets(portfolio);
    this.checkStakingRewards(portfolio);
    this.checkTournamentUpdates(portfolio);
    this.checkMarketOpportunities(portfolio, trendingPosts);
    this.checkAchievements(portfolio);
  }

  // Clean up old alerts (keep last 50)
  cleanupOldAlerts(): void {
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
      this.notifyListeners();
    }
  }
}

export const alertService = AlertService.getInstance();
