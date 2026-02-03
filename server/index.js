import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import { generateCycle, calculateCalories, generateDietPlan, estimateNutrition } from './logic.js';
import { getAIResponse } from './ai.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: '*' }));
app.use(express.json());

// --- LOGIN ---
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) return res.status(401).json({ error: "Invalid credentials" });

    const cycle = await prisma.cycle.findFirst({ where: { userId: user.id, isActive: true } });
    res.json({ user, cycle });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- ONBOARD ---
app.post('/onboard', async (req, res) => {
  try {
    const { name, email, password, height, weight, age, gender, activityLevel, dietPreference, duration, restrictedFoodDays, workoutPreference } = req.body;
    
    const calorieTarget = calculateCalories({ weight, height, age, gender, activityLevel });

    const user = await prisma.user.create({
      data: { 
        name, email, password, height, weight, age, gender, activityLevel, dietPreference, 
        calorieTarget,
        restrictedFoodDays: restrictedFoodDays || "",
        workoutPreference: workoutPreference || "gym"
      }
    });

    const cycleDuration = duration || 30;
    // generateCycle now handles Gym vs Home logic internally
    const scheduleJson = generateCycle(user, cycleDuration);
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + cycleDuration);

    const cycle = await prisma.cycle.create({
      data: {
        userId: user.id,
        endDate: endDate, 
        duration: cycleDuration,
        goal: `Hypertrophy (${workoutPreference === 'home' ? 'Home' : 'Gym'} Split)`,
        schedule: scheduleJson
      }
    });

    res.json({ user, cycle });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- DASHBOARD ---
app.get('/today/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // 1. Fetch Cycle
  const cycle = await prisma.cycle.findFirst({ where: { userId, isActive: true } });
  if (!cycle) return res.json({ error: "No active cycle" });

  // 2. Fetch User
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const today = new Date();
  today.setHours(0,0,0,0);
  
  // 3. Fetch Today's Log (Include Meals!)
  const log = await prisma.dailyLog.findFirst({ 
    where: { userId, date: { gte: today } },
    include: { meals: true } 
  });

  // 4. Fetch History (Last 30 Days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);
  const history = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: thirtyDaysAgo } },
    orderBy: { date: 'asc' }
  });

  // 5. Calculate Stats
  const cycleStart = new Date(cycle.startDate);
  const allLogs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: cycleStart } }
  });

  const stats = { totalSpent: 0, totalSteps: 0, workoutsDone: 0, weightChange: 0 };
  let latestLoggedWeight = 0;

  allLogs.forEach(entry => {
    stats.totalSpent += (entry.dietCost || 0);
    stats.totalSteps += (entry.steps || 0);
    if (entry.workoutDone) stats.workoutsDone += 1;
    if (entry.currentWeight) latestLoggedWeight = entry.currentWeight;
  });

  if (latestLoggedWeight > 0) {
    stats.weightChange = (latestLoggedWeight - user.weight).toFixed(1);
  }

  // 6. Calculate Workout Day
  const start = new Date(cycle.startDate);
  const now = new Date();
  const dayIndex = Math.floor(Math.abs(now - start) / (1000 * 60 * 60 * 24)); 

  const schedule = JSON.parse(cycle.schedule);
  const scheduledWorkout = schedule[dayIndex % schedule.length] || [];

  // 7. Generate Diet Plan
  const dietPlan = generateDietPlan(user);

  res.json({ 
    dayIndex, 
    cycleDuration: cycle.duration || 30,
    workout: scheduledWorkout, 
    dietPlan, 
    log, 
    history, 
    stats 
  });
});

// --- LOGGING (General Stats) ---
app.post('/log', async (req, res) => {
  const { userId, type, value } = req.body; 
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  try {
    let log = await prisma.dailyLog.findFirst({ where: { userId, date: { gte: today } } });
    if (!log) log = await prisma.dailyLog.create({ data: { userId, date: new Date() } });

    const updateData = {};
    if (type === 'workout') updateData.workoutDone = value;
    if (type === 'diet') updateData.dietFollowed = value;
    if (type === 'steps') updateData.steps = Number(value);
    if (type === 'cost') updateData.dietCost = Number(value);
    if (type === 'weight') updateData.currentWeight = Number(value);

    const updatedLog = await prisma.dailyLog.update({
      where: { id: log.id },
      data: updateData
    });

    res.json(updatedLog);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- ADD MEAL (With Smart Estimation) ---
app.post('/add-meal', async (req, res) => {
  let { userId, name, calories, protein } = req.body; 
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // 1. ESTIMATION LOGIC
    // If calories are empty, 0, or null -> Calculate them!
    if (!calories || calories == 0) {
      console.log(`Estimating for: ${name}`); 
      const estimate = estimateNutrition(name);
      calories = estimate.calories;
      protein = estimate.protein;
    }

    // 2. Find or Create Log
    let log = await prisma.dailyLog.findFirst({ where: { userId, date: { gte: today } } });
    if (!log) log = await prisma.dailyLog.create({ data: { userId, date: new Date() } });

    // 3. Save to DB
    await prisma.meal.create({
      data: {
        dailyLogId: log.id,
        name,
        calories: Number(calories),
        protein: Number(protein)
      }
    });

    // 4. Update Totals
    const updatedLog = await prisma.dailyLog.update({
      where: { id: log.id },
      data: {
        caloriesConsumed: { increment: Number(calories) },
        proteinConsumed: { increment: Number(protein) }
      },
      include: { meals: true }
    });

    res.json(updatedLog);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: error.message }); 
  }
});

// --- RESTORE SESSION ---
app.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const cycle = await prisma.cycle.findFirst({ where: { userId: id, isActive: true } });
    res.json({ user, cycle });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await getAIResponse(message);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Coach is on a break." });
  }
});
app.listen(3000, () => console.log('Server running on port 3000'));