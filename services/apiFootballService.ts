import { FullPredictionData, PredictionType, MatchIntelligence } from '../types';
import { ALLOW_LIST, SKIP_STATUS, API_FOOTBALL_KEY, API_FOOTBALL_URL } from '../constants';

const HEADERS = {
  'x-rapidapi-key': API_FOOTBALL_KEY,
  'x-rapidapi-host': 'v3.football.api-sports.io'
};

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string };
    venue: { name: string };
  };
  league: {
    id: number;
    name: string;
  };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
}

interface ApiOdd {
  fixture: { id: number };
  bookmakers: {
    id: number;
    name: string;
    bets: {
      id: number;
      values: { value: string; odd: string }[];
    }[];
  }[];
}

// Helper to derive visual stats from odds probability
const deriveStats = (homeProb: number, awayProb: number) => {
  let xG_home = 1.2;
  let xG_away = 1.0;

  if (homeProb > awayProb) {
    xG_home += (homeProb * 1.5);
    xG_away = Math.max(0.2, xG_away - (homeProb * 0.5));
  } else {
    xG_away += (awayProb * 1.5);
    xG_home = Math.max(0.2, xG_home - (awayProb * 0.5));
  }

  // Add variance
  xG_home = Number((xG_home * (0.8 + Math.random() * 0.4)).toFixed(2));
  xG_away = Number((xG_away * (0.8 + Math.random() * 0.4)).toFixed(2));

  const shotsOnTarget_home = Math.floor(xG_home * (2.5 + Math.random()));
  const shotsOnTarget_away = Math.floor(xG_away * (2.5 + Math.random()));

  return { xG_home, xG_away, shotsOnTarget_home, shotsOnTarget_away };
};

const fetchOddsForDate = async (date: string): Promise<Record<number, any>> => {
    try {
        // Fetch odds for the date without restricting to a single bookmaker initially
        // This allows us to find the best available bookmaker for each match
        const response = await fetch(`${API_FOOTBALL_URL}/odds?date=${date}`, {
            method: 'GET',
            headers: HEADERS
        });
        
        if(!response.ok) return {};
        
        const json = await response.json();
        const oddsMap: Record<number, any> = {};
        
        if (json.response) {
            json.response.forEach((item: ApiOdd) => {
                const bookmakers = item.bookmakers;
                
                // Sort to find the most comprehensive bookmaker
                const sortedBookmakers = bookmakers.sort((a, b) => {
                    // 1. Comprehensiveness (Number of betting markets)
                    const diff = b.bets.length - a.bets.length;
                    if (diff !== 0) return diff;

                    // 2. Fallback Preference (ID 6 - Bwin, then ID 1 - Bet365)
                    const preferred = [6, 1];
                    const indexA = preferred.indexOf(a.id);
                    const indexB = preferred.indexOf(b.id);
                    
                    const pA = indexA === -1 ? 999 : indexA;
                    const pB = indexB === -1 ? 999 : indexB;
                    
                    return pA - pB;
                });

                const bestBookmaker = sortedBookmakers[0];

                if (bestBookmaker) {
                    const matchWinnerBet = bestBookmaker.bets.find(b => b.id === 1);
                    if (matchWinnerBet) {
                        oddsMap[item.fixture.id] = matchWinnerBet.values;
                    }
                }
            });
        }
        return oddsMap;
    } catch (e) {
        console.warn("Could not fetch real odds:", e);
        return {};
    }
}

export const fetchTodaysMatches = async (): Promise<FullPredictionData[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Fetch Fixtures (CET)
    const fixturesResp = await fetch(`${API_FOOTBALL_URL}/fixtures?date=${today}&timezone=Europe/Paris`, {
      method: 'GET',
      headers: HEADERS
    });

    if (!fixturesResp.ok) throw new Error('Failed to fetch fixtures');
    const fixturesJson = await fixturesResp.json();
    
    // 2. Fetch Odds
    const oddsMap = await fetchOddsForDate(today);

    // 3. Filter and Map
    const matches: FullPredictionData[] = [];

    fixturesJson.response.forEach((item: ApiFixture) => {
        const leagueId = item.league.id;
        const statusShort = item.fixture.status.short;
        const matchId = item.fixture.id;

        // Strict Filter: Allow List & Status
        if (!ALLOW_LIST.includes(leagueId) || SKIP_STATUS.includes(statusShort)) {
            return;
        }

        const odds = oddsMap[matchId];
        
        // Default values if no odds
        let homeOdd = 0; 
        let awayOdd = 0;

        if (odds) {
            homeOdd = parseFloat(odds.find((o: any) => o.value === 'Home')?.odd || '0');
            awayOdd = parseFloat(odds.find((o: any) => o.value === 'Away')?.odd || '0');
        }

        // Determine tentative winner based on market
        let predValue = 'Pending';
        let displayOdd = 0;
        let confidence = 50;
        let oddsTrend: 'Dropping' | 'Stable' | 'Drifting' = 'Stable';

        if (homeOdd > 0 && awayOdd > 0) {
            if (homeOdd < awayOdd) {
                predValue = 'Home Win';
                displayOdd = homeOdd;
                confidence = Math.min(95, Math.round((1/homeOdd) * 100));
                oddsTrend = homeOdd < 1.6 ? 'Dropping' : 'Stable';
            } else {
                predValue = 'Away Win';
                displayOdd = awayOdd;
                confidence = Math.min(95, Math.round((1/awayOdd) * 100));
                oddsTrend = awayOdd < 1.6 ? 'Dropping' : 'Stable';
            }
        }

        // Generate Stats
        const stats = deriveStats(homeOdd > 0 ? 1/homeOdd : 0.5, awayOdd > 0 ? 1/awayOdd : 0.5);

        matches.push({
            id: String(matchId),
            homeTeam: { name: item.teams.home.name, logo: item.teams.home.logo, form: '?' }, // Form fetched in deep analysis
            awayTeam: { name: item.teams.away.name, logo: item.teams.away.logo, form: '?' },
            league: item.league.name,
            kickoff: item.fixture.date,
            venue: item.fixture.venue.name || 'Unknown',
            xG_home: stats.xG_home,
            xG_away: stats.xG_away,
            shotsOnTarget_home: stats.shotsOnTarget_home,
            shotsOnTarget_away: stats.shotsOnTarget_away,
            oddsTrend: oddsTrend,
            prediction: {
                id: `p-${matchId}`,
                matchId: String(matchId),
                type: PredictionType.MATCH_WINNER,
                value: predValue,
                confidence: confidence,
                odds: displayOdd,
                isLocked: true,
            }
        });
    });

    return matches;

  } catch (error) {
    console.error("API Football Error:", error);
    return [];
  }
};

/**
 * Fetches deep data for a specific match to pass to Gemini
 */
export const fetchMatchIntelligence = async (fixtureId: string): Promise<MatchIntelligence | null> => {
    try {
        const [predResp, injResp] = await Promise.all([
            fetch(`${API_FOOTBALL_URL}/predictions?fixture=${fixtureId}`, { headers: HEADERS }),
            fetch(`${API_FOOTBALL_URL}/injuries?fixture=${fixtureId}`, { headers: HEADERS }),
        ]);

        const predJson = await predResp.json();
        const injJson = await injResp.json();

        const data = predJson.response?.[0];
        if (!data) return null;

        return {
            predictions: data,
            injuries: injJson.response || [],
            h2h: data.h2h || [],
            form: {
                home: data.teams.home.last_5.form,
                away: data.teams.away.last_5.form
            }
        };

    } catch (e) {
        console.error("Failed to fetch match intelligence", e);
        return null;
    }
}