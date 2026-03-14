import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Dumbbell, 
  LayoutDashboard, 
  Library, 
  TrendingUp, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Activity,
  Target,
  Flame,
  Utensils,
  ShieldAlert
} from "lucide-react";
import { api } from "./services/api";
import { User } from "./types";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import Progress from "./pages/Progress";
import Admin from "./pages/Admin";

const Navbar = ({ user, onLogout }: { user: User | null; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-zinc-950 border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-500 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <Dumbbell className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">FIT<span className="text-emerald-500">GUIDE</span></span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-8">
              <Link to="/dashboard" className="text-zinc-400 hover:text-emerald-500 transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link to="/exercises" className="text-zinc-400 hover:text-emerald-500 transition-colors flex items-center gap-2">
                <Library className="w-4 h-4" /> Exercises
              </Link>
              <Link to="/progress" className="text-zinc-400 hover:text-emerald-500 transition-colors flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Progress
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-zinc-400 hover:text-emerald-500 transition-colors flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Admin
                </Link>
              )}
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <span className="text-sm text-zinc-500">Hi, {user.name || 'Athlete'}</span>
                <button onClick={onLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-zinc-400 hover:text-white transition-colors">Login</Link>
              <Link to="/signup" className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg font-semibold transition-all">Get Started</Link>
            </div>
          )}

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-zinc-400">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-900 border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-zinc-400 hover:text-emerald-500">Dashboard</Link>
                  <Link to="/exercises" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-zinc-400 hover:text-emerald-500">Exercises</Link>
                  <Link to="/progress" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-zinc-400 hover:text-emerald-500">Progress</Link>
                  <button onClick={() => { onLogout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 text-red-500">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-zinc-400">Login</Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-emerald-500 font-semibold">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const PrivateRoute = ({ children, user }: { children: React.ReactNode; user: User | null }) => {
  if (!user) return <Navigate to="/login" />;
  if (!user.name) return <Navigate to="/onboarding" />;
  return <>{children}</>;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.user.getProfile()
        .then(setUser)
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500/30">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                    EVOLVE YOUR <br />
                    <span className="text-emerald-500">FITNESS JOURNEY</span>
                  </h1>
                  <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
                    Personalized workout plans, expert diet guides, and real-time progress tracking. 
                    Built for those who demand more from their training.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link to="/signup" className="bg-emerald-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-400 transition-all flex items-center gap-2">
                    Start Your Transformation <ChevronRight className="w-5 h-5" />
                  </Link>
                  <Link to="/exercises" className="bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                    Explore Exercises
                  </Link>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-24">
                  {[
                    { icon: Activity, title: "Custom Workouts", desc: "AI-powered plans tailored to your goals and level." },
                    { icon: Utensils, title: "Nutrition Guides", desc: "7-day meal plans optimized for your transformation." },
                    { icon: TrendingUp, title: "Smart Tracking", desc: "Visualize your progress with detailed analytics." }
                  ].map((feature, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-white/5 p-8 rounded-2xl text-left hover:border-emerald-500/30 transition-colors">
                      <feature.icon className="w-10 h-10 text-emerald-500 mb-4" />
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-zinc-500">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            } />
            
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/signup" element={<Signup onLogin={setUser} />} />
            
            <Route path="/onboarding" element={
              user ? <Onboarding user={user} onComplete={setUser} /> : <Navigate to="/login" />
            } />
            
            <Route path="/dashboard" element={
              <PrivateRoute user={user}>
                <Dashboard user={user!} />
              </PrivateRoute>
            } />
            
            <Route path="/exercises" element={<ExerciseLibrary />} />
            
            <Route path="/progress" element={
              <PrivateRoute user={user}>
                <Progress user={user!} />
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <PrivateRoute user={user}>
                <Admin />
              </PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
