import { Roadmap } from '../models/Roadmap.js';
import { User } from '../models/User.js';
import { aiService } from '../services/aiService.js';

export const createRoadmap = async (req, res) => {
  const { targetCompany } = req.body;
  try {
    if (!targetCompany) {
      return res.status(400).json({ message: 'Target company is required' });
    }

    const user = await User.findById(req.user.id);
    const skills = user ? user.skills : [];

    // Generate using Gemini
    const roadmapData = await aiService.generateRoadmap(targetCompany, skills);

    const newRoadmap = await Roadmap.create({
      userId: req.user.id,
      title: roadmapData.title,
      targetCompany: roadmapData.targetCompany,
      durationWeeks: roadmapData.durationWeeks,
      weeks: roadmapData.weeks,
      currentWeek: 1
    });

    res.status(201).json(newRoadmap);
  } catch (error) {
    console.error('Roadmap generation failed:', error);
    res.status(500).json({ message: 'Failed to generate study roadmap', error: error.message });
  }
};

export const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user.id });
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch roadmaps', error: error.message });
  }
};

export const getRoadmapById = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.roadmapId);
    if (!roadmap || roadmap.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch roadmap details', error: error.message });
  }
};

export const updateRoadmapProgress = async (req, res) => {
  const { currentWeek, completedTasks } = req.body;
  try {
    const roadmap = await Roadmap.findById(req.params.roadmapId);
    if (!roadmap || roadmap.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    const update = {};
    if (currentWeek !== undefined) {
      const nextWeek = Number(currentWeek);
      if (!Number.isInteger(nextWeek) || nextWeek < 1 || nextWeek > roadmap.durationWeeks) {
        return res.status(400).json({ message: 'Invalid roadmap week' });
      }
      update.currentWeek = nextWeek;
    }
    if (Array.isArray(completedTasks)) {
      update.completedTasks = completedTasks;
    }

    const updated = await Roadmap.findByIdAndUpdate(req.params.roadmapId, update);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update roadmap progress', error: error.message });
  }
};
