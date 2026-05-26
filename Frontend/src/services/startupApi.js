import { api } from './api';

export const startupApi = {
  // Submit raw startup details for feasibility scoring
  submitStartup: async (startupData) => {
    return api.post('/api/startup/analyze', startupData).then(res => {
      // Return simulated 9-metric analysis scores
      return {
        ...res,
        data: {
          marketDemand: { score: 84, status: 'High', details: 'Significant demand driven by rapid digital transformation.' },
          targetAudienceFit: { score: 79, status: 'High', details: 'Niche demographics show high initial willingness to pay.' },
          problemSolutionFit: { score: 88, status: 'High', details: 'Directly addresses friction points identified in user studies.' },
          competitorPresence: { score: 45, status: 'Medium', details: 'Moderately crowded space; unique value proposition needed.' },
          revenuePotential: { score: 74, status: 'High', details: 'Subscription-based structures support long-term LTV growth.' },
          riskLevel: { score: 38, status: 'Low', details: 'Low regulatory hurdles and low initial capital expenditure.' },
          innovationLevel: { score: 81, status: 'High', details: 'Proprietary automated workflow separates it from incumbents.' },
          scalability: { score: 92, status: 'High', details: 'Zero-marginal-cost distribution models permit rapid growth.' },
          feasibility: { score: 72, status: 'Medium', details: 'Requires specialized tech execution but within standard roadmap.' }
        }
      };
    });
  },

  // Retrieve previous validation results by ID
  getStartupAnalysis: async (id) => {
    return api.get(`/api/startup/analysis/${id}`).then(res => {
      const history = localStorage.getItem('startup_history');
      const list = history ? JSON.parse(history) : [];
      const match = list.find(item => item.id === id);
      return {
        ...res,
        data: match ? match.scores : null
      };
    });
  },

  // Save progress draft parameters
  saveStartupDraft: async (draftPayload) => {
    return api.post('/api/startup/draft', draftPayload).then(res => {
      localStorage.setItem('startup_draft', JSON.stringify(draftPayload));
      return res;
    });
  },

  // Load active onboarding draft parameters
  loadStartupDraft: async () => {
    return api.get('/api/startup/draft').then(res => {
      const savedDraft = localStorage.getItem('startup_draft');
      return {
        ...res,
        data: savedDraft ? JSON.parse(savedDraft) : null
      };
    });
  },

  // Compile general workspace metrics
  getDashboardData: async () => {
    return api.get('/api/dashboard/stats').then(res => {
      const savedHistory = localStorage.getItem('startup_history');
      const list = savedHistory ? JSON.parse(savedHistory) : [];
      return {
        ...res,
        data: {
          totalStartups: list.length,
          completedAnalysis: list.filter(h => h.scores).length,
          savedDraftCount: localStorage.getItem('startup_draft') ? 1 : 0
        }
      };
    });
  }
};
export default startupApi;
