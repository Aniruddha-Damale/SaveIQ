import { Goal, UserProfile, AICoachResponse } from '../types';

export interface AICoachRequest {
  action?: string;
  prompt?: string;
  goals: Goal[];
  profile: UserProfile;
}

export async function askAICoach(req: AICoachRequest): Promise<AICoachResponse> {
  const { action, prompt, goals, profile } = req;

  // If user configured a direct Google Apps Script Web App URL, we can invoke it directly or fallback to server
  if (profile.gasWebAppUrl && profile.gasWebAppUrl.startsWith('https://script.google.com/')) {
    try {
      const gasResponse = await fetch(profile.gasWebAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'generateAIInsight',
          payload: {
            action,
            prompt,
            goals,
            profile,
            groqApiKey: profile.groqApiKey
          }
        })
      });

      if (gasResponse.ok) {
        const gasData = await gasResponse.json();
        if (gasData.success && gasData.data) {
          return {
            ...gasData.data,
            provider: 'Google Apps Script (LLaMA 3.3-70B)'
          };
        }
      }
    } catch (e) {
      console.warn('Google Apps Script direct fetch failed, falling back to local Express proxy:', e);
    }
  }

  // Call the server-side Express AI Coach endpoint
  const response = await fetch('/api/ai/coach', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: action || 'Analyze My Progress',
      prompt: prompt || '',
      goals,
      profile,
      groqApiKey: profile.groqApiKey || ''
    })
  });

  if (!response.ok) {
    throw new Error(`AI Coach service responded with status ${response.status}`);
  }

  const result = await response.json();
  if (result.success && result.data) {
    return {
      ...result.data,
      provider: result.provider || 'SaveIQ Intelligence'
    };
  }

  throw new Error(result.message || 'Failed to generate financial insight');
}
