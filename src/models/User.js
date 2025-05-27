import mongoose from 'mongoose';
import { string } from 'prop-types';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    subscriptionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      default: null,
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionExpiryDate: {
      type: Date,
      default: null,
    },
    numOfStories: { type: Number, default: 1 },
    addOns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AddOns',
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    shippingAddress: {
      city: {
        type: String,
      },
      countryCode: {
        type: String,
      },
      name: {
        type: String,
      },
      phone: {
        type: String,
      },
      postCode: {
        type: String,
      },
      stateCode: {
        type: String,
      },
      street: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      shipping_level: {
        type: String,
      },
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
