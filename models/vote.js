import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  messageId: String,
  chatId: String,
  image: String,
  category: String,
  votes: { Love: { type: Number, default: 0 }, Meh: { type: Number, default: 0 }, Not: { type: Number, default: 0 } },
  timestamp: { type: Date, default: Date.now }
});

export const Vote = mongoose.models.Vote || mongoose.model('Vote', voteSchema);
 
