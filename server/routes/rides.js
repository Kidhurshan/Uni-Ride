const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Ride = require('../models/Ride');
const { auth, isDriver } = require('../middleware/auth');

// @route   POST /api/rides
// @desc    Create a new ride
// @access  Private (Driver)
router.post('/', auth, isDriver, [
  body('origin.address').notEmpty().withMessage('Origin address is required'),
  body('destination.address').notEmpty().withMessage('Destination address is required'),
  body('departureDate').isISO8601().withMessage('Valid departure date is required'),
  body('departureTime').notEmpty().withMessage('Departure time is required'),
  body('totalSeats').isInt({ min: 1, max: 8 }).withMessage('Total seats must be between 1 and 8'),
  body('pricePerSeat').isFloat({ min: 0 }).withMessage('Price per seat must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      origin,
      destination,
      stops,
      departureDate,
      departureTime,
      estimatedArrival,
      totalSeats,
      pricePerSeat,
      currency,
      preferences,
      description,
      isRecurring,
      recurringDays
    } = req.body;

    const ride = new Ride({
      driver: req.userId,
      origin,
      destination,
      stops,
      departureDate,
      departureTime,
      estimatedArrival,
      totalSeats,
      availableSeats: totalSeats,
      pricePerSeat,
      currency: currency || 'USD',
      vehicleInfo: `${req.user.driverInfo?.vehicleColor || ''} ${req.user.driverInfo?.vehicleMake || ''} ${req.user.driverInfo?.vehicleModel || ''}`.trim(),
      preferences,
      description,
      isRecurring,
      recurringDays
    });

    await ride.save();
    await ride.populate('driver', 'firstName lastName profileImage rating');

    res.status(201).json({
      message: 'Ride created successfully',
      ride
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides
// @desc    Get all available rides with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      origin,
      destination,
      date,
      minSeats,
      maxPrice,
      page = 1,
      limit = 10
    } = req.query;

    const query = {
      status: 'scheduled',
      availableSeats: { $gte: minSeats || 1 },
      departureDate: { $gte: new Date() }
    };

    // Text search for origin/destination
    if (origin) {
      query['origin.address'] = { $regex: origin, $options: 'i' };
    }
    if (destination) {
      query['destination.address'] = { $regex: destination, $options: 'i' };
    }

    // Date filter
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.departureDate = { $gte: searchDate, $lt: nextDay };
    }

    // Price filter
    if (maxPrice) {
      query.pricePerSeat = { $lte: parseFloat(maxPrice) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const rides = await Ride.find(query)
      .populate('driver', 'firstName lastName profileImage rating driverInfo.isVerified')
      .sort({ departureDate: 1, departureTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ride.countDocuments(query);

    res.json({
      rides,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides/my-rides
// @desc    Get current user's rides (as driver)
// @access  Private
router.get('/my-rides', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { driver: req.userId };

    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .sort({ departureDate: -1 })
      .populate('driver', 'firstName lastName profileImage');

    res.json({ rides });
  } catch (error) {
    console.error('Get my rides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides/:id
// @desc    Get ride by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'firstName lastName profileImage phone rating driverInfo university');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json({ ride });
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/rides/:id
// @desc    Update ride
// @access  Private (Driver - owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    if (ride.status !== 'scheduled') {
      return res.status(400).json({ message: 'Cannot update a ride that has started or completed' });
    }

    const allowedUpdates = [
      'origin', 'destination', 'stops', 'departureDate', 'departureTime',
      'estimatedArrival', 'totalSeats', 'pricePerSeat', 'preferences', 'description'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        ride[field] = req.body[field];
      }
    });

    // Update available seats if total seats changed
    if (req.body.totalSeats !== undefined) {
      const bookedSeats = ride.totalSeats - ride.availableSeats;
      ride.availableSeats = req.body.totalSeats - bookedSeats;
    }

    await ride.save();
    await ride.populate('driver', 'firstName lastName profileImage rating');

    res.json({
      message: 'Ride updated successfully',
      ride
    });
  } catch (error) {
    console.error('Update ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/rides/:id/status
// @desc    Update ride status
// @access  Private (Driver - owner only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    ride.status = status;
    await ride.save();

    res.json({
      message: 'Ride status updated',
      ride
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/rides/:id
// @desc    Cancel/Delete ride
// @access  Private (Driver - owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this ride' });
    }

    ride.status = 'cancelled';
    await ride.save();

    // TODO: Notify all booked riders about cancellation

    res.json({ message: 'Ride cancelled successfully' });
  } catch (error) {
    console.error('Delete ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
