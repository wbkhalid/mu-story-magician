import mongoose from 'mongoose';

const AddOnsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    description: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AddOns || mongoose.model('AddOns', AddOnsSchema);
