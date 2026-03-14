import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Activity, 
  Target, 
  Flame, 
  Utensils, 
  ChevronRight, 
  Calendar,
  CheckCircle2,
  Clock,
  Info
} from "lucide-react";
import { api } from "../services/api";
import { User, WorkoutDay, DietDay } from "../types";

export default function Dashboard({ user }: { user: User }) {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);
  const [dietPlan, setDietPlan] = useState<DietDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workouts, diets] = await Promise.all([
          api.plans.getWorkout(),
          api.plans.getDiet()
        ]);
        setWorkoutPlan(workouts);
        setDietPlan(diets);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateBMI = () => {
    if (!user.height || !user.weight) return 0;
    const heightInMeters = user.height / 100;
    return (user.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
    if (bmi < 25) return { label: "Normal", color: "text-emerald-400" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-400" };
    return { label: "Obese", color: "text-red-400" };
  };

  const bmi = parseFloat(calculateBMI() as string);
  const bmiInfo = getBMICategory(bmi);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/5 p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">BMI Score</span>
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black">{bmi}</span>
            <span className={`text-sm font-bold ${bmiInfo.color}`}>{bmiInfo.label}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-white/5 p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Target Goal</span>
            <Target className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black">{user.fitness_goal}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-white/5 p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Daily Calories</span>
            <Flame className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black">{dietPlan[0]?.calories || 2000} kcal</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-white/5 p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Activity Level</span>
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black">{user.activity_level}</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Workout Plan */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Calendar className="w-6 h-6 text-emerald-500" /> Weekly Workout Plan
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workoutPlan.map((day, i) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900/50 border border-white/5 p-5 rounded-2xl hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">{day.day}</span>
                    <h3 className="text-lg font-bold">{day.focus}</h3>
                  </div>
                  {day.exercises.length > 0 && (
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                      {day.exercises.length} Exercises
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {day.exercises.length > 0 ? (
                    day.exercises.slice(0, 3).map((ex) => (
                      <div key={ex.id} className="flex items-center gap-2 text-sm text-zinc-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
                        {ex.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-zinc-600 italic">Rest and recover</div>
                  )}
                  {day.exercises.length > 3 && (
                    <div className="text-[10px] text-zinc-500 font-bold uppercase pt-1">
                      + {day.exercises.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Daily Diet Plan */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Utensils className="w-6 h-6 text-emerald-500" /> Today's Diet Plan
          </h2>
          
          <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 bg-emerald-500 text-black">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-black uppercase tracking-widest opacity-70">Nutrition Target</span>
                <Info className="w-4 h-4 opacity-70" />
              </div>
              <div className="text-3xl font-black">{dietPlan[0]?.calories || 2000} kcal</div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-[10px] font-black uppercase tracking-tighter">
                <div>P: {dietPlan[0]?.protein}g</div>
                <div>C: {dietPlan[0]?.carbs}g</div>
                <div>F: {dietPlan[0]?.fat}g</div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {[
                { label: "Breakfast", meal: dietPlan[0]?.breakfast, time: "08:00 AM" },
                { label: "Lunch", meal: dietPlan[0]?.lunch, time: "01:30 PM" },
                { label: "Snack", meal: dietPlan[0]?.snacks, time: "04:30 PM" },
                { label: "Dinner", meal: dietPlan[0]?.dinner, time: "08:00 PM" }
              ].map((item, i) => (
                <div key={i} className="relative pl-6 border-l border-white/10">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-[10px] text-zinc-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-200">{item.meal || "Balanced Meal"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
