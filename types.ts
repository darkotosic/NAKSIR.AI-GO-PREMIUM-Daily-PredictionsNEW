export enum PredictionType {
    MATCH_WINNER = 'Match Winner',
    DOUBLE_CHANCE = 'Double Chance',
    CORRECT_SCORE = 'Correct Score',
    GOALS_OVER_2_5 = 'Over 2.5 Goals',
    BTTS = 'BTTS (Yes)',
  }
  
  export interface Team {
    name: string;
    logo: string;
    form: string;
  }
  
  export interface Match {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
    league: string;
    kickoff: string;
    venue: string;
    xG_home: number;
    xG_away: number;
    shotsOnTarget_home: number;
    shotsOnTarget_away: number;
    oddsTrend: 'Dropping' | 'Stable' | 'Drifting';
  }
  
  export interface Prediction {
    id: string;
    matchId: string;
    type: PredictionType;
    value: string;
    confidence: number;
    odds: number;
    isLocked: boolean;
    analysis?: string;
    aiReasoning?: string;
  }
  
  export interface FullPredictionData extends Match {
    prediction: Prediction;
  }

  // Structure for deep data from API-Football
  export interface MatchIntelligence {
    predictions: any; // Raw prediction object from API
    injuries: any[];
    h2h: any[];
    form: {
        home: string;
        away: string;
    };
  }