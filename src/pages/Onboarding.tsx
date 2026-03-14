import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Target, Activity, Ruler, Weight, ChevronRight } from "lucide-react";
import { api } from "../services/api";
import { User as UserType } from "../types";

export default function Onboarding({ user, onComplete }: { user: UserType; onComplete: (user: UserType) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: 25,
    gender: "Male",
    height: 175,
    weight: 70,
    fitness_goal: "General Fitness",
    activity_level: "Intermediate"
  });
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await api.user.updateProfile(formData);
      const updatedUser = await api.user.getProfile();
      onComplete(updatedUser);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full mx-1 transition-all ${
                s <= step ? "bg-emerald-500" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-zinc-500 text-sm uppercase tracking-widest font-bold">
          Step {step} of 3
        </p>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-zinc-900 border border-white/5 p-8 rounded-3xl shadow-2xl"
      >
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Basic Info</h2>
              <p className="text-zinc-500">Tell us a bit about yourself</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none appearance-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Body Stats</h2>
              <p className="text-zinc-500">Your current physical measurements</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-500 mb-2">
                  <Ruler className="w-5 h-5" />
                  <span className="font-bold">Height (cm)</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="250"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
                <div className="text-center text-4xl font-black">{formData.height} cm</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-500 mb-2">
                  <Weight className="w-5 h-5" />
                  <span className="font-bold">Weight (kg)</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
                <div className="text-center text-4xl font-black">{formData.weight} kg</div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Your Goals</h2>
              <p className="text-zinc-500">What do you want to achieve?</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Fitness Goal
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Weight Loss", "Muscle Gain", "General Fitness", "Fat Loss"].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setFormData({ ...formData, fitness_goal: goal })}
                      className={`p-4 rounded-xl border transition-all text-sm font-bold ${
                        formData.fitness_goal === goal
                          ? "bg-emerald-500 border-emerald-500 text-black"
                          : "bg-black border-white/10 text-zinc-400 hover:border-white/20"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Activity Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, activity_level: level })}
                      className={`p-4 rounded-xl border transition-all text-sm font-bold ${
                        formData.activity_level === level
                          ? "bg-emerald-500 border-emerald-500 text-black"
                          : "bg-black border-white/10 text-zinc-400 hover:border-white/20"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-12">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 border border-white/10 py-4 rounded-xl font-bold hover:bg-white/5 transition-all"
            >
              Back
            </button>
          )}
          <button
            onClick={step === 3 ? handleSubmit : nextStep}
            className="flex-2 bg-emerald-500 text-black py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
          >
            {step === 3 ? "Complete Setup" : "Continue"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
