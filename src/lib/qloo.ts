import { supabase } from "./supabaseClient";

// Define the types for our user and Qloo data
interface QlooRecommendation {
  id: string;
  name: string;
  image_url?: string;
  score?: number;
}

interface QlooApiResponse {
  results: QlooRecommendation[];
}

// Qloo API configuration
const QLOO_API_URL = 'https://hackathon.api.qloo.com/';
const QLOO_API_KEY = import.meta.env.VITE_QLOO_API_KEY;

// Qloo API service
class QlooService {
  private static async makeRequest(endpoint: string, body: Record<string, any>) {
    const url = new URL(endpoint, QLOO_API_URL);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'x-api-key': QLOO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Qloo API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  static async getRecommendations(domain: string, allEntities: string[]): Promise<QlooRecommendation[]> {
    const requestBody = {
      signal: {
        interests: {
          filter: { type: 'keyword' },
          entities: allEntities.map(name => ({ name })),
        },
      },
      domain: [domain],
      limit: 8,
    };
    const response = await this.makeRequest('v2/recommendations', requestBody);
    // The response may have a structure like { results: [...] } or { [domain]: [...] }
    if (response.results) {
      return response.results;
    } else if (response[domain]) {
      return response[domain];
    }
    return [];
  }

  static async getMultiDomainRecommendations(userInterests: string[], userValues: string[], userLifestyle: string[]) {
    const domains = ['music', 'film', 'books', 'podcasts', 'fashion', 'dining'];
    const allEntities = [...userInterests, ...userValues, ...userLifestyle];
    
    // Make a single API call for all domains, as supported by Qloo
    const requestBody = {
      signal: {
        interests: {
          filter: { type: 'keyword' },
          entities: allEntities.map(name => ({ name })),
        },
      },
      domain: domains,
      limit: 8,
    };
    const response = await this.makeRequest('v2/recommendations', requestBody);
    // The response is expected to be an object with keys for each domain
    return domains.map(domain => ({
          domain,
      results: response[domain] || [],
    })).filter(domainData => domainData.results.length > 0);
  }
}

export default QlooService;
