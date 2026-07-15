import { DSATracking } from '../models/DSATracking.js';
import { User } from '../models/User.js';

const calculateStreak = (history = []) => {
  const solvedDays = [...new Set(history.map(item => new Date(item.solvedAt).toISOString().split('T')[0]))]
    .sort((a, b) => new Date(b) - new Date(a));

  if (solvedDays.length === 0) {
    return { streak: 0, lastSolved: '' };
  }

  const todayKey = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  if (solvedDays[0] !== todayKey && solvedDays[0] !== yesterdayKey) {
    return { streak: 0, lastSolved: solvedDays[0] };
  }

  let streak = 1;
  for (let i = 1; i < solvedDays.length; i += 1) {
    const previous = new Date(solvedDays[i - 1]);
    const current = new Date(solvedDays[i]);
    const diffDays = Math.round((previous - current) / (1000 * 60 * 60 * 24));
    if (diffDays !== 1) break;
    streak += 1;
  }

  return { streak, lastSolved: solvedDays[0] };
};

export const logDsaProblem = async (req, res) => {
  const { problemName, difficulty, topic, platform, problemUrl } = req.body;
  try {
    if (!problemName || !difficulty || !topic) {
      return res.status(400).json({ message: 'Problem name, difficulty, and topic are required' });
    }

    const dsaLog = await DSATracking.create({
      userId: req.user.id,
      problemName,
      difficulty,
      topic,
      platform: platform || 'LeetCode',
      problemUrl: problemUrl || '',
      solvedAt: new Date().toISOString()
    });

    const history = await DSATracking.find({ userId: req.user.id });
    const { streak: newStreak, lastSolved } = calculateStreak(history);

    await User.findByIdAndUpdate(req.user.id, {
      dsaStreak: newStreak,
      dsaLastSolved: lastSolved
    });

    res.status(201).json({ dsaLog, streak: newStreak });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log DSA problem', error: error.message });
  }
};

export const getDsaHistory = async (req, res) => {
  try {
    const history = await DSATracking.find({ userId: req.user.id });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch DSA logs', error: error.message });
  }
};

export const deleteDsaProblem = async (req, res) => {
  try {
    const existing = await DSATracking.findById(req.params.dsaId);
    if (!existing || existing.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ message: 'DSA problem not found' });
    }

    await DSATracking.deleteOne({ _id: req.params.dsaId, userId: req.user.id });

    const history = await DSATracking.find({ userId: req.user.id });
    const { streak, lastSolved } = calculateStreak(history);

    await User.findByIdAndUpdate(req.user.id, {
      dsaStreak: streak,
      dsaLastSolved: lastSolved
    });

    res.json({ message: 'DSA problem deleted', streak });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete DSA problem', error: error.message });
  }
};

export const getDsaRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await DSATracking.find({ userId });

    // Identify solved topics
    const solvedTopics = new Set(history.map(h => h.topic));

    const allRecommendations = [
      { problemName: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', platform: 'LeetCode', company: 'Google' },
      { problemName: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Strings', platform: 'LeetCode', company: 'Amazon' },
      { problemName: 'Container With Most Water', difficulty: 'Medium', topic: 'Arrays', platform: 'LeetCode', company: 'Adobe' },
      { problemName: 'Merge k Sorted Lists', difficulty: 'Hard', topic: 'Linked List', platform: 'LeetCode', company: 'Microsoft' },
      { problemName: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', topic: 'Trees', platform: 'LeetCode', company: 'Facebook' },
      { problemName: 'Course Schedule', difficulty: 'Medium', topic: 'Graphs', platform: 'LeetCode', company: 'Amazon' },
      { problemName: 'Word Search II', difficulty: 'Hard', topic: 'Backtracking', platform: 'LeetCode', company: 'Google' },
      { problemName: 'Edit Distance', difficulty: 'Hard', topic: 'Dynamic Programming', platform: 'LeetCode', company: 'Microsoft' }
    ];

    // Recommend problems that are in unsolved topics, or just general medium/hard if all solved
    const recommended = allRecommendations.filter(rec => !solvedTopics.has(rec.topic));
    const finalRecs = recommended.length > 0 ? recommended : allRecommendations.slice(0, 3);

    res.json(finalRecs.slice(0, 4));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch DSA recommendations', error: error.message });
  }
};
