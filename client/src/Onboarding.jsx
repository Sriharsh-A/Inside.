import React, { useState } from 'react';
import { ArrowLeft, Parentheses, ChevronRight, Home, Dumbbell } from 'lucide-react'; 

export default function Onboarding({ onComplete, onBack }) {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', 
    height: '', weight: '', age: '',
    gender: 'male', // Default
    activityLevel: 'moderate', dietPreference: 'non-veg',
    workoutPreference: 'gym',
    duration: 30,
    restrictedDays: []
  });
  const [loading, setLoading] = useState(false);

  const toggleDay = (day) => {
    setFormData(prev => {
      const days = prev.restrictedDays.includes(day)
        ? prev.restrictedDays.filter(d => d !== day)
        : [...prev.restrictedDays, day];
      return { ...prev, restrictedDays: days };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const restrictedFoodDays = formData.restrictedDays.join(',');

    try {
      const response = await fetch('http://localhost:3000/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          height: Number(formData.height),
          weight: Number(formData.weight),
          age: Number(formData.age),
          restrictedFoodDays
        }),
      });
      
      const data = await response.json();
      if (data.error) { alert(data.error); } 
      else if (data.user) { onComplete(data.user, data.cycle); }
    } catch (error) { console.error(error); alert("Connection failed."); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6 transition-colors duration-300 relative">
      <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
        <ArrowLeft size={24} />
      </button>

      <div className="w-full max-w-lg mt-12 pb-12">
        <div className="mb-10">
          <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black shadow-lg shadow-gray-200 dark:shadow-none">
            <Parentheses size={24} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3 mt-6">Setup Profile.</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">We calculate your biometrics to build a custom Progressive Overload cycle.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFO */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email</label>
            <input required type="email" placeholder="you@example.com" className="w-full p-4 bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-accent transition-all"
              onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Password</label>
             <input required type="password" placeholder="••••••••" className="w-full p-4 bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-accent transition-all"
               onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Your Name</label>
            <input required type="text" placeholder="e.g. Alex" className="w-full p-4 bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          {/* GENDER SELECTION (NEW) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {['male', 'female'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({...formData, gender: g})}
                  className={`p-3 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${
                    formData.gender === g
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-zinc-900 dark:text-gray-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* METRICS */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Height (cm)</label>
              <input required type="number" placeholder="180" className="w-full p-4 bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                onChange={e => setFormData({...formData, height: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Weight (kg)</label>
              <input required type="number" placeholder="75" className="w-full p-4 bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                onChange={e => setFormData({...formData, weight: e.target.value})} />
            </div>
             <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Age</label>
              <input required type="number" placeholder="25" className="w-full p-4 bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
          </div>

          {/* WORKOUT SETTING */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Workout Setting</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Gym', val: 'gym', icon: Dumbbell }, 
                { label: 'Home', val: 'home', icon: Home }, 
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setFormData({...formData, workoutPreference: opt.val})}
                  className={`p-4 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-3 ${
                    formData.workoutPreference === opt.val
                    ? 'border-accent text-accent bg-accent/5' 
                    : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-zinc-900 dark:text-gray-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  <opt.icon size={18} />
                  <span>{opt.label} Workout</span>
                </button>
              ))}
            </div>
          </div>

          {/* DURATION SELECTOR */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Goal Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1 Month', val: 30 }, 
                { label: '3 Months', val: 90 }, 
                { label: '6 Months', val: 180 }
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setFormData({...formData, duration: opt.val})}
                  className={`p-3 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center ${
                    formData.duration === opt.val
                    ? 'border-accent text-accent bg-accent/5' 
                    : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-zinc-900 dark:text-gray-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[10px] opacity-60 font-normal">{opt.val} Days</span>
                </button>
              ))}
            </div>
          </div>

          {/* DIET PREFERENCE */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Diet Preference</label>
            <div className="grid grid-cols-3 gap-2">
              {['veg', 'non-veg', 'vegan'].map((diet) => (
                <button key={diet} type="button" onClick={() => setFormData({...formData, dietPreference: diet})}
                  className={`p-3 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${
                    formData.dietPreference === diet 
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
                    : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-zinc-900 dark:text-gray-400 dark:hover:bg-zinc-800'
                  }`}>
                  {diet === 'non-veg' ? 'Non-Veg' : diet.charAt(0).toUpperCase() + diet.slice(1)}
                </button>
              ))}
            </div>
            {formData.dietPreference === 'non-veg' && (
              <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3">I eat Veg only on these days:</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        formData.restrictedDays.includes(day)
                        ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                        : 'bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-zinc-500 hover:border-gray-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Activity Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['sedentary', 'moderate', 'active'].map((level) => (
                <button key={level} type="button" onClick={() => setFormData({...formData, activityLevel: level})}
                  className={`p-3 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${
                    formData.activityLevel === level 
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
                    : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-zinc-900 dark:text-gray-400 dark:hover:bg-zinc-800'
                  }`}>
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-black dark:bg-white text-white dark:text-black p-5 rounded-2xl font-bold text-lg flex justify-between items-center group hover:opacity-90 transition-all shadow-xl shadow-gray-200 dark:shadow-none">
            <span>{loading ? "Generating..." : "Generate Cycle"}</span> 
            <ChevronRight className={`transition-transform ${loading ? '' : 'group-hover:translate-x-1'}`} />
          </button>
        </form>
      </div>
    </div>
  );
}