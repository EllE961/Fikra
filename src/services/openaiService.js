import { apiClient } from './apiClient';
import { ENV } from '../constants/env';
import { logInfo } from './logger';

/**
 * Service to handle OpenAI API interactions for business idea generation
 */
export const openaiService = {
  /**
   * Generate business ideas based on user profile and preferences
   * @param {Object} userProfile - User profile with interests, skills, and location
   * @returns {Promise<Array>} - Array of generated business ideas
   */
  generateBusinessIdeas: async (userProfile) => {
    try {
      logInfo('Calling OpenAI API to generate business ideas');
      console.log('Using API key:', ENV.OPENAI_API_KEY ? 'API key is set' : 'API key is missing');
      const endpoint = `${ENV.OPENAI_API_URL}/chat/completions`;
      
      // Build a comprehensive prompt using all available user profile data
      let prompt = `Generate 5 innovative business ideas for an entrepreneur with the following profile:\n\n`;
      
      // Personal background
      prompt += `PERSONAL BACKGROUND:\n`;
      prompt += userProfile.occupation ? `- Current occupation: ${userProfile.occupation}\n` : '';
      prompt += userProfile.skills && userProfile.skills.length > 0 ? `- Skills: ${userProfile.skills.join(', ')}\n` : '';
      prompt += userProfile.interests && userProfile.interests.length > 0 ? `- Interests: ${userProfile.interests.join(', ')}\n` : '';
      
      // Goals
      if (userProfile.businessReason || userProfile.successVision || userProfile.timeframe) {
        prompt += `\nGOALS:\n`;
        prompt += userProfile.businessReason ? `- Main reason for starting: ${userProfile.businessReason}\n` : '';
        prompt += userProfile.successVision ? `- Vision of success: ${userProfile.successVision}\n` : '';
        prompt += userProfile.timeframe ? `- Timeframe: ${userProfile.timeframe}\n` : '';
      }
      
      // Financial considerations
      if (userProfile.budget || userProfile.runway) {
        prompt += `\nFINANCIAL CONSIDERATIONS:\n`;
        prompt += userProfile.budget ? `- Available budget: ${userProfile.budget}\n` : '';
        prompt += userProfile.willingToSeekFunding !== undefined ? `- Willing to seek funding: ${userProfile.willingToSeekFunding ? 'Yes' : 'No'}\n` : '';
        prompt += userProfile.runway ? `- Financial runway: ${userProfile.runway}\n` : '';
      }
      
      // Practical constraints
      if (userProfile.hoursPerWeek || userProfile.location) {
        prompt += `\nPRACTICAL CONSTRAINTS:\n`;
        prompt += userProfile.hoursPerWeek ? `- Hours available per week: ${userProfile.hoursPerWeek}\n` : '';
        prompt += userProfile.keepCurrentJob !== undefined ? `- Plans to keep current job: ${userProfile.keepCurrentJob ? 'Yes' : 'No'}\n` : '';
        prompt += userProfile.location ? `- Location: ${userProfile.location}\n` : '';
        prompt += userProfile.canTravel !== undefined ? `- Willing to travel: ${userProfile.canTravel ? 'Yes' : 'No'}\n` : '';
      }
      
      // Market preferences
      if (userProfile.preferredIndustry || userProfile.targetAudience) {
        prompt += `\nMARKET PREFERENCES:\n`;
        prompt += userProfile.preferredIndustry ? `- Preferred industries: ${userProfile.preferredIndustry}\n` : '';
        prompt += userProfile.industriesToAvoid ? `- Industries to avoid: ${userProfile.industriesToAvoid}\n` : '';
        prompt += userProfile.targetAudience ? `- Target audience: ${userProfile.targetAudience}\n` : '';
        prompt += userProfile.specificNiche ? `- Specific niche: ${userProfile.specificNiche}\n` : '';
      }
      
      // Approach
      if (userProfile.riskLevel || userProfile.teamApproach) {
        prompt += `\nAPPROACH:\n`;
        prompt += userProfile.riskLevel ? `- Risk level comfort: ${userProfile.riskLevel}\n` : '';
        prompt += userProfile.adaptability !== undefined ? `- Adaptability: ${userProfile.adaptability ? 'High' : 'Low'}\n` : '';
        prompt += userProfile.teamApproach ? `- Team approach: ${userProfile.teamApproach}\n` : '';
      }
      
      // Format instructions
      prompt += `\nFor each idea, please provide the following in JSON format:
1. title: A catchy, concise title (5 words max)
2. description: A brief description (20-30 words)
3. keyPoints: Three key strengths or competitive advantages (as array)
4. challengeLevel: Rating of implementation difficulty (easy, moderate, challenging)
5. startupCosts: Estimated startup costs
6. color: A hex color code that represents this business
7. timeToMarket: Estimated time to launch
8. profitPotential: Rating of profit potential (low, moderate, high)

Format the response as a JSON array of objects.`;
      
      console.log('Sending request to OpenAI with prompt:', prompt);
      
      const body = {
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are a business advisor specializing in entrepreneurship. Generate innovative, practical business ideas tailored to the user's profile. Provide specific, actionable ideas that match their background, goals, constraints, and preferences. Focus on feasibility and alignment with their unique situation." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.7,
      };
      
      try {
        const response = await apiClient(endpoint, {
          method: 'POST',
          body,
          token: ENV.OPENAI_API_KEY
        });
        
        console.log('OpenAI response received:', JSON.stringify(response));
        return parseIdeasFromResponse(response);
      } catch (apiError) {
        console.error('API Client Error:', apiError);
        throw new Error(`API call failed: ${apiError.message}`);
      }
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      logInfo(`Error generating business ideas: ${error.message}`);
      throw new Error('Failed to generate business ideas: ' + error.message);
    }
  },
  
  /**
   * Refine an existing business idea with AI suggestions
   * @param {Object} idea - The existing business idea to refine
   * @param {Object} userProfile - User profile with location data
   * @returns {Promise<Object>} - The refined business idea with suggestions
   */
  refineBusinessIdea: async (idea, userProfile) => {
    try {
      logInfo('Calling OpenAI API to refine business idea');
      const endpoint = `${ENV.OPENAI_API_URL}/chat/completions`;
      
      let prompt = `Refine this business idea: "${idea.title}: ${idea.description}".\n\n`;
      
      // Add relevant user profile information
      prompt += `ENTREPRENEUR PROFILE:\n`;
      prompt += userProfile.occupation ? `- Current occupation: ${userProfile.occupation}\n` : '';
      prompt += userProfile.skills && userProfile.skills.length > 0 ? `- Skills: ${userProfile.skills.join(', ')}\n` : '';
      prompt += userProfile.location ? `- Location: ${userProfile.location}\n` : '';
      prompt += userProfile.budget ? `- Available budget: ${userProfile.budget}\n` : '';
      prompt += userProfile.hoursPerWeek ? `- Hours available per week: ${userProfile.hoursPerWeek}\n` : '';
      
      prompt += `\nPlease provide refinement in JSON format with the following sections:
1. improvements: List of three specific improvements to make the idea more viable
2. challenges: List of two potential challenges to address
3. uniqueSellingProposition: One strong unique selling proposition to focus on
4. marketingStrategies: Two effective marketing strategies for this business
5. revenueStreams: Two potential revenue streams
6. timeToProfit: Estimated time to profitability`;
      
      const body = {
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are a business consultant who helps refine business ideas. Provide practical, specific refinements that make the business idea more viable and successful based on the entrepreneur's profile." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.6,
      };
      
      const response = await apiClient(endpoint, {
        method: 'POST',
        body,
        token: ENV.OPENAI_API_KEY
      });
      
      return parseRefinementFromResponse(response, idea);
    } catch (error) {
      logInfo(`Error refining business idea: ${error.message}`);
      throw new Error('Failed to refine business idea');
    }
  },
  
  /**
   * Generate search keywords for competitor analysis based on a business idea
   * @param {Object} options - Options for keyword generation
   * @param {Object} options.businessIdea - The business idea to analyze
   * @param {string} options.purpose - The purpose of the keyword generation (e.g., "Find social media competitors")
   * @returns {Promise<Array<string>>} - Array of generated keywords
   */
  generateKeywords: async (options) => {
    try {
      logInfo('Calling OpenAI API to generate keywords for competitor search');
      const endpoint = `${ENV.OPENAI_API_URL}/chat/completions`;
      
      const { businessIdea, purpose } = options;
      
      let prompt = `Generate a list of 5-10 specific keywords that would be most effective for ${purpose || 'finding competitors'} for the following business idea:\n\n`;
      
      // Add business idea details
      prompt += `BUSINESS IDEA:\n`;
      prompt += businessIdea.title ? `- Title: ${businessIdea.title}\n` : '';
      prompt += businessIdea.description ? `- Description: ${businessIdea.description}\n` : '';
      prompt += businessIdea.category ? `- Category: ${businessIdea.category}\n` : '';
      prompt += businessIdea.location ? `- Location: ${businessIdea.location}\n` : '';
      
      // Additional context about industry
      if (businessIdea.keyPoints && businessIdea.keyPoints.length > 0) {
        prompt += `- Key features: ${businessIdea.keyPoints.join(', ')}\n`;
      }
      
      // Format instructions
      prompt += `\nPlease provide the keywords as a JSON array of strings. Include both generic and specific terms, industry-specific terminology, and location-based terms. Focus on keywords that would be most likely to find direct competitors in the market.`;
      
      const body = {
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert in market research and competitor analysis. Generate relevant, specific search keywords to help users find competitors and analyze their market." 
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.3, // Lower temperature for more focused results
      };
      
      const response = await apiClient(endpoint, {
        method: 'POST',
        body,
        token: ENV.OPENAI_API_KEY
      });
      
      return parseKeywordsFromResponse(response);
    } catch (error) {
      console.error('Error generating keywords:', error);
      logInfo(`Error generating keywords for competitor search: ${error.message}`);
      
      // Fallback to basic keywords derived from the business idea
      return [
        options.businessIdea.category || '',
        options.businessIdea.title?.split(' ')[0] || '',
        options.businessIdea.location || ''
      ].filter(k => k.trim().length > 0);
    }
  }
};

