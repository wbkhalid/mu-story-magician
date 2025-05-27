// src/utils/cronJob.js
import cron from 'node-cron';
import connectToDatabase from 'src/lib/mongodb';
import User from 'src/models/User';

const updateExpiredSubscriptions = async () => {
  try {
    await connectToDatabase();

    const now = new Date();

    const users = await User.updateMany(
      {
        subscriptionExpiryDate: { $lt: now },
        subscriptionPlan: { $ne: null },
      },
      { $set: { subscriptionPlan: null } }
    );

    console.log(`${users.modifiedCount} users updated.`);
  } catch (error) {
    console.error('Error updating expired subscriptions:', error);
  }
};

cron.schedule('0 0 * * *', updateExpiredSubscriptions);
