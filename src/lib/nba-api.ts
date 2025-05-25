// src/lib/nba-api.ts
export interface NBAGamePrediction {
  away_team: string;
  home_team: string;
  away_odds: number;
  home_odds: number;
  predicted_winner: string;
  winner_confidence: number;
  under_over_line: number | string;
  under_over_prediction: string;
  under_over_confidence: number;
  expected_value: {
    home_team: number;
    away_team: number;
  };
  kelly_criterion?: {
    home_team: number;
    away_team: number;
  };
  model: string;
}

export interface NBAPredictionResponse {
  timestamp: string;
  sportsbook: string;
  total_games: number;
  odds_data: Record<string, any>;
  predictions: NBAGamePrediction[];
}

export class NBAApiService {
  private baseUrl = 'http://localhost:8000';

  async getPredictions(
    sportsbook: string = 'fanduel',
    model: string = 'xgboost',
    kellyCheck: boolean = true
  ): Promise<NBAPredictionResponse> {
    try {
      const url = `${this.baseUrl}/predictions?sportsbook=${sportsbook}&model=${model}&kelly_criterion=${kellyCheck}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('NBA API Error:', error);
      throw new Error('Failed to fetch NBA predictions. Make sure your NBA API is running on localhost:8000');
    }
  }

  async getSupportedSportsbooks(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sportsbooks`);
      const data = await response.json();
      return data.supported_sportsbooks;
    } catch (error) {
      console.error('Failed to fetch sportsbooks:', error);
      return ['fanduel', 'draftkings', 'betmgm'];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const nbaApi = new NBAApiService();