/**
 * Generate a random color hex code for business ideas
 * @returns {string} - Random color hex code
 */
const getRandomColor = () => {
  const colors = [
    '#ff6f91',  // Pinkish Red
    '#845ec2',  // Purple
    '#00c9a7',  // Teal
    '#ffc75f',  // Amber
    '#f9f871',  // Yellow
    '#0089ba',  // Blue
    '#c34a36',  // Brick Red
    '#008f7a',  // Dark Green
    '#fe4a49',  // Salmon
    '#4a4e4d',  // Dark Gray
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Parse business ideas from OpenAI API response
 * @param {Object} response - OpenAI API response
 * @returns {Array} - Structured business ideas
 */
const parseIdeasFromResponse = (response) => {
  try {
    console.log('Parsing response:', JSON.stringify(response));
    
    // Check if response exists and has the expected structure
    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      console.error('Invalid response structure', response);
      return [];
    }
    
    // Extract the content from the response
    const content = response.choices[0].message.content;
    console.log('Content to parse:', content);
    
    // Clean the content of any leading/trailing new lines or quotes
    const cleanedContent = content.trim().replace(/^[\n\s"']+|[\n\s"']+$/g, '');
    
    try {
      const parsedResponse = JSON.parse(cleanedContent);
      console.log('Parsed response:', parsedResponse);
      
      // Handle the businessIdeas array structure that the API returns
      let ideas = [];
      
      if (parsedResponse && parsedResponse.businessIdeas && Array.isArray(parsedResponse.businessIdeas)) {
        // Extract from the businessIdeas array that the API returns
        ideas = parsedResponse.businessIdeas;
      } else if (parsedResponse && parsedResponse.ideas && Array.isArray(parsedResponse.ideas)) {
        // Alternative structure
        ideas = parsedResponse.ideas;
      } else if (Array.isArray(parsedResponse)) {
        // If the response itself is an array
        ideas = parsedResponse;
      } else if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.title) {
        // Handle case where a single idea object is returned directly
        console.log('Single idea object detected, converting to array');
        ideas = [parsedResponse];
      } else {
        // If the response is an object with numbered properties
        const potentialIdeas = Object.values(parsedResponse);
        if (potentialIdeas.length > 0 && typeof potentialIdeas[0] === 'object') {
          ideas = potentialIdeas;
        }
      }
      
      // Map ideas to our expected format
      if (ideas.length > 0) {
        return ideas.map((idea, index) => ({
          id: `generated-${Date.now()}-${index}`,
          title: idea.title || `Business Idea ${index + 1}`,
          description: idea.description || 'No description provided',
          color: idea.color || getRandomColor(),
          keyPoints: idea.keyPoints || [],
          challengeLevel: idea.challengeLevel || 'moderate',
          startupCosts: idea.startupCosts || 'Unknown',
          timeToMarket: idea.timeToMarket || 'Unknown',
          profitPotential: idea.profitPotential || 'moderate',
          isGenerated: true,
          generatedAt: new Date().toISOString()
        }));
      }
    } catch (parseError) {
      console.error(`JSON parsing failed: ${parseError.message}`);
      // Continue to fallback parser
    }
    
    // Fallback in case the response doesn't match expected format
    console.log('Response format was not as expected, attempting to parse manually');
    return parseUnstructuredResponse(content);
    
  } catch (error) {
    console.error(`Error parsing ideas from OpenAI response: ${error.message}`, error);
    return [];
  }
};

/**
 * Fallback parser for unstructured responses
 * @param {string} content - The response content as text
 * @returns {Array} - Structured business ideas
 */
const parseUnstructuredResponse = (content) => {
  try {
    // Just in case we receive unstructured text, attempt to parse
    const ideas = [];
    const sections = content.split(/\d\.\s+/).filter(Boolean);
    
    sections.forEach((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim());
      
      let title = `Business Idea ${index + 1}`;
      let description = 'No description provided';
      
      // Try to extract title and description
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        if (firstLine.includes(':')) {
          const parts = firstLine.split(':');
          title = parts[0].trim();
          description = parts[1].trim();
        } else {
          title = firstLine;
          description = lines.length > 1 ? lines[1].trim() : 'No description provided';
        }
      }
      
      ideas.push({
        id: `generated-${Date.now()}-${index}`,
        title,
        description,
        color: getRandomColor(),
        isGenerated: true,
        generatedAt: new Date().toISOString()
      });
    });
    
    return ideas;
  } catch (error) {
    logInfo(`Error in fallback parser: ${error.message}`);
    return [];
  }
};

