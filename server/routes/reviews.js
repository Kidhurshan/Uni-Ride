const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', auth, [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, rating, comment, tags } = req.body;

    // Get booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed rides' });
    }

    // Determine reviewer and reviewee
    const isRider = booking.rider.toString() === req.userId.toString();
    const isDriver = booking.driver.toString() === req.userId.toString();

    if (!isRider && !isDriver) {
      return res.status(403).json({ message: 'Not authorized to review this booking' });
    }

    const reviewee = isRider ? booking.driver : booking.rider;
    const reviewType = isRider ? 'rider_to_driver' : 'driver_to_rider';

    // Check for existing review
    const existingReview = await Review.findOne({
      booking: bookingId,
      reviewer: req.userId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    // Create review
    const review = new Review({
      booking: bookingId,
      ride: booking.ride,
      reviewer: req.userId,
      reviewee,
      reviewType,
      rating,
      comment,
      tags
    });

    await review.save();

    // Update booking with review ID
    if (isRider) {
      booking.riderReviewId = review._id;
    } else {
      booking.driverReviewId = review._id;
    }
    await booking.save();

    // Notify reviewee
    await Notification.create({
      user: reviewee,
      type: 'new_review',
      title: 'New Review',
      message: `You received a ${rating}-star review!`,
      data: {
        bookingId: booking._id,
        rideId: booking.ride
      }
    });

    await review.populate('reviewer', 'firstName lastName profileImage');

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews for a user
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'firstName lastName profileImage')
      .populate('ride', 'origin destination departureDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ reviewee: req.params.userId });

    // Calculate rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { reviewee: require('mongoose').Types.ObjectId(req.params.userId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      reviews,
      ratingBreakdown,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/booking/:bookingId
// @desc    Get reviews for a booking
// @access  Private
router.get('/booking/:bookingId', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ booking: req.params.bookingId })
      .populate('reviewer', 'firstName lastName profileImage')
      .populate('reviewee', 'firstName lastName profileImage');

    res.json({ reviews });
  } catch (error) {
    console.error('Get booking reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/my-reviews
// @desc    Get reviews written by current user
// @access  Private
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.userId })
      .populate('reviewee', 'firstName lastName profileImage')
      .populate('ride', 'origin destination departureDate')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review (only within 24 hours)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.reviewer.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if within 24 hours
    const hoursSinceCreation = (Date.now() - review.createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({ message: 'Reviews can only be deleted within 24 hours' });
    }

    await review.deleteOne();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
