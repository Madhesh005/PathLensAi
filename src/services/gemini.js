import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const geminiService = {
  // Career analysis specific function
  async analyzeCareerProfile(swotData) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });

      const prompt = `
        As a professional career counselor and AI analyst, please provide a comprehensive career analysis based on the following SWOT analysis:

        STRENGTHS:
        ${swotData.strengths}

        WEAKNESSES:
        ${swotData.weaknesses}

        OPPORTUNITIES:
        ${swotData.opportunities}

        THREATS:
        ${swotData.threats}

        Please provide a detailed analysis in the following structured format:

        ## CAREER PATH RECOMMENDATIONS
        [Provide 3-5 specific career paths that align with their strengths and opportunities]

        ## SKILLS DEVELOPMENT PLAN
        [List specific skills to develop based on weaknesses and market opportunities]

        ## ACTION PLAN
        [Provide a step-by-step action plan with timelines]

        ## LEVERAGING STRENGTHS
        [How to maximize and utilize existing strengths]

        ## THREAT MITIGATION
        [Strategies to address and minimize threats]

        ## INDUSTRY INSIGHTS
        [Relevant industry trends and market analysis]

        ## NEXT STEPS
        [Immediate actionable steps to take within the next 30-90 days]

        Please make the recommendations specific, actionable, and tailored to the individual's profile.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing career profile:', error);
      throw new Error('Failed to analyze career profile. Please try again.');
    }
  },

  // General text generation
  async generateText(prompt) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  },

  // Resume analysis (for future implementation)
  async analyzeResume(resumeText, additionalInfo = {}) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Analyze the following resume and create a SWOT analysis for career planning:

        RESUME CONTENT:
        ${resumeText}

        ADDITIONAL INFO:
        Name: ${additionalInfo.name || 'Not provided'}
        Email: ${additionalInfo.email || 'Not provided'}
        Years of Experience: ${additionalInfo.experience || 'Not provided'}

        Please provide:
        1. SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
        2. Career recommendations
        3. Skills gap analysis
        4. Next steps for career advancement

        Format the response in a structured manner suitable for career planning.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw error;
    }
  }
};