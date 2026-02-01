// server/index.js
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { generateCycle } from './logic.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: '*' }));
app.use(express.json());

// 1. Create User & Generate First Cycle
app.post('/onboard', async (req, res) => {
  try {
    const { name, height, weight, age, gender, activityLevel, dietPreference } = req.body;
    
    // Create User
    const user = await prisma.user.create({
      data: { name, height, weight, age, gender, activityLevel, dietPreference }
    });

    // Generate Plan
    const scheduleJson = generateCycle(user);
    const cycle = await prisma.cycle.create({
      data: {
        userId: user.id,
        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), 
        goal: "Foundation",
        schedule: scheduleJson
      }
    });

    res.json({ user, cycle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Get Today's Data + History + Total Spent
app.get('/today/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const cycle = await prisma.cycle.findFirst({
    where: { userId, isActive: true }
  });

  if (!cycle) return res.json({ error: "No active cycle" });

  const today = new Date();
  today.setHours(0,0,0,0);
  
  // A. Get Today's Log
  const log = await prisma.dailyLog.findFirst({
    where: { userId, date: { gte: today } }
  });

  // B. Get History (Last 7 Days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0,0,0,0);

  const history = await prisma.dailyLog.findMany({
    where: { 
      userId, 
      date: { gte: sevenDaysAgo } 
    },
    orderBy: { date: 'asc' }
  });

  // C. Calculate Total Spent (For the whole cycle)
  const cycleStart = new Date(cycle.startDate);
  
  // We fetch a minimal list of just costs for the whole cycle to sum them up
  const allCosts = await prisma.dailyLog.findMany({
    where: { 
      userId, 
      date: { gte: cycleStart } 
    },
    select: { dietCost: true } // Only fetch the cost field to be fast
  });

  const totalSpent = allCosts.reduce((sum, entry) => sum + (entry.dietCost || 0), 0);

  // D. Calculate Cycle Day
  const start = new Date(cycle.startDate);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 

  const schedule = JSON.parse(cycle.schedule);
  const todaysWorkout = schedule[dayIndex] || [];

  // Pass 'totalSpent' to the frontend
  res.json({ dayIndex, workout: todaysWorkout, log, history, totalSpent });
});

// 3. Toggle Habit OR Log Data
app.post('/log', async (req, res) => {
  const { userId, type, value } = req.body; 
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  try {
    let log = await prisma.dailyLog.findFirst({
      where: { userId, date: { gte: today } }
    });

    if (!log) {
      log = await prisma.dailyLog.create({
        data: { userId, date: new Date() }
      });
    }

    const updateData = {};
    if (type === 'workout') updateData.workoutDone = value;
    if (type === 'diet') updateData.dietFollowed = value;
    
    // NEW LOGIC: Handle numbers for steps/cost
    if (type === 'steps') updateData.steps = Number(value);
    if (type === 'cost') updateData.dietCost = Number(value);

    const updatedLog = await prisma.dailyLog.update({
      where: { id: log.id },
      data: updateData
    });

    res.json(updatedLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Restore Session
app.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const cycle = await prisma.cycle.findFirst({
      where: { userId: id, isActive: true }
    });

    res.json({ user, cycle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));