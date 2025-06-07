const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scene: { type: mongoose.Schema.Types.ObjectId, ref: 'Scene', required: true },
  purchasedAt: { type: Date, default: Date.now },
  price: { type: Number, required: true },
  receiptEmail: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
