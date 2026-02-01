// server/logic.js

// 1. CALORIE CALCULATOR (Mifflin-St Jeor)
export const calculateCalories = (user) => {
  let bmr;
  // Formula: (10 x weight in kg) + (6.25 x height in cm) - (5 x age in years) + s
  if (user.gender === 'male') {
    bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + 5;
  } else {
    bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 161;
  }

  // Activity Multipliers
  const multipliers = {
    sedentary: 1.2,
    moderate: 1.55,
    active: 1.725
  };
  
  const tdee = Math.round(bmr * (multipliers[user.activityLevel] || 1.2));
  
  // Goal Adjustment (Assume "Recomp/Maintenance" for now, or -500 for cut)
  return tdee; 
};

// 2. WORKOUT DATABASE (6-Day Split)
const PPL_EXERCISES = {
  PUSH: [
    { name: "Bench Press / Push Ups", sets: 3, reps: "8-12" },
    { name: "Overhead Press", sets: 3, reps: "10" },
    { name: "Incline Dumbbell Press", sets: 3, reps: "12" },
    { name: "Lateral Raises", sets: 3, reps: "15" },
    { name: "Tricep Pushdowns", sets: 3, reps: "15" }
  ],
  PULL: [
    { name: "Pull Ups / Lat Pulldown", sets: 3, reps: "8-12" },
    { name: "Barbell Rows", sets: 3, reps: "10" },
    { name: "Face Pulls", sets: 3, reps: "15" },
    { name: "Hammer Curls", sets: 3, reps: "12" },
    { name: "Bicep Curls", sets: 3, reps: "12" }
  ],
  LEGS: [
    { name: "Squats", sets: 3, reps: "6-8" },
    { name: "Romanian Deadlifts", sets: 3, reps: "10" },
    { name: "Lunges", sets: 3, reps: "12/leg" },
    { name: "Calf Raises", sets: 4, reps: "15" },
    { name: "Plank", sets: 3, time: "60s" }
  ]
};

export const generateCycle = (user) => {
  const days = 28; // 4 weeks
  let schedule = {};

  for (let i = 0; i < days; i++) {
    const dayOfWeek = (i % 7) + 1; // 1=Mon, 7=Sun
    let routine = [];

    // 6-Day Logic: PPL PPL Rest
    if (dayOfWeek === 1 || dayOfWeek === 4) routine = PPL_EXERCISES.PUSH;
    else if (dayOfWeek === 2 || dayOfWeek === 5) routine = PPL_EXERCISES.PULL;
    else if (dayOfWeek === 3 || dayOfWeek === 6) routine = PPL_EXERCISES.LEGS;
    else routine = [{ name: "Active Rest (Walk 10k steps)", sets: 0, reps: 0 }];

    // Week 4 Deload (Reduce Sets)
    if (i >= 21) {
      routine = routine.map(ex => ({ ...ex, sets: Math.max(1, ex.sets - 1) }));
    }

    schedule[i] = routine;
  }
  
  return JSON.stringify(schedule);
};