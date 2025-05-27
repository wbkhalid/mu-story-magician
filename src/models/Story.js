import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema(
  {
    title: String,
    outlines: [String],
    coverphoto: { bestImageUrl: String, urls: [String] },
    type: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    characters: [
      {
        name: String,
        age: String,
        gender: String,
        description: String,
      },
    ],
    pageContent: [],
    dedicationPage: {
      title: { type: String, required: false, default: null },
      message: { type: String, required: false, default: null },
      from: { type: String, required: false, default: null },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    writer: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Story || mongoose.model('Story', StorySchema);
