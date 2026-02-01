import React, { useState } from 'react';
import { ArrowLeft, Parentheses, ChevronRight } from 'lucide-react'; // Added ArrowLeft

export default function Onboarding({ onComplete, onBack }) { // Added onBack prop
  const [formData, setFormData] = useState({
    name: '', height: '', weight: '', age: '',
    gender: 'male', activityLevel: 'moderate', dietPreference: 'non-veg'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          height: Number(formData.height),
          weight: Number(formData.weight),
          age: Number(formData.age)
        }),
      });
      const data = await response.json();
      if (data.user) onComplete(data.user, data.cycle);
    } catch (error) { alert("Server error"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6 transition-colors duration-300 relative">
      
      {/* --- NEW BACK BUTTON --- */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full max-w-lg mt-12"> {/* Added margin-top to clear button */}
        <div className="mb-10">
          <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black transition-colors shadow-lg shadow-gray-200 dark:shadow-none">
            <Parentheses size={24} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3 mt-6">Setup Profile.</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">We calculate your biometrics to build a custom Progressive Overload cycle.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Your Name</label>
            <input required type="text" placeholder="e.g. Alex" 
              className="w-full p-4 bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
              onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Height (cm)</label>
              <input required type="number" placeholder="180" 
                className="w-full p-4 bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                onChange={e => setFormData({...formData, height: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Weight (kg)</label>
              <input required type="number" placeholder="75" 
                className="w-full p-4 bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                onChange={e => setFormData({...formData, weight: e.target.value})} />
            </div>
             <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Age</label>
              <input required type="number" placeholder="25" 
                className="w-full p-4 bg-gray-50 dark:bg-zinc-900 border-0 rounded-2xl text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Activity Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['sedentary', 'moderate', 'active'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({...formData, activityLevel: level})}
                  className={`p-3 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${
                    formData.activityLevel === level 
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
                    : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-zinc-900 dark:text-gray-400 dark:hover:bg-zinc-800'
                  }`}
                >
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