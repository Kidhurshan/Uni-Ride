const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewType: {
    type: String,
    enum: ['rider_to_driver', 'driver_to_rider'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    enum: ['punctual', 'friendly', 'safe_driver', 'clean_car', 'good_music', 'great_conversation', 'respectful']
  }]
}, {
  timestamps: true
});

// Prevent duplicate reviews
reviewSchema.index({ booking: 1, reviewer: 1 }, { unique: true });

// Update user rating after review is saved
reviewSchema.post('save', async function() {
  const User = require('./User');
  const reviews = await this.constructor.find({ reviewee: this.reviewee });

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(this.reviewee, {
      'rating.average': Math.round(averageRating * 10) / 10,
      'rating.count': reviews.length
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
