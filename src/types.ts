export interface User {
  id: number;
  email: string;
  name?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  fitness_goal?: string;
  activity_level?: string;
  role?: string;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  muscle_group: string;
  difficulty: string;
  sets: string;
  reps: string;
  animation_url: string;
  instructions: string;
  tips: string;
  category: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface DietDay {
  id: number;
  goal: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ProgressEntry {
  id: number;
  date: string;
  weight: number;
  workouts_completed: number;
  calories_burned: number;
}
