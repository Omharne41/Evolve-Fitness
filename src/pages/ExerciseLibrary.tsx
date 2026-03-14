import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Play, 
  X,
  Info,
  ShieldAlert,
  Layers
} from "lucide-react";
import { api } from "../services/api";
import { Exercise } from "../types";

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const muscles = ["Chest", "Back", "Legs", "Shoulders", "Core", "Biceps", "Triceps", "Full Body"];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const data = await api.exercises.getAll({ search, muscle, difficulty });
        setExercises(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchExercises, 300);
    return () => clearTimeout(timer);
  }, [search, muscle, difficulty]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">EXERCISE <span className="text-emerald-500">LIBRARY</span></h1>
          <p className="text-zinc-500">Master your form with our curated database</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:border-emerald-500 outline-none w-full sm:w-64"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={muscle}
              onChange={(e) => setMuscle(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none text-zinc-400 text-sm"
            >
              <option value="">All Muscles</option>
              {muscles.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none text-zinc-400 text-sm"
            >
              <option value="">All Levels</option>
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exercises.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setSelectedExercise(ex)}
              className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-all group"
            >
              <div className="aspect-video bg-black relative overflow-hidden">
                <img 
                  src={ex.animation_url} 
                  alt={ex.name} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    {ex.muscle_group}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-emerald-500 p-3 rounded-full text-black shadow-lg">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-1">{ex.name}</h3>
                <p className="text-zinc-500 text-sm line-clamp-2">{ex.description}</p>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  <span>{ex.difficulty}</span>
                  <span>{ex.sets} Sets × {ex.reps} Reps</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-zinc-900 border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedExercise(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto">
                <div className="bg-black aspect-square md:aspect-auto flex items-center justify-center">
                  <img 
                    src={selectedExercise.animation_url} 
                    alt={selectedExercise.name} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="p-8 space-y-8">
                  <div>
                    <span className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-2 block">
                      {selectedExercise.muscle_group} • {selectedExercise.difficulty}
                    </span>
                    <h2 className="text-4xl font-black tracking-tight mb-4">{selectedExercise.name}</h2>
                    <p className="text-zinc-400 leading-relaxed">{selectedExercise.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                      <div className="text-zinc-500 text-[10px] font-black uppercase mb-1">Target Sets</div>
                      <div className="text-2xl font-black">{selectedExercise.sets}</div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                      <div className="text-zinc-500 text-[10px] font-black uppercase mb-1">Target Reps</div>
                      <div className="text-2xl font-black">{selectedExercise.reps}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2 text-emerald-500">
                      <Info className="w-4 h-4" /> Instructions
                    </h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">{selectedExercise.instructions}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2 text-yellow-500">
                      <ShieldAlert className="w-4 h-4" /> Pro Tips
                    </h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">{selectedExercise.tips}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
