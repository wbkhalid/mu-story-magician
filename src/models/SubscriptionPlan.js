import mongoose from 'mongoose';

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    numOfStories: Number,
    category: {
      type: String,
      enum: ['free', 'per story', 'per month'],
      default: 'free',
    },
    slug: {
      type: String,
      enum: ['free', 'silver', 'gold', 'platinum'],
      default: 'free',
      unique: true,
    },
    description: {
      type: [String],
    },
    abilityToPurchase: {
      type: [String],
    },
    stripePriceId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SubscriptionPlan ||
  mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
