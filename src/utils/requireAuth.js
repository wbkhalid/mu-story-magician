import jwt from 'jsonwebtoken';
import User from 'src/models/User';

export default async function requireAuth(req) {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET);

    if (!decoded) {
      console.log('Token decoding failed');
      throw new Error('Unauthorized');
    }

    if (!decoded.userId) {
      console.log('Decoded token missing id');
      throw new Error('Unauthorized');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found');
      throw new Error('Unauthorized');
    }

    req.user = user;
    return user;
  } catch (err) {
    console.error('JWT Verification Error:', err);
    throw new Error('Unauthorized');
  }
}
