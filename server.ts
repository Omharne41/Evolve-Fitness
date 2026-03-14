import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("fitness.db");
const JWT_SECRET = process.env.JWT_SECRET || "fitness-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    age INTEGER,
    gender TEXT,
    height REAL,
    weight REAL,
    fitness_goal TEXT,
    activity_level TEXT,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    muscle_group TEXT,
    difficulty TEXT,
    sets TEXT,
    reps TEXT,
    animation_url TEXT,
    instructions TEXT,
    tips TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    weight REAL,
    workouts_completed INTEGER,
    calories_burned INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS diet_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal TEXT,
    day TEXT,
    breakfast TEXT,
    lunch TEXT,
    dinner TEXT,
    snacks TEXT,
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fat INTEGER
  );
`);

// Seed Exercises (Sample of 25)
const exerciseCount = db.prepare("SELECT COUNT(*) as count FROM exercises").get() as { count: number };
if (exerciseCount.count === 0) {
  const insertExercise = db.prepare(`
    INSERT INTO exercises (name, description, muscle_group, difficulty, sets, reps, animation_url, instructions, tips, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleExercises = [
    ["Push-ups", "A classic upper body exercise.", "Chest", "Beginner", "3", "12-15", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Keep back straight, lower chest to floor.", "Don't flare elbows.", "Upper Body"],
    ["Bench Press", "Compound chest movement.", "Chest", "Intermediate", "4", "8-10", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Lower bar to mid-chest, push up.", "Keep feet planted.", "Upper Body"],
    ["Pull-ups", "Upper body pulling exercise.", "Back", "Advanced", "3", "8-10", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Pull chin over bar.", "Engage lats.", "Upper Body"],
    ["Shoulder Press", "Vertical push for shoulders.", "Shoulders", "Intermediate", "3", "10-12", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Press weights overhead.", "Don't arch back.", "Upper Body"],
    ["Squats", "King of lower body exercises.", "Legs", "Beginner", "4", "12-15", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Lower hips back and down.", "Keep chest up.", "Lower Body"],
    ["Lunges", "Unilateral leg movement.", "Legs", "Beginner", "3", "12 per leg", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Step forward, lower back knee.", "Keep torso upright.", "Lower Body"],
    ["Leg Press", "Machine based leg push.", "Legs", "Beginner", "3", "15", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Push platform away with legs.", "Don't lock knees.", "Lower Body"],
    ["Deadlift", "Full body power movement.", "Back/Legs", "Advanced", "3", "5-8", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Lift bar from floor to hips.", "Keep back flat.", "Lower Body"],
    ["Plank", "Core stabilization.", "Core", "Beginner", "3", "60s", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Hold push-up position on elbows.", "Keep body in straight line.", "Core"],
    ["Crunches", "Abdominal isolation.", "Core", "Beginner", "3", "20", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Curl shoulders toward hips.", "Don't pull on neck.", "Core"],
    ["Russian Twist", "Oblique focus.", "Core", "Intermediate", "3", "20 per side", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Twist torso side to side.", "Keep feet off ground for challenge.", "Core"],
    ["Running", "Steady state cardio.", "Full Body", "Beginner", "1", "30 mins", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Run at consistent pace.", "Wear proper shoes.", "Cardio"],
    ["Cycling", "Low impact cardio.", "Legs", "Beginner", "1", "45 mins", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Pedal at steady cadence.", "Adjust seat height.", "Cardio"],
    ["Jump Rope", "High intensity cardio.", "Full Body", "Intermediate", "5", "2 mins", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Jump over rope repeatedly.", "Stay on balls of feet.", "Cardio"],
    ["Dips", "Triceps and chest focus.", "Triceps", "Intermediate", "3", "10-12", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Lower body between bars.", "Keep elbows tucked.", "Upper Body"],
    ["Bicep Curls", "Arm isolation.", "Biceps", "Beginner", "3", "12-15", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Curl weights toward shoulders.", "Don't swing body.", "Upper Body"],
    ["Lat Pulldown", "Back width focus.", "Back", "Beginner", "3", "12", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Pull bar to upper chest.", "Squeeze shoulder blades.", "Upper Body"],
    ["Leg Curls", "Hamstring isolation.", "Legs", "Beginner", "3", "15", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Curl legs toward glutes.", "Control the weight back.", "Lower Body"],
    ["Calf Raises", "Calf isolation.", "Legs", "Beginner", "4", "20", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Rise onto balls of feet.", "Full range of motion.", "Lower Body"],
    ["Mountain Climbers", "Dynamic core and cardio.", "Core/Cardio", "Intermediate", "3", "45s", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Drive knees to chest in plank.", "Keep hips low.", "Core"],
    ["Burpees", "Full body explosive.", "Full Body", "Advanced", "3", "15", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Squat, jump back, push-up, jump up.", "Land softly.", "Cardio"],
    ["Face Pulls", "Rear delt and upper back.", "Shoulders", "Intermediate", "3", "15", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Pull rope toward face.", "Pull elbows wide.", "Upper Body"],
    ["Hammer Curls", "Forearm and bicep focus.", "Biceps", "Beginner", "3", "12", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Curl with neutral grip.", "Keep elbows still.", "Upper Body"],
    ["Tricep Extensions", "Tricep isolation.", "Triceps", "Beginner", "3", "12", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlS0mO6v6p6p6p6/giphy.gif", "Extend arms overhead.", "Keep upper arms vertical.", "Upper Body"],
    ["Leg Extensions", "Quad isolation.", "Legs", "Beginner", "3", "15", "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eScgqGsK6Y0/giphy.gif", "Extend legs fully.", "Don't swing weights.", "Lower Body"]
  ];

  sampleExercises.forEach(ex => insertExercise.run(...ex));
}

// Seed Diet Plans
const dietCount = db.prepare("SELECT COUNT(*) as count FROM diet_plans").get() as { count: number };
if (dietCount.count === 0) {
  const insertDiet = db.prepare(`
    INSERT INTO diet_plans (goal, day, breakfast, lunch, dinner, snacks, calories, protein, carbs, fat)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const goals = ["Weight Loss", "Muscle Gain", "General Fitness", "Fat Loss"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  goals.forEach(goal => {
    days.forEach(day => {
      insertDiet.run(
        goal,
        day,
        "Oats with berries and nuts",
        "Grilled chicken/paneer with quinoa and veggies",
        "Baked salmon/tofu with steamed broccoli",
        "Greek yogurt or a handful of almonds",
        goal === "Muscle Gain" ? 2800 : 1800,
        goal === "Muscle Gain" ? 180 : 120,
        goal === "Muscle Gain" ? 350 : 150,
        goal === "Muscle Gain" ? 80 : 60
      );
    });
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Middleware to authenticate JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/signup", (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
      const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
      const role = userCount.count === 0 ? 'admin' : 'user';
      const result = db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run(email, hashedPassword, role);
      const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET);
      res.json({ token, user: { id: result.lastInsertRowid, email, role } });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // User Profile
  app.get("/api/user/profile", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT id, email, name, age, gender, height, weight, fitness_goal, activity_level, role FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  app.put("/api/user/profile", authenticateToken, (req: any, res) => {
    const { name, age, gender, height, weight, fitness_goal, activity_level } = req.body;
    db.prepare(`
      UPDATE users SET name = ?, age = ?, gender = ?, height = ?, weight = ?, fitness_goal = ?, activity_level = ?
      WHERE id = ?
    `).run(name, age, gender, height, weight, fitness_goal, activity_level, req.user.id);
    res.json({ success: true });
  });

  // Exercises
  app.get("/api/exercises", (req, res) => {
    const { muscle, difficulty, search } = req.query;
    let query = "SELECT * FROM exercises WHERE 1=1";
    const params = [];
    if (muscle) { query += " AND muscle_group = ?"; params.push(muscle); }
    if (difficulty) { query += " AND difficulty = ?"; params.push(difficulty); }
    if (search) { query += " AND (name LIKE ? OR description LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    const exercises = db.prepare(query).all(...params);
    res.json(exercises);
  });

  // Plans
  app.get("/api/plans/workout", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT fitness_goal, activity_level FROM users WHERE id = ?").get(req.user.id) as any;
    if (!user.fitness_goal) return res.status(400).json({ error: "Please complete your profile first" });

    // Simple logic to generate plan based on goal
    const workoutPlan = [
      { day: "Monday", focus: "Chest & Triceps", exercises: db.prepare("SELECT * FROM exercises WHERE muscle_group IN ('Chest', 'Triceps') LIMIT 5").all() },
      { day: "Tuesday", focus: "Back & Biceps", exercises: db.prepare("SELECT * FROM exercises WHERE muscle_group IN ('Back', 'Biceps') LIMIT 5").all() },
      { day: "Wednesday", focus: "Cardio", exercises: db.prepare("SELECT * FROM exercises WHERE category = 'Cardio' LIMIT 3").all() },
      { day: "Thursday", focus: "Legs", exercises: db.prepare("SELECT * FROM exercises WHERE muscle_group = 'Legs' LIMIT 5").all() },
      { day: "Friday", focus: "Shoulders & Core", exercises: db.prepare("SELECT * FROM exercises WHERE muscle_group IN ('Shoulders', 'Core') LIMIT 5").all() },
      { day: "Saturday", focus: "Full Body", exercises: db.prepare("SELECT * FROM exercises LIMIT 6").all() },
      { day: "Sunday", focus: "Rest", exercises: [] },
    ];
    res.json(workoutPlan);
  });

  app.get("/api/plans/diet", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT fitness_goal FROM users WHERE id = ?").get(req.user.id) as any;
    if (!user.fitness_goal) return res.status(400).json({ error: "Please complete your profile first" });
    const diet = db.prepare("SELECT * FROM diet_plans WHERE goal = ?").all(user.fitness_goal);
    res.json(diet);
  });

  // Progress
  app.get("/api/progress", authenticateToken, (req: any, res) => {
    const progress = db.prepare("SELECT * FROM progress WHERE user_id = ? ORDER BY date ASC").all(req.user.id);
    res.json(progress);
  });

  app.post("/api/progress", authenticateToken, (req: any, res) => {
    const { weight, workouts_completed, calories_burned } = req.body;
    const date = new Date().toISOString().split('T')[0];
    db.prepare("INSERT INTO progress (user_id, date, weight, workouts_completed, calories_burned) VALUES (?, ?, ?, ?, ?)").run(req.user.id, date, weight, workouts_completed, calories_burned);
    res.json({ success: true });
  });

  // Admin
  app.post("/api/admin/exercises", authenticateToken, (req: any, res) => {
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.user.id) as any;
    if (user.role !== 'admin') return res.sendStatus(403);
    const { name, description, muscle_group, difficulty, sets, reps, animation_url, instructions, tips, category } = req.body;
    db.prepare(`
      INSERT INTO exercises (name, description, muscle_group, difficulty, sets, reps, animation_url, instructions, tips, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, description, muscle_group, difficulty, sets, reps, animation_url, instructions, tips, category);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
