import { MockInterview } from '../models/MockInterview.js';
import { aiService } from '../services/aiService.js';

const MAX_QUESTIONS = 3;
const ALLOWED_TYPES = ['Technical', 'HR', 'Behavioral'];

const getAnsweredCount = (questions = []) => questions.filter(q => q.userAnswer && q.userAnswer.trim()).length;

export const startInterview = async (req, res) => {
  const { type, category } = req.body;
  try {
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Interview type (Technical, HR, Behavioral) is required' });
    }

    const interview = await MockInterview.create({
      userId: req.user.id,
      type,
      category: category || 'General',
      overallScore: 0,
      questions: [],
      status: 'active'
    });

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to start interview', error: error.message });
  }
};

export const getNextQuestion = async (req, res) => {
  const { interviewId } = req.params;
  try {
    const interview = await MockInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }
    if (interview.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this interview' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'Interview is already completed' });
    }
    const lastQuestion = interview.questions[interview.questions.length - 1];
    if (lastQuestion && !lastQuestion.userAnswer) {
      return res.json({
        question: lastQuestion.question,
        questionIndex: interview.questions.length,
        current: true
      });
    }

    if (interview.questions.length >= MAX_QUESTIONS) {
      return res.status(409).json({
        message: 'Maximum questions reached. Complete the interview.',
        readyToComplete: true,
        questionIndex: interview.questions.length
      });
    }

    // Format previous questions for AI history
    const history = interview.questions.map(q => ({
      question: q.question,
      answer: q.userAnswer || ''
    }));

    const aiQuestion = await aiService.generateInterviewQuestion(interview.type, interview.category, history);
    if (!aiQuestion?.question) {
      return res.status(502).json({ message: 'Question generation returned an invalid response' });
    }

    const updatedQuestions = [...interview.questions, {
      question: aiQuestion.question,
      userAnswer: '',
      feedback: '',
      score: 0
    }];

    await MockInterview.findByIdAndUpdate(interviewId, { questions: updatedQuestions });

    res.json({
      question: aiQuestion.question,
      questionIndex: updatedQuestions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate question', error: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  const { interviewId } = req.params;
  const { answer } = req.body;

  try {
    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Answer is required' });
    }

    const interview = await MockInterview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this interview' });
    }
    if (interview.status === 'completed') {
      return res.status(400).json({ message: 'Interview is already completed' });
    }

    if (interview.questions.length === 0) {
      return res.status(400).json({ message: 'No question generated yet' });
    }

    // Get the last question (current active question)
    const currentQuestionIndex = interview.questions.length - 1;
    const currentQuestion = interview.questions[currentQuestionIndex];

    if (currentQuestion.userAnswer) {
      return res.json({
        score: currentQuestion.score,
        feedback: currentQuestion.feedback,
        questionIndex: interview.questions.length,
        alreadySubmitted: true
      });
    }

    // Evaluate answer
    const grading = await aiService.gradeInterviewAnswer(currentQuestion.question, answer);
    const score = Number.isFinite(Number(grading?.score)) ? Math.max(0, Math.min(100, Math.round(Number(grading.score)))) : 0;
    const feedback = grading?.feedback || 'Answer recorded. Review the score and continue to the next question.';

    const updatedQuestions = [...interview.questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: answer,
      feedback,
      score
    };

    await MockInterview.findByIdAndUpdate(interviewId, { questions: updatedQuestions });

    res.json({
      score,
      feedback,
      answeredCount: getAnsweredCount(updatedQuestions),
      maxQuestions: MAX_QUESTIONS,
      questionIndex: updatedQuestions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit answer', error: error.message });
  }
};

export const completeInterview = async (req, res) => {
  const { interviewId } = req.params;
  try {
    const interview = await MockInterview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: 'Interview session not found' });
    if (interview.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this interview' });
    }
    if (interview.status === 'completed') {
      return res.json({
        message: 'Interview already completed',
        interviewId: interview._id,
        overallScore: interview.overallScore,
        improvementAreas: interview.improvementAreas || []
      });
    }

    const scoredQuestions = interview.questions.filter(q => q.userAnswer && q.userAnswer.trim());
    if (scoredQuestions.length < MAX_QUESTIONS) {
      return res.status(400).json({
        message: `Complete all ${MAX_QUESTIONS} questions before finalizing interview`,
        answeredCount: scoredQuestions.length,
        maxQuestions: MAX_QUESTIONS
      });
    }

    const totalScore = scoredQuestions.reduce((acc, curr) => acc + curr.score, 0);
    const overallScore = scoredQuestions.length > 0 ? Math.round(totalScore / scoredQuestions.length) : 0;

    // Determine improvement areas based on scores
    const improvementAreas = [];
    if (overallScore < 70) {
      improvementAreas.push('Elaborate with deeper technical explanations.');
      improvementAreas.push('Provide concrete code architecture examples.');
    } else {
      improvementAreas.push('Maintain high-quality structured answers.');
      improvementAreas.push('Briefly discuss performance tradeoffs and optimizations.');
    }

    await MockInterview.findByIdAndUpdate(interviewId, {
      status: 'completed',
      overallScore,
      improvementAreas
    });

    res.json({
      message: 'Interview completed successfully',
      interviewId: interviewId,
      overallScore,
      improvementAreas
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete interview', error: error.message });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const interviews = await MockInterview.find({ userId: req.user.id });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interview history', error: error.message });
  }
};

export const getActiveInterview = async (req, res) => {
  try {
    const interviews = await MockInterview.find({ userId: req.user.id });
    const active = interviews.find((interview) => interview.status === 'active');
    if (!active) {
      return res.status(404).json({ message: 'No active interview session found' });
    }
    res.json(active);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active interview', error: error.message });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.interviewId);
    if (!interview || interview.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: 'Interview session not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interview', error: error.message });
  }
};
