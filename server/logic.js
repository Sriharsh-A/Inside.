// server/logic.js

export function calculateCalories({ weight, height, age, gender, activityLevel }) {
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === 'male') bmr += 5; else bmr -= 161;
  const multipliers = { sedentary: 1.2, moderate: 1.55, active: 1.725 };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

export function generateCycle(user, duration = 30) {
  // Check the user's preference saved during onboarding
  const isHome = user.workoutPreference === 'home';

  // === GYM ROUTINE (Full 60-Min Volume) ===
  const gymPush = [
    { name: "Bench Press", sets: 3, reps: "8-12" },           // Compound Chest
    { name: "Overhead Press", sets: 3, reps: "8-12" },        // Compound Shoulder
    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12" }, // Upper Chest
    { name: "Pec Deck / Cable Flys", sets: 3, reps: "12-15" }, // Chest Isolation
    { name: "Lateral Raises", sets: 4, reps: "15-20" },       // Side Delts
    { name: "Tricep Pushdowns", sets: 3, reps: "12-15" },     // Tricep Lateral Head
    { name: "Overhead Tricep Ext", sets: 3, reps: "12-15" }   // Tricep Long Head
  ];

  const gymPull = [
    { name: "Deadlifts (or Rack Pulls)", sets: 3, reps: "6-8" }, // Heavy Hinge
    { name: "Lat Pulldowns", sets: 3, reps: "10-12" },        // Vertical Pull
    { name: "Chest-Supported Rows", sets: 3, reps: "10-12" }, // Horizontal Pull
    { name: "Face Pulls", sets: 4, reps: "15-20" },           // Rear Delts/Posture
    { name: "Dumbbell Shrugs", sets: 3, reps: "12-15" },      // Traps
    { name: "Barbell Bicep Curls", sets: 3, reps: "10-12" },  // Bicep Mass
    { name: "Hammer Curls", sets: 3, reps: "12-15" }          // Forearm/Brachialis
  ];

  const gymLegs = [
    { name: "Squats", sets: 3, reps: "6-10" },                // Heavy Compound
    { name: "Romanian Deadlifts", sets: 3, reps: "8-12" },    // Hamstrings (Hinge)
    { name: "Leg Press", sets: 3, reps: "10-15" },            // Volume
    { name: "Leg Extensions", sets: 3, reps: "15-20" },       // Quad Isolation
    { name: "Lying Leg Curls", sets: 3, reps: "12-15" },      // Hamstring Isolation
    { name: "Calf Raises", sets: 4, reps: "15-20" },          // Calves
    { name: "Weighted Planks", sets: 3, reps: "60s" }         // Core
  ];

  // === HOME ROUTINE (High Volume / Metabolic Stress) ===
  const homePush = [
    { name: "Push-ups", sets: 3, reps: "To Failure" },        
    { name: "Pike Push-ups", sets: 3, reps: "10-15" },         
    { name: "Dumbbell Floor Press", sets: 4, reps: "12-15" }, 
    { name: "Lateral Raises (Water Bottles)", sets: 4, reps: "20+" },
    { name: "Chair Dips", sets: 3, reps: "15-20" },           
    { name: "Diamond Push-ups", sets: 3, reps: "To Failure" }, // Tricep Finisher
    { name: "Front Raises (Plate/Bag)", sets: 3, reps: "15-20" } // Front Delt Finisher
  ];

  const homePull = [
    { name: "Pull-ups (or Door Rows)", sets: 3, reps: "To Failure" }, 
    { name: "Dumbbell Rows", sets: 4, reps: "12-15" },        
    { name: "Reverse Flys", sets: 3, reps: "15-20" }, 
    { name: "Superman Holds", sets: 3, reps: "45s" },         // Lower Back
    { name: "Dumbbell Shrugs", sets: 3, reps: "20+" },        // Traps
    { name: "Dumbbell Bicep Curls", sets: 3, reps: "12-15" }, 
    { name: "Hammer Curls", sets: 3, reps: "12-15" }          
  ];

  const homeLegs = [
    { name: "Bodyweight Squats", sets: 4, reps: "30+" },      
    { name: "Walking Lunges", sets: 3, reps: "20 steps" },    
    { name: "Bulgarian Split Squats", sets: 3, reps: "10 each leg" }, 
    { name: "Glute Bridges", sets: 3, reps: "15-20" },        // Glute/Ham
    { name: "Calf Raises (Single Leg)", sets: 4, reps: "15 each" }, 
    { name: "Planks", sets: 3, reps: "60s" },
    { name: "Side Planks", sets: 2, reps: "45s each" }        // Obliques
  ];

  // Select routine based on preference
  const push = isHome ? homePush : gymPush;
  const pull = isHome ? homePull : gymPull;
  const legs = isHome ? homeLegs : gymLegs;
  const rest = []; // Active Recovery

  // 6 Day PPL Split
  const weeklyRoutine = [push, pull, legs, push, pull, legs, rest];
  const schedule = [];

  for (let i = 0; i < duration; i++) {
    schedule.push(weeklyRoutine[i % 7]);
  }

  return JSON.stringify(schedule);
}

