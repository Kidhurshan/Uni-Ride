const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Message, Conversation } = require('../models/Message');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// @route   POST /api/messages/conversation
// @desc    Create or get a conversation
// @access  Private
router.post('/conversation', auth, [
  body('participantId').notEmpty().withMessage('Participant ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { participantId, rideId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, participantId] }
    }).populate('participants', 'firstName lastName profileImage');

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.userId, participantId],
        ride: rideId
      });
      await conversation.save();
      await conversation.populate('participants', 'firstName lastName profileImage');
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    })
      .populate('participants', 'firstName lastName profileImage')
      .populate('ride', 'origin destination departureDate')
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversation/:id
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversation/:id', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.userId },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Reset unread count
    const unreadCount = conversation.unreadCount || new Map();
    unreadCount.set(req.userId.toString(), 0);
    conversation.unreadCount = unreadCount;
    await conversation.save();

    res.json({
      messages: messages.reverse(),
      conversation
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, [
  body('conversationId').notEmpty().withMessage('Conversation ID is required'),
  body('content').notEmpty().withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { conversationId, content, messageType } = req.body;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: req.userId,
      content,
      messageType: messageType || 'text'
    });

    await message.save();
    await message.populate('sender', 'firstName lastName profileImage');

    // Update conversation
    conversation.lastMessage = {
      content,
      sender: req.userId,
      timestamp: new Date()
    };

    // Increment unread count for other participant
    const otherParticipant = conversation.participants.find(
      p => p.toString() !== req.userId.toString()
    );

    const unreadCount = conversation.unreadCount || new Map();
    const currentCount = unreadCount.get(otherParticipant.toString()) || 0;
    unreadCount.set(otherParticipant.toString(), currentCount + 1);
    conversation.unreadCount = unreadCount;

    await conversation.save();

    // Send real-time notification
    const io = req.app.get('io');
    io.to(otherParticipant.toString()).emit('newMessage', {
      message,
      conversationId
    });

    // Create notification
    await Notification.create({
      user: otherParticipant,
      type: 'new_message',
      title: 'New Message',
      message: `${req.user.firstName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      data: {
        conversationId: conversation._id,
        userId: req.userId
      }
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/conversation/:id
// @desc    Delete a conversation
// @access  Private
router.delete('/conversation/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all messages
    await Message.deleteMany({ conversation: req.params.id });
    await conversation.deleteOne();

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
