const Task = require('../models/Task');
const Cleaner = require('../models/Cleaner');
const { CleanerLiveLocation } = require('../models/Tracking');
const { calculateDistance } = require('../utils/geo');
const { AppError } = require('../middleware/errorHandler');

class RouteOptimizationService {
  /**
   * Find the optimal cleaner for a task based on proximity, workload, and rating
   */
  async findOptimalCleaner({ taskId, zoneId, maxDistance = 10000 } = {}) {
    const task = taskId ? await Task.findById(taskId) : null;
    const taskLocation = task?.location?.coordinates || [0, 0];

    // Get online cleaners in zone
    const query = { isOnline: true };
    if (zoneId) query.assignedZone = zoneId;

    const onlineCleaners = await CleanerLiveLocation.find(query)
      .populate('cleanerId', 'firstName lastName cleanerId stats');

    if (onlineCleaners.length === 0) {
      throw new AppError('No online cleaners available', 404, 'OPT_NO_CLEANERS');
    }

    // Calculate scores for each cleaner
    const scored = await Promise.all(onlineCleaners.map(async (loc) => {
      const [lng, lat] = loc.location.coordinates;
      const [taskLng, taskLat] = taskLocation;

      // Distance score (0-100, closer = better)
      const distance = taskLocation[0] !== 0
        ? calculateDistance(taskLat, taskLng, lat, lng)
        : 0;
      const distanceScore = distance > 0
        ? Math.max(0, 100 - (distance / maxDistance) * 100)
        : 50;

      // Workload score (0-100, less tasks = better)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const todayTasks = await Task.countDocuments({
        cleanerId: loc.cleanerId._id,
        scheduledDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['assigned', 'in_progress', 'completed'] },
      });
      const workloadScore = Math.max(0, 100 - todayTasks * 20);

      // Rating score (0-100)
      const rating = loc.cleanerId.stats?.averageRating || 0;
      const ratingScore = (rating / 5) * 100;

      // Composite score
      const compositeScore = distanceScore * 0.40 + workloadScore * 0.35 + ratingScore * 0.25;

      return {
        cleanerId: loc.cleanerId._id,
        name: `${loc.cleanerId.firstName} ${loc.cleanerId.lastName || ''}`.trim(),
        cleanerCode: loc.cleanerId.cleanerId,
        distance: Math.round(distance),
        currentLoad: todayTasks,
        rating: loc.cleanerId.stats?.averageRating || 0,
        scores: { distance: Math.round(distanceScore), workload: Math.round(workloadScore), rating: Math.round(ratingScore) },
        compositeScore: Math.round(compositeScore),
        location: { lat, lng },
      };
    }));

    // Sort by composite score descending
    scored.sort((a, b) => b.compositeScore - a.compositeScore);

    return {
      recommended: scored[0],
      alternatives: scored.slice(1, 5),
      totalConsidered: scored.length,
    };
  }

  /**
   * Optimize route for a cleaner's tasks for the day
   */
  async optimizeRoute(cleanerId, date) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      cleanerId,
      scheduledDate: { $gte: targetDate, $lte: endOfDay },
      status: { $in: ['assigned', 'in_progress'] },
    }).sort({ scheduledTime: 1 });

    if (tasks.length === 0) {
      return { optimized: false, message: 'No tasks found for the date', tasks: [] };
    }

    // Get cleaner's current location
    const liveLocation = await CleanerLiveLocation.findOne({ cleanerId });
    const startLocation = liveLocation?.location?.coordinates || [0, 0];

    // Nearest neighbor route optimization
    const route = [];
    const unvisited = [...tasks];
    let currentPos = { lng: startLocation[0], lat: startLocation[1] };

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const taskLocation = unvisited[i].location?.coordinates;
        if (taskLocation) {
          const dist = calculateDistance(
            currentPos.lat, currentPos.lng,
            taskLocation[1], taskLocation[0]
          );
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestIdx = i;
          }
        }
      }

      const nearest = unvisited.splice(nearestIdx, 1)[0];
      const taskLoc = nearest.location?.coordinates;
      route.push({
        taskId: nearest._id,
        taskIdCode: nearest.taskId,
        customer: nearest.customerId,
        vehicle: nearest.vehicleId,
        scheduledTime: nearest.scheduledTime,
        location: taskLoc ? { lat: taskLoc[1], lng: taskLoc[0] } : null,
        distanceFromPrev: Math.round(nearestDist),
      });

      if (taskLoc) {
        currentPos = { lat: taskLoc[1], lng: taskLoc[0] };
      }
    }

    // Calculate total distance
    const totalDistance = route.reduce((sum, r) => sum + (r.distanceFromPrev || 0), 0);

    return {
      optimized: true,
      totalDistance: Math.round(totalDistance),
      taskCount: route.length,
      route,
    };
  }

  /**
   * Estimate travel time between two locations
   */
  estimateTravelTime(distanceMeters, averageSpeedKmh = 25) {
    const hours = distanceMeters / 1000 / averageSpeedKmh;
    const minutes = Math.ceil(hours * 60);
    return {
      distanceMeters,
      distanceKm: (distanceMeters / 1000).toFixed(1),
      estimatedMinutes: minutes,
      estimatedArrival: new Date(Date.now() + minutes * 60000).toISOString(),
    };
  }

  /**
   * Batch assign tasks to cleaners using optimization
   */
  async batchAssign(tasks, zoneId) {
    const assignments = [];
    for (const taskData of tasks) {
      try {
        const { recommended } = await this.findOptimalCleaner({
          taskId: taskData.taskId,
          zoneId,
        });
        assignments.push({
          taskId: taskData.taskId,
          assignedCleanerId: recommended.cleanerId,
          score: recommended.compositeScore,
          distance: recommended.distance,
        });
      } catch (e) {
        assignments.push({ taskId: taskData.taskId, error: e.message });
      }
    }
    return { assignments, total: assignments.length, successful: assignments.filter(a => !a.error).length };
  }
}

module.exports = new RouteOptimizationService();
