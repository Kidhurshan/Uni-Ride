const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Booking = require('../models/Booking');

// @route   POST /api/payments/create-intent
// @desc    Create a payment intent (placeholder for Stripe/PayPal integration)
// @access  Private
router.post('/create-intent', auth, async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.rider.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // TODO: Integrate with Stripe or PayPal
    // For now, return a mock payment intent
    const paymentIntent = {
      id: 'pi_' + Date.now(),
      amount: amount || booking.totalPrice,
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: 'mock_client_secret_' + Date.now(),
    };

    res.json({
      message: 'Payment intent created (mock)',
      paymentIntent,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment (placeholder)
// @access  Private
router.post('/confirm', auth, async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // TODO: Verify payment with payment provider

    // Update booking payment status
    booking.paymentStatus = 'paid';
    booking.paymentId = paymentIntentId;
    await booking.save();

    res.json({
      message: 'Payment confirmed',
      booking,
    });
  } catch (error) {
    console.error('Payment confirm error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments/refund
// @desc    Refund payment (placeholder)
// @access  Private
router.post('/refund', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'No payment to refund' });
    }

    // TODO: Process refund with payment provider

    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({
      message: 'Payment refunded',
      booking,
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
