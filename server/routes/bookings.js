const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create a booking request
// @access  Private
router.post('/', auth, [
  body('rideId').notEmpty().withMessage('Ride ID is required'),
  body('seatsBooked').isInt({ min: 1 }).withMessage('At least 1 seat must be booked')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, seatsBooked, pickupLocation, dropoffLocation, notes } = req.body;

    // Get the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if ride is still available
    if (ride.status !== 'scheduled') {
      return res.status(400).json({ message: 'This ride is no longer available' });
    }

    // Check available seats
    if (ride.availableSeats < seatsBooked) {
      return res.status(400).json({ message: `Only ${ride.availableSeats} seats available` });
    }

    // Cannot book your own ride
    if (ride.driver.toString() === req.userId.toString()) {
      return res.status(400).json({ message: 'Cannot book your own ride' });
    }

    // Check for existing booking
    const existingBooking = await Booking.findOne({
      ride: rideId,
      rider: req.userId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this ride' });
    }

    // Calculate total price
    const totalPrice = ride.pricePerSeat * seatsBooked;

    // Create booking
    const booking = new Booking({
      ride: rideId,
      rider: req.userId,
      driver: ride.driver,
      seatsBooked,
      pickupLocation: pickupLocation || { address: ride.origin.address },
      dropoffLocation: dropoffLocation || { address: ride.destination.address },
      totalPrice,
      notes
    });

    await booking.save();

    // Create notification for driver
    await Notification.create({
      user: ride.driver,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `You have a new booking request for ${seatsBooked} seat(s)`,
      data: {
        rideId: ride._id,
        bookingId: booking._id,
        userId: req.userId
      }
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(ride.driver.toString()).emit('newBookingRequest', {
      bookingId: booking._id,
      rideId: ride._id
    });

    await booking.populate([
      { path: 'ride', select: 'origin destination departureDate departureTime' },
      { path: 'driver', select: 'firstName lastName profileImage' }
    ]);

    res.status(201).json({
      message: 'Booking request sent successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get user's bookings (as rider)
// @access  Private
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { rider: req.userId };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('ride', 'origin destination departureDate departureTime pricePerSeat vehicleInfo status')
      .populate('driver', 'firstName lastName profileImage phone rating')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/ride/:rideId
// @desc    Get all bookings for a ride (driver only)
// @access  Private
router.get('/ride/:rideId', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bookings = await Booking.find({ ride: req.params.rideId })
      .populate('rider', 'firstName lastName profileImage phone rating')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get ride bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('ride')
      .populate('rider', 'firstName lastName profileImage phone rating')
      .populate('driver', 'firstName lastName profileImage phone rating driverInfo');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only rider or driver can view booking details
    if (
      booking.rider._id.toString() !== req.userId.toString() &&
      booking.driver._id.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/confirm
// @desc    Confirm a booking (driver only)
// @access  Private
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.driver.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only the driver can confirm bookings' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not pending' });
    }

    // Update ride available seats
    const ride = await Ride.findById(booking.ride);
    if (ride.availableSeats < booking.seatsBooked) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    ride.availableSeats -= booking.seatsBooked;
    await ride.save();

    booking.status = 'confirmed';
    await booking.save();

    // Notify rider
    await Notification.create({
      user: booking.rider,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: 'Your booking has been confirmed by the driver!',
      data: {
        rideId: booking.ride,
        bookingId: booking._id
      }
    });

    const io = req.app.get('io');
    io.to(booking.rider.toString()).emit('bookingConfirmed', {
      bookingId: booking._id
    });

    res.json({
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/reject
// @desc    Reject a booking (driver only)
// @access  Private
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.driver.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only the driver can reject bookings' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not pending' });
    }

    booking.status = 'rejected';
    await booking.save();

    // Notify rider
    await Notification.create({
      user: booking.rider,
      type: 'booking_rejected',
      title: 'Booking Rejected',
      message: 'Your booking request was not accepted',
      data: {
        rideId: booking.ride,
        bookingId: booking._id
      }
    });

    res.json({
      message: 'Booking rejected',
      booking
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking (rider only)
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.rider.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only the rider can cancel their booking' });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    // If confirmed, restore available seats
    if (booking.status === 'confirmed') {
      await Ride.findByIdAndUpdate(booking.ride, {
        $inc: { availableSeats: booking.seatsBooked }
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Notify driver
    await Notification.create({
      user: booking.driver,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: 'A rider has cancelled their booking',
      data: {
        rideId: booking.ride,
        bookingId: booking._id
      }
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Mark booking as completed
// @access  Private (Driver)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.driver.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only the driver can complete bookings' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking must be confirmed to complete' });
    }

    booking.status = 'completed';
    await booking.save();

    // Notify rider to leave a review
    await Notification.create({
      user: booking.rider,
      type: 'ride_completed',
      title: 'Ride Completed',
      message: 'Your ride is complete! Please leave a review.',
      data: {
        rideId: booking.ride,
        bookingId: booking._id
      }
    });

    res.json({
      message: 'Booking marked as completed',
      booking
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