/**
 * Parse the refinement suggestions from OpenAI response
 * @param {Object} response - OpenAI API response
 * @param {Object} originalIdea - The original business idea
 * @returns {Object} - The original idea with refinement suggestions
 */
const parseRefinementFromResponse = (response, originalIdea) => {
  try {
    const content = response.choices[0].message.content;
    const parsedResponse = JSON.parse(content);
    
    // Check if response has expected structure
    if (parsedResponse) {
      return {
        ...originalIdea,
        refinements: {
          improvements: parsedResponse.improvements || [],
          challenges: parsedResponse.challenges || [],
          uniqueSellingProposition: parsedResponse.uniqueSellingProposition || '',
          marketingStrategies: parsedResponse.marketingStrategies || [],
          revenueStreams: parsedResponse.revenueStreams || [],
          timeToProfit: parsedResponse.timeToProfit || ''
        },
        refinedAt: new Date().toISOString()
      };
    }
    
    return originalIdea;
  } catch (error) {
    logInfo(`Error parsing refinement from OpenAI response: ${error.message}`);
    return originalIdea;
  }
};

/**
 * Parse keywords from OpenAI API response
 * @param {Object} response - OpenAI API response
 * @returns {Array<string>} - Array of keywords
 */
const parseKeywordsFromResponse = (response) => {
  try {
    // Check if response exists and has the expected structure
    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      console.error('Invalid response structure for keywords', response);
      return [];
    }
    
    // Extract the content from the response
    const content = response.choices[0].message.content;
    
    // Clean the content of any leading/trailing new lines or quotes
    const cleanedContent = content.trim().replace(/^[\n\s"']+|[\n\s"']+$/g, '');
    
    try {
      const parsedResponse = JSON.parse(cleanedContent);
      
      // Handle different response formats
      if (parsedResponse && parsedResponse.keywords && Array.isArray(parsedResponse.keywords)) {
        return parsedResponse.keywords;
      } else if (Array.isArray(parsedResponse)) {
        return parsedResponse;
      } else if (typeof parsedResponse === 'object') {
        // If the response is an object with numbered properties
        return Object.values(parsedResponse).flat().filter(k => typeof k === 'string');
      }
      
      return [];
    } catch (parseError) {
      console.error('Error parsing keywords response:', parseError);
      
      // If JSON parsing fails, try to extract keywords from the content
      const lines = cleanedContent.split('\n').map(line => line.trim());
      const keywords = lines
        .filter(line => line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line))
        .map(line => line.replace(/^[-*\d.]+\s*/, ''))
        .filter(keyword => keyword.length > 0);
      
      return keywords.length > 0 ? keywords : [];
    }
  } catch (error) {
    console.error('Error parsing keywords:', error);
    return [];
  }
};

// Export the generateKeywords function separately for direct imports
export const generateKeywords = openaiService.generateKeywords; 