export function generateDietPlan(user) {
  const isVegan = user.dietPreference === 'vegan';
  const isVeg = user.dietPreference === 'veg';
  const restrictedDays = (user.restrictedFoodDays || "").split(',');
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isRestrictedDay = !isVeg && !isVegan && restrictedDays.includes(todayName);
  
  // Scaling Logic (Standardizing around 1800kcal base)
  const ratio = user.calorieTarget / 1800; 
  const scale = (val) => Math.round(val * ratio);
  
  let meals = [];

  if (isVeg || isRestrictedDay || isVegan) {
    meals = [
      { type: "Morning (7:30 AM)", item: "Milk/Curd + Soaked Almonds", qty: "1 Glass + 6 Almonds", cal: scale(150), protein: scale(8) },
      { type: "Lunch (12:20 PM)", item: "Rice + Dal/Rajma + Veg Sabzi", qty: "1 Bowl Rice + 1.5 Bowl Dal + Curd", cal: scale(600), protein: scale(20) },
      { type: "Evening (5:30 PM)", item: "Roasted Chana / Paneer", qty: `${scale(50)}g Paneer OR 40g Chana`, cal: scale(200), protein: scale(12) },
      { type: "Dinner (9:30 PM)", item: "Roti + Paneer/Tofu + Dal", qty: `2 Rotis + ${scale(150)}g Paneer + Veg`, cal: scale(600), protein: scale(25) }
    ];
  } else {
    meals = [
      { type: "Morning (7:30 AM)", item: "Boiled Eggs OR Milk", qty: "2 Eggs OR 1 Glass Milk/Curd", cal: scale(150), protein: scale(12) },
      { type: "Lunch (12:20 PM)", item: "Rice + Dal + Chicken/Eggs", qty: `1 Bowl Rice + 1 Bowl Dal + ${scale(150)}g Chicken`, cal: scale(600), protein: scale(35) },
      { type: "Evening (5:30 PM)", item: "Roasted Chana / Fruit", qty: "40g Chana OR Fruit + Black Coffee", cal: scale(180), protein: scale(8) },
      { type: "Dinner (9:30 PM)", item: "Roti/Rice + Chicken/Fish", qty: `2 Rotis + ${scale(200)}g Chicken/Fish`, cal: scale(600), protein: scale(40) }
    ];
  }

  const totalProtein = meals.reduce((a, b) => a + b.protein, 0);

  return { 
    totalCalories: user.calorieTarget, 
    proteinTarget: totalProtein, 
    isRestrictedDay: isRestrictedDay, 
    meals: meals 
  };
}

// 👇 UPDATED DATABASE to include Biryani, Omelette, etc.
const FOOD_DATABASE = {
  "shawarma": [450, 22],   // Avg chicken shawarma wrap
  "mandi": [600, 30],      // Chicken Mandi plate (rice + chicken)
  "alfaham": [350, 28],    // Grilled chicken piece
  "chips": [300, 3],       // Potato chips/fries (1 portion)
  "biryani": [400, 18],    // Chicken Biryani serving
  "fries": [312, 3],
  "egg": [70, 6],
  "eggs": [70, 6],
  "omelette": [150, 10], // Added
  "roti": [100, 3],
  "chapati": [100, 3],
  "rice": [130, 3], 
  "chicken": [220, 25], 
  "biryani": [400, 20], // Added
  "dal": [150, 6], 
  "paneer": [260, 18], 
  "milk": [150, 8], 
  "curd": [100, 4], 
  "dosa": [170, 4],
  "idli": [60, 2],
  "apple": [60, 0],
  "banana": [100, 1],
  "oats": [150, 5],
  "bread": [80, 2], 
  "whey": [120, 24], 
  "coffee": [15, 0],
  "tea": [40, 1] 
};

// 👇 SMART ESTIMATOR FUNCTION
export function estimateNutrition(text) {
  if (!text) return { calories: 0, protein: 0 };

  const lowerText = text.toLowerCase();
  
  // 1. Try to find a quantity (e.g. "2 eggs" -> qty = 2)
  const quantityMatch = lowerText.match(/(\d+)/);
  let qty = quantityMatch ? parseInt(quantityMatch[0]) : 1; 

  // 2. Find the food item
  let calories = 0;
  let protein = 0;
  let found = false;

  for (const [key, val] of Object.entries(FOOD_DATABASE)) {
    if (lowerText.includes(key)) {
      calories = val[0] * qty;
      protein = val[1] * qty;
      found = true;
      break; 
    }
  }

  // 3. Fallback: If we can't find it, give a generic "Average Meal" guess
  // This prevents the "0 kcal" issue for unknown foods
  if (!found) {
    calories = 400; 
    protein = 15;
  }

  return { calories, protein };
}