const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  destination: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  stops: [{
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  departureDate: {
    type: Date,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  estimatedArrival: {
    type: String
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  availableSeats: {
    type: Number,
    required: true
  },
  pricePerSeat: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  vehicleInfo: {
    type: String
  },
  preferences: {
    smoking: {
      type: Boolean,
      default: false
    },
    pets: {
      type: Boolean,
      default: false
    },
    music: {
      type: Boolean,
      default: true
    },
    luggage: {
      type: String,
      enum: ['none', 'small', 'medium', 'large'],
      default: 'medium'
    }
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }]
}, {
  timestamps: true
});

// Index for efficient querying
rideSchema.index({ departureDate: 1, status: 1 });
rideSchema.index({ 'origin.address': 'text', 'destination.address': 'text' });

module.exports = mongoose.model('Ride', rideSchema);
