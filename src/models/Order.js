import mongoose from 'mongoose';

const statusValues = [
  'CREATED',
  'REJECTED',
  'UNPAID',
  'PAYMENT_IN_PROGRESS',
  'PRODUCTION_READY',
  'PRODUCTION_DELAYED',
  'IN_PRODUCTION',
  'ERROR',
  'SHIPPED',
  'CANCELED',
];

const OrderSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    quantity: { type: Number, required: true },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: statusValues,
      default: 'CREATED',
    },
    orderId: { type: String },
    paymentId: { type: String },
    dropShipId: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shippingLevel: { type: String },
    contactEmail: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
