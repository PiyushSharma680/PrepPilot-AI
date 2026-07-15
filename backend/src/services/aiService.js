import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

let geminiClient = null;
let openaiClient = null;

const initClients = () => {
  if (process.env.GEMINI_API_KEY) {
    console.log('✓ Gemini API key detected');
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      console.log('✓ Gemini client initialized');
    } catch (e) {
      console.error('AI Service: Failed to initialize Gemini Client', e.message);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log('✓ OpenAI Client initialized');
    } catch (e) {
      console.error('AI Service: Failed to initialize OpenAI Client', e.message);
    }
  }

  if (!geminiClient && !openaiClient) {
    console.error('\x1b[31m[ERROR] No AI API Key found (GEMINI_API_KEY or OPENAI_API_KEY). AI features will be unavailable.\x1b[0m');
  }
};

initClients();

// Helper to call LLM
const callLLM = async (prompt, systemInstruction = '') => {
  if (!openaiClient && !geminiClient) {
    const error = new Error('AI service is currently unavailable. Please configure API keys.');
    error.status = 503;
    throw error;
  }

  if (openaiClient) {
    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI Request Failed:', error.message);
      if (!geminiClient) {
        const err = new Error('AI service failed to generate a response.');
        err.status = 503;
        throw err;
      }
    }
  }

  if (geminiClient) {
    try {
      const response = await geminiClient.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json"
        }
      });
      const text = response.text;
      // Clean potential JSON markdown blocks
      const cleanJsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJsonStr);
    } catch (error) {
      console.error('Gemini Request Failed:', error.message);
      const err = new Error('AI service failed to generate a response.');
      err.status = 503;
      throw err;
    }
  }
};

export const aiService = {
  analyzeResume: async (parsedText = '', filename = 'resume.pdf') => {
    const systemInstruction = `You are an expert resume analyzer and ATS optimization system. Analyze the provided resume text and return a JSON object with:
    - atsScore: number (0-100)
    - missingSkills: array of strings
    - grammarSuggestions: array of strings
    - keywordOptimization: array of strings
    - improvements: array of strings`;

    const prompt = `Filename: ${filename}\nResume Content:\n${parsedText.substring(0, 4000)}`;
    return await callLLM(prompt, systemInstruction);
  },

  generateInterviewQuestion: async (type, category = 'General', history = []) => {
    const systemInstruction = `You are a Lead Software Engineer interviewing a candidate for a ${type} role (Category: ${category}).
    Based on the history of previous Q&A, generate the next interview question. Return JSON format:
    {
      "question": "question text",
      "expectedAnswerKeywords": ["keyword1", "keyword2"]
    }`;

    const prompt = `Interview History:\n${JSON.stringify(history.slice(-3))}`;
    return await callLLM(prompt, systemInstruction);
  },

  gradeInterviewAnswer: async (question, answer) => {
    const systemInstruction = `You are an interviewer. Evaluate the candidate's answer to the given question.
    Rate the answer and provide structured feedback. Return JSON format:
    {
      "score": number (0-100),
      "feedback": "detailed review detailing strengths and what key terms or aspects were missed."
    }`;

    const prompt = `Question: ${question}\nCandidate Answer: ${answer}`;
    return await callLLM(prompt, systemInstruction);
  },

  generateRoadmap: async (targetCompany, currentSkills = []) => {
    const systemInstruction = `You are a career mentor. Create a custom weekly study plan for a student targeting ${targetCompany}.
    Structure the response in JSON:
    {
      "title": "Roadmap Title",
      "targetCompany": "Company Name",
      "durationWeeks": 4,
      "weeks": [
        {
          "weekNumber": 1,
          "weeklyGoal": "Goal details",
          "dailyTasks": ["Task 1", "Task 2", "Task 3"]
        }
      ]
    }`;

    const prompt = `Target Company: ${targetCompany}\nCurrent Skills: ${currentSkills.join(', ')}`;
    return await callLLM(prompt, systemInstruction);
  },

  chatMentor: async (message, history = []) => {
    const systemInstruction = `You are PrepPilot's AI Career Mentor, an expert placement counselor. Answer the candidate's career queries. Return JSON format:
    {
      "reply": "your text response"
    }`;

    const prompt = `Query: ${message}\nChat History: ${JSON.stringify(history.slice(-4))}`;
    return await callLLM(prompt, systemInstruction);
  }
};
export default aiService;
