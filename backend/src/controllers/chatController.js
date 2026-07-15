import { aiService } from '../services/aiService.js';

export const chatMentor = async (req, res) => {
  const { message, history } = req.body;
  try {
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await aiService.chatMentor(message, history || []);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Mentor chatbot failed to respond', error: error.message });
  }
};
