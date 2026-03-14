import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Plus, 
  Scale, 
  CheckCircle2, 
  Flame,
  Calendar,
  ChevronRight
} from "lucide-react";
import { api } from "../services/api";
import { User, ProgressEntry } from "../types";

export default function Progress({ user }: { user: User }) {
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    weight: user.weight || 70,
    workouts_completed: 1,
    calories_burned: 500
  });

  const fetchProgress = async () => {
    try {
      const data = await api.progress.get();
      setProgress(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.progress.add(formData);
      setShowAddModal(false);
      fetchProgress();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">PROGRESS <span className="text-emerald-500">TRACKER</span></h1>
          <p className="text-zinc-500">Visualize your transformation over time</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Log Today's Progress
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weight Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/5 p-8 rounded-3xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Scale className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold">Weight Progress (kg)</h3>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progress}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#ffffff40" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#10b981" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Calories Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-white/5 p-8 rounded-3xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-500/10 p-2 rounded-lg">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold">Calories Burned</h3>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#ffffff40" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Line type="monotone" dataKey="calories_burned" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* History List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Calendar className="w-6 h-6 text-emerald-500" /> Activity History
        </h2>
        
        <div className="space-y-4">
          {progress.slice().reverse().map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/5 p-3 rounded-xl">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{entry.date}</div>
                  <div className="text-lg font-bold">Daily Check-in</div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">Weight</div>
                  <div className="text-xl font-black">{entry.weight} kg</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">Workouts</div>
                  <div className="text-xl font-black">{entry.workouts_completed}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">Burned</div>
                  <div className="text-xl font-black text-orange-500">{entry.calories_burned} kcal</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Progress Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Log Progress</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Workouts Completed Today</label>
                <input
                  type="number"
                  value={formData.workouts_completed}
                  onChange={(e) => setFormData({ ...formData, workouts_completed: parseInt(e.target.value) })}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Calories Burned</label>
                <input
                  type="number"
                  value={formData.calories_burned}
                  onChange={(e) => setFormData({ ...formData, calories_burned: parseInt(e.target.value) })}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all"
              >
                Save Progress
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
