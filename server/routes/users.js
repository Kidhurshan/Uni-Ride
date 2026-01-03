const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().notEmpty(),
  body('university').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'university', 'studentId', 'profileImage'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        university: user.university,
        studentId: user.studentId,
        role: user.role,
        profileImage: user.profileImage,
        rating: user.rating
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/driver-info
// @desc    Update driver information
// @access  Private
router.put('/driver-info', auth, async (req, res) => {
  try {
    const { licenseNumber, vehicleType, vehicleMake, vehicleModel, vehicleYear, vehicleColor, licensePlate } = req.body;

    const driverInfo = {
      licenseNumber,
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      licensePlate,
      isVerified: false // Will be verified by admin
    };

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          driverInfo,
          role: req.user.role === 'rider' ? 'both' : req.user.role
        }
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Driver information updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        driverInfo: user.driverInfo
      }
    });
  } catch (error) {
    console.error('Driver info update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (public profile)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'firstName lastName profileImage university rating role driverInfo.vehicleMake driverInfo.vehicleModel driverInfo.vehicleColor driverInfo.isVerified createdAt'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/push-token
// @desc    Update push notification token
// @access  Private
router.put('/push-token', auth, async (req, res) => {
  try {
    const { pushToken } = req.body;

    await User.findByIdAndUpdate(req.userId, { pushToken });

    res.json({ message: 'Push token updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/account
// @desc    Deactivate account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { isActive: false });
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
