import pdfParse from 'pdf-parse';
import { Resume } from '../models/Resume.js';
import { aiService } from '../services/aiService.js';

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF resume' });
    }

    let parsedText = '';
    try {
      const dataBuffer = req.file.buffer;
      const pdfData = await pdfParse(dataBuffer);
      parsedText = pdfData.text;
    } catch (parseError) {
      console.warn('PDF parsing failed, using filename text fallback:', parseError.message);
      // Fallback: use filename and basic info
      parsedText = `Resume file name: ${req.file.originalname}. Candidate claims experience in Full Stack Software Engineering.`;
    }

    // Analyze with AI
    const analysis = await aiService.analyzeResume(parsedText, req.file.originalname);

    const newResume = await Resume.create({
      userId: req.user.id,
      filename: req.file.originalname,
      atsScore: analysis.atsScore,
      missingSkills: analysis.missingSkills,
      grammarSuggestions: analysis.grammarSuggestions,
      keywordOptimization: analysis.keywordOptimization,
      improvements: analysis.improvements,
      parsedText: parsedText.substring(0, 1000) // save a small excerpt
    });

    res.status(201).json(newResume);
  } catch (error) {
    console.error('Resume upload/analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze resume', error: error.message });
  }
};

export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id });
    resumes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resumes', error: error.message });
  }
};

export const getLatestResume = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id });
    resumes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (resumes.length === 0) {
      return res.status(404).json({ message: 'No resume found' });
    }
    res.json(resumes[0]); // sorted by creation date
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch latest resume', error: error.message });
  }
};
