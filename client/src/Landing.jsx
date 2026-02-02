import React, { useState } from 'react';
import { ArrowRight, Activity, Shield, Zap, Moon, Sun, LayoutGrid, X, Parentheses } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function Landing({ onStart, onLogin }) { // Added onLogin prop
  const { theme, toggleTheme } = useTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        onLogin(data.user, data.cycle); // Pass data back to App
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-accent selection:text-white relative">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-black/90 backdrop-blur-xl z-50 px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center text-white dark:text-black">
            <Parentheses size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">Inside.</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="hover:text-accent transition-colors text-zinc-500">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {/* FUNCTIONAL SIGN IN BUTTON */}
          <button 
            onClick={() => setShowLogin(true)}
            className="text-sm font-bold text-zinc-500 hover:text-accent transition-colors uppercase tracking-wider text-xs"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 pb-16 px-6 max-w-4xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 leading-[0.9]">
          The Work<br />
          Starts <span className="text-gray-700 dark:text-zinc-600">Inside</span><span className="text-accent">.</span>
        </h1>

        <p className="text-lg text-zinc-500 max-w-md mb-12 leading-relaxed font-medium">
          Automated progressive overload. Intelligent calorie tracking. 
          A minimalist system for the disciplined.
        </p>

        <button 
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg font-bold transition-all border-2 border-accent text-accent bg-white dark:bg-black hover:bg-accent hover:text-white hover:scale-105 hover:shadow-[0_0_40px_rgba(239,6,6,0.6)]"
        >
          BEGIN JOURNEY
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 w-full text-left">
          {[
            { icon: Zap, title: "ENERGY", text: "Calorie targets calculated by AI." },
            { icon: Activity, title: "REGULATION", text: "Workouts that adapt automatically." },
            { icon: Shield, title: "ZERO FRICTION", text: "No ads. No feed. Just data." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-none border-l-2 border-zinc-100 dark:border-zinc-900 hover:border-accent hover:dark:border-accent transition-colors">
              <feature.icon size={24} className="mb-4 text-zinc-400 dark:text-zinc-600" />
              <h3 className="text-sm font-bold mb-2 text-black dark:text-white uppercase tracking-wider">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-12 text-center text-zinc-600 text-dark:accent text-xs uppercase tracking-widest">
        © 2026 Inside. Built for you.
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl w-full max-w-md border border-gray-100 dark:border-zinc-800 shadow-2xl relative">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6">Welcome back.</h2>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email</label>
                <input 
                  type="email" required
                  className="w-full p-4 mt-1 bg-gray-50 dark:bg-zinc-900 border-0 rounded-xl text-black dark:text-white font-semibold focus:ring-2 focus:ring-accent outline-none"
                  onChange={e => setLoginData({...loginData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
                <input 
                  type="password" required
                  className="w-full p-4 mt-1 bg-gray-50 dark:bg-zinc-900 border-0 rounded-xl text-black dark:text-white font-semibold focus:ring-2 focus:ring-accent outline-none"
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                />
              </div>

              {error && <p className="text-accent text-sm font-bold">{error}</p>}

              <button 
                type="submit" disabled={loading}
                className="w-full py-4 mt-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:bg-accent dark:hover:bg-accent hover:text-white transition-colors"
              >
                {loading ? 'Verifying...' : 'Enter System'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}