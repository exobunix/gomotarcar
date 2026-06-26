const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Mock performance data
router.get('/cleaner/:cleanerId/performance', (req, res) => {
  res.json({
    success: true,
    data: {
      period: req.query.period || 'all',
      tasksAssigned: 150,
      tasksCompleted: 145,
      completionRate: 96.6,
      onTimeRate: 98.2,
      avgRating: 4.8,
      ratingBreakdown: { 1: 0, 2: 1, 3: 4, 4: 20, 5: 120 },
      attendanceRate: 96,
      lateDays: 2,
      absentDays: 1,
      points: 450,
      level: 'Gold'
    }
  });
});

// Mock achievements data
router.get('/cleaner/:cleanerId/achievements', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: 'ach_1',
        title: 'Century Cleaner',
        description: 'Completed 100 cleaning tasks',
        icon: 'trophy',
        category: 'tasks',
        unlockedAt: new Date(),
        progress: 100,
        target: 100,
        points: 100
      },
      {
        _id: 'ach_2',
        title: 'Punctuality Master',
        description: '95%+ attendance rate for 30 consecutive days',
        icon: 'clock',
        category: 'attendance',
        unlockedAt: new Date(),
        progress: 30,
        target: 30,
        points: 50
      },
      {
        _id: 'ach_3',
        title: '5-Star Champion',
        description: 'Receive ten 5-star ratings',
        icon: 'star',
        category: 'rating',
        progress: 8,
        target: 10,
        points: 75
      }
    ]
  });
});

module.exports = router;
