import { Tournament, TournamentParticipant, UserPortfolio } from '../types';
import { TOURNAMENT_CONFIG } from '../utils/constants';

export class TournamentService {
  private static instance: TournamentService;
  private tournaments: Tournament[] = [];

  static getInstance(): TournamentService {
    if (!TournamentService.instance) {
      TournamentService.instance = new TournamentService();
    }
    return TournamentService.instance;
  }

  createTournament(name: string, description: string, startDate: number): Tournament {
    const tournament: Tournament = {
      id: `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      startDate,
      endDate: startDate + (TOURNAMENT_CONFIG.DURATION_HOURS * 60 * 60 * 1000),
      prizePool: 0,
      entryFee: TOURNAMENT_CONFIG.ENTRY_FEE,
      maxParticipants: TOURNAMENT_CONFIG.MAX_PARTICIPANTS,
      currentParticipants: 0,
      status: 'upcoming',
      rules: [
        `Entry fee: ${TOURNAMENT_CONFIG.ENTRY_FEE} MemeCoins`,
        `Duration: ${TOURNAMENT_CONFIG.DURATION_HOURS} hours`,
        `Points per win: ${TOURNAMENT_CONFIG.POINTS_PER_WIN}`,
        `Points per loss: ${TOURNAMENT_CONFIG.POINTS_PER_LOSS}`,
        `Consecutive win bonus: ${TOURNAMENT_CONFIG.BONUS_MULTIPLIER}x`
      ],
      leaderboard: []
    };

    this.tournaments.push(tournament);
    return tournament;
  }

  joinTournament(tournamentId: string, portfolio: UserPortfolio): { success: boolean; tournament?: Tournament; updatedPortfolio?: UserPortfolio; error?: string } {
    const tournament = this.tournaments.find(t => t.id === tournamentId);

    if (!tournament) {
      return { success: false, error: 'Tournament not found' };
    }

    if (tournament.status !== 'upcoming') {
      return { success: false, error: 'Tournament has already started' };
    }

    if (tournament.currentParticipants >= tournament.maxParticipants) {
      return { success: false, error: 'Tournament is full' };
    }

    if (portfolio.memeCoins < tournament.entryFee) {
      return { success: false, error: 'Insufficient MemeCoins for entry fee' };
    }

    // Check if user is already participating
    const existingParticipant = tournament.leaderboard.find(p => p.userId === portfolio.userId);
    if (existingParticipant) {
      return { success: false, error: 'Already participating in this tournament' };
    }

    // Add participant
    const participant: TournamentParticipant = {
      userId: portfolio.userId,
      username: `Player_${portfolio.userId.slice(-4)}`,
      points: 0,
      rank: tournament.leaderboard.length + 1,
      predictions: 0,
      winRate: 0
    };

    tournament.leaderboard.push(participant);
    tournament.currentParticipants++;
    tournament.prizePool += tournament.entryFee;

    // Update portfolio
    const updatedPortfolio = {
      ...portfolio,
      memeCoins: portfolio.memeCoins - tournament.entryFee,
      currentTournament: tournamentId,
      tournamentPoints: 0
    };

    return { success: true, tournament, updatedPortfolio };
  }

  updateTournamentPoints(tournamentId: string, userId: string, won: boolean, consecutiveWins: number = 0): void {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    if (!tournament || tournament.status !== 'active') return;

    const participant = tournament.leaderboard.find(p => p.userId === userId);
    if (!participant) return;

    const basePoints = won ? TOURNAMENT_CONFIG.POINTS_PER_WIN : TOURNAMENT_CONFIG.POINTS_PER_LOSS;
    const bonusMultiplier = won && consecutiveWins > 1 ? TOURNAMENT_CONFIG.BONUS_MULTIPLIER : 1;
    const pointsToAdd = Math.floor(basePoints * bonusMultiplier);

    participant.points += pointsToAdd;
    participant.predictions++;

    // Update win rate
    const totalWins = tournament.leaderboard.filter(p => p.points > 0).length;
    participant.winRate = participant.predictions > 0 ? (totalWins / participant.predictions) * 100 : 0;

    // Sort leaderboard
    tournament.leaderboard.sort((a, b) => b.points - a.points);
    tournament.leaderboard.forEach((p, index) => p.rank = index + 1);
  }

  startTournament(tournamentId: string): boolean {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    if (!tournament || tournament.status !== 'upcoming') return false;

    tournament.status = 'active';
    return true;
  }

  endTournament(tournamentId: string): { winners: TournamentParticipant[]; prizes: number[] } {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    if (!tournament || tournament.status !== 'active') {
      return { winners: [], prizes: [] };
    }

    tournament.status = 'completed';
    tournament.endDate = Date.now();

    // Sort final leaderboard
    tournament.leaderboard.sort((a, b) => b.points - a.points);

    // Calculate prizes
    const prizes = TOURNAMENT_CONFIG.PRIZE_DISTRIBUTION.map(ratio =>
      Math.floor(tournament.prizePool * ratio)
    );

    const winners = tournament.leaderboard.slice(0, prizes.length);

    return { winners, prizes };
  }

  getActiveTournaments(): Tournament[] {
    return this.tournaments.filter(t => t.status === 'active');
  }

  getUpcomingTournaments(): Tournament[] {
    return this.tournaments.filter(t => t.status === 'upcoming');
  }

  getTournament(tournamentId: string): Tournament | undefined {
    return this.tournaments.find(t => t.id === tournamentId);
  }

  getUserTournamentRank(tournamentId: string, userId: string): number {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return 0;

    const participant = tournament.leaderboard.find(p => p.userId === userId);
    return participant?.rank || 0;
  }

  // Initialize with some sample tournaments
  initializeDefaultTournaments(): void {
    if (this.tournaments.length === 0) {
      const now = Date.now();
      this.createTournament(
        'Daily Meme Masters',
        'Compete for the best meme predictions in 24 hours!',
        now + (2 * 60 * 60 * 1000) // Start in 2 hours
      );

      this.createTournament(
        'Weekend Champion',
        'Longer tournament with bigger prizes!',
        now + (24 * 60 * 60 * 1000) // Start in 24 hours
      );
    }
  }
}

export const tournamentService = TournamentService.getInstance();
