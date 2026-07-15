import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { MockInterview } from '../models/MockInterview.js';
import { DSATracking } from '../models/DSATracking.js';
import { Note } from '../models/Note.js';
import { Roadmap } from '../models/Roadmap.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      skills: [],
      dsaStreak: 0,
      dsaLastSolved: '',
      readinessScore: 0
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'preppilot_jwt_secret_key_12345',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        dsaStreak: user.dsaStreak,
        readinessScore: user.readinessScore
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Refresh daily streak
    const today = new Date().toISOString().split('T')[0];
    let streak = user.dsaStreak || 0;
    if (user.dsaLastSolved) {
      const lastSolvedDate = new Date(user.dsaLastSolved);
      const diffTime = Math.abs(new Date(today) - lastSolvedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Kept streak
      } else if (diffDays > 1) {
        streak = 0; // Lost streak
      }
    }

    await User.findByIdAndUpdate(user._id, { dsaStreak: streak });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'preppilot_jwt_secret_key_12345',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        dsaStreak: streak,
        readinessScore: user.readinessScore
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
      dsaStreak: user.dsaStreak,
      readinessScore: user.readinessScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const { name, skills, avatar } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(req.user.id, {
      name,
      skills,
      avatar
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch all related entities
    const resumes = await Resume.find({ userId });
    const interviews = await MockInterview.find({ userId });
    const dsaSolved = await DSATracking.find({ userId });
    const notes = await Note.find({ userId });
    const roadmaps = await Roadmap.find({ userId });

    const sortedResumes = [...resumes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const sortedInterviews = [...interviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const sortedDsaSolved = [...dsaSolved].sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));
    const sortedRoadmaps = [...roadmaps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate metrics
    const latestResume = sortedResumes[0] || null;
    const resumeScore = latestResume ? latestResume.atsScore : 0;

    const completedInterviews = sortedInterviews.filter(i => i.status === 'completed');
    const activeInterviews = sortedInterviews.filter(i => i.status === 'active');
    const avgInterviewScore = completedInterviews.length > 0
      ? Math.round(completedInterviews.reduce((acc, curr) => acc + curr.overallScore, 0) / completedInterviews.length)
      : 0;

    // DSA Difficulty Breakdown
    const easyCount = sortedDsaSolved.filter(d => d.difficulty === 'Easy').length;
    const mediumCount = sortedDsaSolved.filter(d => d.difficulty === 'Medium').length;
    const hardCount = sortedDsaSolved.filter(d => d.difficulty === 'Hard').length;
    const dsaTotal = sortedDsaSolved.length;

    // Calculate Placement Readiness Score (weighted combination)
    // Resume ATS (30%), Mock Interviews (35%), DSA Tracker (35%)
    const dsaFactor = Math.min(100, (dsaTotal / 30) * 100); // target 30 solved problems for full marks in metrics
    const calculatedReadiness = Math.round(
      (resumeScore * 0.3) +
      (avgInterviewScore * 0.35) +
      (dsaFactor * 0.35)
    );

    const finalReadiness = calculatedReadiness || 0;
    await User.findByIdAndUpdate(userId, { readinessScore: finalReadiness });

    const dsaActivityByDate = {};
    for (const log of sortedDsaSolved) {
      const dateKey = new Date(log.solvedAt).toISOString().split('T')[0];
      dsaActivityByDate[dateKey] = (dsaActivityByDate[dateKey] || 0) + 1;
    }

    const activeRoadmap = sortedRoadmaps[0] || null;
    const activeRoadmapTotalTasks = activeRoadmap
      ? activeRoadmap.weeks.reduce((total, week) => total + (week.dailyTasks?.length || 0), 0)
      : 0;
    const activeRoadmapCompletedTasks = activeRoadmap?.completedTasks?.length || 0;
    const activeRoadmapProgress = activeRoadmapTotalTasks > 0
      ? Math.round((activeRoadmapCompletedTasks / activeRoadmapTotalTasks) * 100)
      : 0;

    res.json({
      readinessScore: finalReadiness,
      dsaStreak: user.dsaStreak,
      resumeScore,
      avgInterviewScore,
      resumeCount: sortedResumes.length,
      interviewsCount: sortedInterviews.length,
      completedInterviewsCount: completedInterviews.length,
      activeInterviewsCount: activeInterviews.length,
      roadmapsCount: sortedRoadmaps.length,
      activeRoadmapCurrentWeek: activeRoadmap ? activeRoadmap.currentWeek || 1 : null,
      activeRoadmapDurationWeeks: activeRoadmap ? activeRoadmap.durationWeeks || null : null,
      activeRoadmapProgress,
      hasResume: sortedResumes.length > 0,
      hasRoadmap: sortedRoadmaps.length > 0,
      hasCompletedInterview: completedInterviews.length > 0,
      hasActiveInterview: activeInterviews.length > 0,
      dsaCount: {
        total: dsaTotal,
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount
      },
      notesCount: notes.length,
      dsaActivityByDate,
      recentActivity: [
        ...sortedDsaSolved.slice(0, 3).map(d => ({ type: 'dsa', detail: `Solved ${d.problemName} (${d.difficulty})`, date: d.solvedAt })),
        ...completedInterviews.slice(0, 2).map(i => ({ type: 'interview', detail: `Completed ${i.type} Mock Interview (Scored ${i.overallScore}%)`, date: i.createdAt })),
        ...sortedResumes.slice(0, 1).map(r => ({ type: 'resume', detail: `Uploaded resume: ${r.filename} (ATS Score: ${r.atsScore}%)`, date: r.createdAt }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error loading dashboard metrics', error: error.message });
  }
};
