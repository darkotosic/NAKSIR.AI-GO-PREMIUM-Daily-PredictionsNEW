import { FullPredictionData, PredictionType } from './types';

export const API_FOOTBALL_KEY = '5095fa7361c20294d79830961448467f';
export const API_FOOTBALL_URL = 'https://v3.football.api-sports.io';
export const OPENAI_API_KEY = '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';

// Converted from Python set to JS Array
export const ALLOW_LIST = [
    2,3,913,5,536,808,960,10,667,29,30,31,32,37,33,34,848,311,310,342,218,144,315,71,
    169,210,346,233,39,40,41,42,703,244,245,61,62,78,79,197,271,164,323,135,136,389,
    88,89,408,103,104,106,94,283,235,286,287,322,140,141,113,207,208,202,203,909,268,269,270,340
];

export const SKIP_STATUS = ["FT","AET","PEN","ABD","AWD","CANC","POSTP","PST","SUSP","INT","WO","LIVE"];

export const LEAGUES = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League'];

// Helper to generate a date for today/tomorrow
const getDate = (offsetHours: number) => {
  const date = new Date();
  date.setHours(date.getHours() + offsetHours);
  return date.toISOString();
};

// Keep as fallback type structure example
export const MOCK_PREDICTIONS: FullPredictionData[] = [
  {
    id: 'm1',
    homeTeam: { name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png', form: 'W-W-W-D-W' },
    awayTeam: { name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png', form: 'W-D-W-W-L' },
    league: 'Premier League',
    kickoff: getDate(2),
    venue: 'Emirates Stadium',
    xG_home: 2.1,
    xG_away: 1.8,
    shotsOnTarget_home: 6,
    shotsOnTarget_away: 4,
    oddsTrend: 'Dropping',
    prediction: {
      id: 'p1',
      matchId: 'm1',
      type: PredictionType.MATCH_WINNER,
      value: 'Home Win',
      confidence: 78,
      odds: 1.55,
      isLocked: false,
    }
  }
];