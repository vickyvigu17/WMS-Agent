const axios = require('axios');

class AIResearchService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.serpApiKey = process.env.SERP_API_KEY;
    this.openaiBaseURL = 'https://api.openai.com/v1';
  }

  async conductCompanyResearch(companyName) {
    console.log(`🔍 Starting AI research for: ${companyName}`);
    
    try {
      // Step 1: Search the web for real company data
      const searchResults = await this.searchCompanyInfo(companyName);
      
      // Step 2: Use AI to analyze the real data
      const analysis = await this.analyzeWithAI(companyName, searchResults, 'company_overview');
      
      return {
        company_name: companyName,
        research_type: 'Company Overview',
        results: analysis,
        sources: searchResults.sources,
        ai_powered: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI Research error:', error.message);
      return this.getFallbackResearch(companyName, 'company_overview');
    }
  }

  async conductSupplyChainResearch(companyName) {
    console.log(`🔍 Starting supply chain AI research for: ${companyName}`);
    
    try {
      const searchResults = await this.searchSupplyChainInfo(companyName);
      const analysis = await this.analyzeWithAI(companyName, searchResults, 'supply_chain');
      
      return {
        company_name: companyName,
        research_type: 'Supply Chain Analysis',
        results: analysis,
        sources: searchResults.sources,
        ai_powered: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Supply chain AI research error:', error.message);
      return this.getFallbackResearch(companyName, 'supply_chain');
    }
  }

  async conductCompetitorResearch(companyName, industry) {
    console.log(`🔍 Starting competitor AI research for: ${companyName} in ${industry}`);
    
    try {
      const searchResults = await this.searchCompetitorInfo(companyName, industry);
      const analysis = await this.analyzeWithAI(companyName, searchResults, 'competitor_analysis');
      
      return {
        company_name: companyName,
        research_type: 'Competitor Analysis',
        results: analysis,
        sources: searchResults.sources,
        ai_powered: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Competitor AI research error:', error.message);
      return this.getFallbackResearch(companyName, 'competitor_analysis');
    }
  }

  async searchCompanyInfo(companyName) {
    const queries = [
      `${companyName} annual revenue financial performance`,
      `${companyName} warehouse distribution centers locations`,
      `${companyName} supply chain operations logistics`,
      `${companyName} technology systems ERP WMS`
    ];

    let allResults = [];
    let allSources = [];

    for (const query of queries) {
      const results = await this.performWebSearch(query);
      allResults = allResults.concat(results.results);
      allSources = allSources.concat(results.sources);
    }

    return {
      results: allResults,
      sources: [...new Set(allSources)] // Remove duplicates
    };
  }

  async searchSupplyChainInfo(companyName) {
    const queries = [
      `${companyName} warehouse management system WMS technology`,
      `${companyName} transportation logistics TMS`,
      `${companyName} fulfillment centers distribution network`
    ];

    let allResults = [];
    let allSources = [];

    for (const query of queries) {
      const results = await this.performWebSearch(query);
      allResults = allResults.concat(results.results);
      allSources = allSources.concat(results.sources);
    }

    return {
      results: allResults,
      sources: [...new Set(allSources)]
    };
  }

  async searchCompetitorInfo(companyName, industry) {
    const queries = [
      `${companyName} competitors ${industry} market share`,
      `${industry} supply chain leaders technology`
    ];

    let allResults = [];
    let allSources = [];

    for (const query of queries) {
      const results = await this.performWebSearch(query);
      allResults = allResults.concat(results.results);
      allSources = allSources.concat(results.sources);
    }

    return {
      results: allResults,
      sources: [...new Set(allSources)]
    };
  }

  async performWebSearch(query) {
    if (this.serpApiKey) {
      try {
        console.log(`🌐 Searching: ${query}`);
        const response = await axios.get('https://serpapi.com/search', {
          params: {
            q: query,
            api_key: this.serpApiKey,
            engine: 'google',
            num: 3
          },
          timeout: 10000
        });
        
        const results = response.data.organic_results?.map(result => ({
          title: result.title,
          snippet: result.snippet,
          link: result.link
        })) || [];

        return {
          results: results,
          sources: results.map(r => r.link)
        };
      } catch (error) {
        console.error('Web search error:', error.message);
        return { results: [], sources: [] };
      }
    } else {
      console.log('⚠️ No SERP API key - using mock search');
      return {
        results: [{
          title: `${query} - Company Information`,
          snippet: `Information about ${query} would be found here with real web search.`,
          link: `https://example.com/search`
        }],
        sources: ['https://example.com/search']
      };
    }
  }

  async analyzeWithAI(companyName, searchData, researchType) {
    if (!this.openaiApiKey) {
      console.log('⚠️ No OpenAI API key - using fallback analysis');
      return this.getFallbackAnalysis(companyName, researchType);
    }

    const prompts = {
      company_overview: `Analyze the following information about ${companyName} and provide a comprehensive company overview:

SEARCH RESULTS:
${JSON.stringify(searchData.results, null, 2)}

Based on the available information, provide analysis in this format:

**Financial Overview:**
[Any revenue, financial performance data found]

**Business Operations:**
[Business model, operations scale, key activities]

**Market Position:**
[Market share, competitive position information]

**Key Facilities:**
[Warehouse, distribution center, facility information]

**Recent Developments:**
[Recent news, developments, investments]

If specific information is not available in the search results, provide general industry knowledge about ${companyName}.`,

      supply_chain: `Analyze ${companyName}'s supply chain infrastructure:

SEARCH RESULTS:
${JSON.stringify(searchData.results, null, 2)}

Provide detailed analysis:

**Warehouse Infrastructure:**
[Warehouse/DC information]

**Transportation & Logistics:**
[Transportation/logistics details]

**Technology Stack:**
[WMS/ERP/TMS systems]

**Operational Scale:**
[Volume, capacity, scale information]

Use both the search results and your knowledge of ${companyName} to provide comprehensive analysis.`,

      competitor_analysis: `Analyze ${companyName}'s competitive landscape:

SEARCH RESULTS:
${JSON.stringify(searchData.results, null, 2)}

Provide analysis:

**Main Competitors:**
[Key competitors in the market]

**Competitive Advantages:**
[Advantages/differentiators]

**Market Position:**
[Market share/position]

**Strategic Insights:**
[Recommendations based on competitive analysis]

Combine search results with your knowledge of the industry.`
    };

    try {
      console.log(`🤖 AI analyzing ${researchType} for ${companyName}...`);
      
      const response = await axios({
        method: 'post',
        url: `${this.openaiBaseURL}/chat/completions`,
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a supply chain research analyst. Provide detailed, professional analysis based on the information provided.'
            },
            {
              role: 'user',
              content: prompts[researchType]
            }
          ],
          max_tokens: 1500,
          temperature: 0.3
        },
        timeout: 30000
      });

      console.log(`✅ AI analysis complete for ${companyName}`);
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI analysis error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        console.error('OpenAI API endpoint not found - check API key and endpoint URL');
      } else if (error.response?.status === 401) {
        console.error('OpenAI API authentication failed - check API key');
      } else if (error.response?.status === 429) {
        console.error('OpenAI API rate limit exceeded');
      }
      
      return this.getFallbackAnalysis(companyName, researchType);
    }
  }

  getFallbackAnalysis(companyName, researchType) {
    const analyses = {
      company_overview: `**Company Overview for ${companyName}**

**Financial Overview:**
${companyName} is a significant player in their industry with substantial annual revenue and market presence.

**Business Operations:**
The company operates across multiple markets with a focus on efficient supply chain and logistics operations.

**Market Position:**
${companyName} maintains a strong competitive position in their sector.

**Key Facilities:**
The company operates distribution centers and facilities strategically positioned to serve their market.

**Recent Developments:**
Ongoing investments in technology and operational efficiency improvements.

*Note: This is fallback analysis. Real AI analysis with web search would provide specific, current data about ${companyName}.*`,

      supply_chain: `**Supply Chain Analysis for ${companyName}**

**Warehouse Infrastructure:**
Modern distribution network with strategically located facilities.

**Transportation & Logistics:**
Multi-modal transportation capabilities with focus on efficiency.

**Technology Stack:**
Investment in modern WMS and supply chain technology systems.

**Operational Scale:**
Large-scale operations requiring sophisticated management systems.

*Note: This is fallback analysis. Real AI analysis would provide specific details about ${companyName}'s actual supply chain operations.*`,

      competitor_analysis: `**Competitive Analysis for ${companyName}**

**Main Competitors:**
Competes with other major players in their industry segment.

**Competitive Advantages:**
Strong market position and operational capabilities.

**Market Position:**
Well-established player with significant market share.

**Strategic Insights:**
Focus on continued technology adoption and operational excellence.

*Note: This is fallback analysis. Real AI analysis would provide specific competitive intelligence.*`
    };

    return analyses[researchType] || `Analysis for ${companyName} - ${researchType}`;
  }

  getFallbackResearch(companyName, researchType) {
    return {
      company_name: companyName,
      research_type: researchType,
      results: this.getFallbackAnalysis(companyName, researchType),
      sources: ['Fallback analysis - check API configuration'],
      ai_powered: false,
      timestamp: new Date()
    };
  }
}

module.exports = new AIResearchService();
