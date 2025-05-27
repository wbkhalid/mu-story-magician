import mongoose from 'mongoose';

const verificationTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  userData: {
    password: {
      type: String,
      required: true,
    },
  },
});

export default mongoose.models.VerificationToken ||
  mongoose.model('VerificationToken', verificationTokenSchema);
