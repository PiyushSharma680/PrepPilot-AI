import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Expected format: Bearer <token>
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7, authHeader.length).trim() 
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'preppilot_jwt_secret_key_12345');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;
