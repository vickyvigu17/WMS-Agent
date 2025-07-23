const axios = require('axios');

class AIResearchService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.serpApiKey = process.env.SERP_API_KEY;
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
      console.error('AI Research error:', error);
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
      console.error('Supply chain AI research error:', error);
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
      console.error('Competitor AI research error:', error);
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
      `${companyName} fulfillment centers distribution network`,
      `${companyName} inventory management automation robotics`,
      `${companyName} supply chain challenges issues problems`
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
      `${industry} supply chain leaders technology`,
      `${companyName} vs competitors warehouse automation`,
      `${industry} WMS implementations case studies`
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
            num: 5
          }
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
        console.error('Web search error:', error);
        return { results: [], sources: [] };
      }
    } else {
      console.log('⚠️ No SERP API key - using mock search');
      return {
        results: [{
          title: `${query} - Mock Result`,
          snippet: `This would be real search results for: ${query}`,
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
      company_overview: `Analyze the following REAL web search results about ${companyName} and provide a comprehensive company overview:

SEARCH RESULTS:
${JSON.stringify(searchData.results, null, 2)}

Based on the ACTUAL search results above, provide detailed analysis in this format:

**Financial Overview:**
[Actual revenue, financial performance data found]

**Business Operations:**
[Real business model, operations scale, key activities found]

**Market Position:**
[Actual market share, competitive position discovered]

**Key Facilities:**
[Real warehouse, distribution center, facility information found]

**Recent Developments:**
[Actual recent news, developments, investments discovered]

**Supply Chain Insights:**
[Any supply chain specific information discovered]

Only include information that was actually found in the search results. If no information is found for a section, state "No specific information found in current search results."`,

      supply_chain: `Analyze ${companyName}'s supply chain infrastructure based on these REAL search results:

SEARCH RESULTS:
${JSON.stringify(searchData.results, null, 2)}

Provide detailed analysis based ONLY on what was actually found:

**Warehouse Infrastructure:**
[Actual warehouse/DC information found]

**Transportation & Logistics:**
[Real transportation/logistics details discovered]

**Technology Stack:**
[Actual WMS/ERP/TMS systems mentioned]

**Automation & Innovation:**
[Real automation/robotics implementations found]

**Operational Challenges:**
[Actual challenges or issues mentioned]

**Scale & Capacity:**
[Real volume, capacity, scale information]

Only report information actually found in the search results.`,

      competitor_analysis: `Analyze ${companyName}'s competitive landscape based on these REAL search results:

SEARCH RESULTS:
${JSON.stringify(searchData.results, null, 2)}

Provide analysis based ONLY on actual findings:

**Main Competitors:**
[Actual competitors mentioned in search results]

**Competitive Advantages:**
[Real advantages/differentiators found]

**Market Position:**
[Actual market share/position data discovered]

**Technology Comparison:**
[Real technology comparisons found]

**Industry Trends:**
[Actual industry trends affecting this company]

**Strategic Insights:**
[Recommendations based on real competitive intelligence]

Base analysis only on information actually found in search results.`
    };

    try {
      console.log(`🤖 AI analyzing ${researchType} for ${companyName}...`);
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a supply chain research analyst. Analyze ONLY the real search results provided. Do not make up information. If data is not found in the search results, clearly state that.'
          },
          {
            role: 'user',
            content: prompts[researchType]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1 // Very low temperature for factual analysis
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ AI analysis complete for ${companyName}`);
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.getFallbackAnalysis(companyName, researchType);
    }
  }

  getFallbackAnalysis(companyName, researchType) {
    return `AI-powered analysis for ${companyName} - ${researchType}

⚠️ This is fallback content. To get real AI-powered research:
1. Add your OpenAI API key to environment variables
2. Add your SerpAPI key for web search
3. The system will then search the web and use AI to analyze real company data

Current mode: Using sample analysis data.`;
  }

  getFallbackResearch(companyName, researchType) {
    return {
      company_name: companyName,
      research_type: researchType,
      results: this.getFallbackAnalysis(companyName, researchType),
      sources: ['Fallback mode - add API keys for real research'],
      ai_powered: false,
      timestamp: new Date()
    };
  }
}

module.exports = new AIResearchService();
