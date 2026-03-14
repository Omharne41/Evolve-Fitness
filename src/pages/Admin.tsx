import React, { useState } from "react";
import { motion } from "motion/react";
import { Plus, Save, AlertCircle } from "lucide-react";
import { api } from "../services/api";

export default function Admin() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    muscle_group: "Chest",
    difficulty: "Beginner",
    sets: "3",
    reps: "12",
    animation_url: "",
    instructions: "",
    tips: "",
    category: "Upper Body"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Note: In a real app, we'd check if the user is actually an admin on the backend
      // The backend route /api/admin/exercises already has a role check.
      const res = await fetch("/api/admin/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          description: "",
          muscle_group: "Chest",
          difficulty: "Beginner",
          sets: "3",
          reps: "12",
          animation_url: "",
          instructions: "",
          tips: "",
          category: "Upper Body"
        });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight">ADMIN <span className="text-emerald-500">PANEL</span></h1>
        <p className="text-zinc-500">Add new exercises to the library</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-white/5 p-8 rounded-3xl shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Exercise Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
              placeholder="e.g. Diamond Push-ups"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Muscle Group</label>
            <select
              value={formData.muscle_group}
              onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
            >
              {["Chest", "Back", "Legs", "Shoulders", "Core", "Biceps", "Triceps", "Full Body"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-zinc-400">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none h-24"
              placeholder="Brief overview of the exercise..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
            >
              {["Beginner", "Intermediate", "Advanced"].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
            >
              {["Upper Body", "Lower Body", "Core", "Cardio"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Default Sets</label>
            <input
              type="text"
              value={formData.sets}
              onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Default Reps</label>
            <input
              type="text"
              value={formData.reps}
              onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-zinc-400">Animation URL (GIF/MP4)</label>
            <input
              type="url"
              required
              value={formData.animation_url}
              onChange={(e) => setFormData({ ...formData, animation_url: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none"
              placeholder="https://example.com/exercise.gif"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-zinc-400">Step-by-Step Instructions</label>
            <textarea
              required
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none h-32"
              placeholder="1. Start in position... 2. Lower your body..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-zinc-400">Safety Tips</label>
            <textarea
              required
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 focus:border-emerald-500 outline-none h-24"
              placeholder="Keep your core engaged..."
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Saving..." : <><Save className="w-5 h-5" /> Save Exercise</>}
            </button>
            {success && (
              <p className="text-emerald-500 text-center mt-4 font-bold">Exercise added successfully!</p>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
