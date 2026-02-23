import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

// XP rewards for different actions
const XP_REWARDS = {
  QUESTION_CORRECT: 10,
  QUESTION_WRONG: 2,
  QUIZ_COMPLETE: 50,
  PERFECT_QUIZ: 100,
  DAILY_STREAK: 25,
  GAME_COMPLETE: 30,
  ACHIEVEMENT_UNLOCK: 100,
};

// Level thresholds (XP required for each level)
const getLevelFromXP = (xp: number): number => {
  // Simple formula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// Get progress for a user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) {
      // Return default progress if not found
      return {
        userId: args.userId,
        xp: 0,
        level: 1,
        streakDays: 0,
        gamesCompleted: 0,
        quizzesCompleted: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        achievements: [],
      };
    }

    return progress;
  },
});

// Initialize progress for a new user
export const initializeForUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if already exists
    const existing = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("student_progress", {
      userId: args.userId,
      xp: 0,
      level: 1,
      streakDays: 0,
      gamesCompleted: 0,
      quizzesCompleted: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      achievements: [],
      updatedAt: Date.now(),
    });
  },
});

// Record a quiz attempt and update progress
export const recordQuizAttempt = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    assignmentId: v.optional(v.id("assignments")),
    classId: v.optional(v.id("classes")),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    missedQuestionIds: v.array(v.id("questions")),
    answers: v.optional(v.array(v.object({
      questionId: v.id("questions"),
      selectedIndex: v.number(),
      isCorrect: v.boolean(),
      timeSpent: v.optional(v.number()),
    }))),
    gameMode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Record the attempt
    const attemptId = await ctx.db.insert("quiz_attempts", {
      userId: args.userId,
      courseId: args.courseId,
      assignmentId: args.assignmentId,
      classId: args.classId,
      score: args.score,
      totalQuestions: args.totalQuestions,
      correctAnswers: args.correctAnswers,
      missedQuestionIds: args.missedQuestionIds,
      answers: args.answers,
      gameMode: args.gameMode,
      completedAt: Date.now(),
    });

    // Update student progress
    let progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const isPerfect = args.correctAnswers === args.totalQuestions;
    const xpEarned =
      args.correctAnswers * XP_REWARDS.QUESTION_CORRECT +
      (args.totalQuestions - args.correctAnswers) * XP_REWARDS.QUESTION_WRONG +
      XP_REWARDS.QUIZ_COMPLETE +
      (isPerfect ? XP_REWARDS.PERFECT_QUIZ : 0);

    if (progress) {
      const newXP = progress.xp + xpEarned;
      const newLevel = getLevelFromXP(newXP);

      await ctx.db.patch(progress._id, {
        xp: newXP,
        level: newLevel,
        quizzesCompleted: progress.quizzesCompleted + 1,
        totalQuestionsAnswered: progress.totalQuestionsAnswered + args.totalQuestions,
        totalCorrectAnswers: progress.totalCorrectAnswers + args.correctAnswers,
        updatedAt: Date.now(),
      });
    } else {
      // Create new progress record
      const newXP = xpEarned;
      const newLevel = getLevelFromXP(newXP);

      await ctx.db.insert("student_progress", {
        userId: args.userId,
        xp: newXP,
        level: newLevel,
        streakDays: 1,
        gamesCompleted: 0,
        quizzesCompleted: 1,
        totalQuestionsAnswered: args.totalQuestions,
        totalCorrectAnswers: args.correctAnswers,
        achievements: [],
        lastActivityDate: new Date().toISOString().split("T")[0],
        updatedAt: Date.now(),
      });
    }

    return { attemptId, xpEarned };
  },
});

// Record a game completion
export const recordGameComplete = mutation({
  args: {
    userId: v.id("users"),
    gameMode: v.string(),
    score: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const xpEarned = XP_REWARDS.GAME_COMPLETE;

    if (progress) {
      const newXP = progress.xp + xpEarned;
      const newLevel = getLevelFromXP(newXP);

      await ctx.db.patch(progress._id, {
        xp: newXP,
        level: newLevel,
        gamesCompleted: progress.gamesCompleted + 1,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("student_progress", {
        userId: args.userId,
        xp: xpEarned,
        level: 1,
        streakDays: 1,
        gamesCompleted: 1,
        quizzesCompleted: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        achievements: [],
        lastActivityDate: new Date().toISOString().split("T")[0],
        updatedAt: Date.now(),
      });
    }

    return { xpEarned };
  },
});

// Update daily streak
export const updateStreak = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];

    let progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) {
      // Create new progress with streak of 1
      return await ctx.db.insert("student_progress", {
        userId: args.userId,
        xp: XP_REWARDS.DAILY_STREAK,
        level: 1,
        streakDays: 1,
        gamesCompleted: 0,
        quizzesCompleted: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        achievements: [],
        lastActivityDate: today,
        updatedAt: Date.now(),
      });
    }

    // Check if streak should continue or reset
    if (progress.lastActivityDate === today) {
      // Already logged activity today
      return progress._id;
    }

    const lastDate = progress.lastActivityDate
      ? new Date(progress.lastActivityDate)
      : null;
    const todayDate = new Date(today);

    let newStreakDays = 1;
    let xpBonus = 0;

    if (lastDate) {
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increase streak
        newStreakDays = progress.streakDays + 1;
        xpBonus = XP_REWARDS.DAILY_STREAK;
      }
      // If diffDays > 1, streak resets to 1
    }

    const newXP = progress.xp + xpBonus;
    const newLevel = getLevelFromXP(newXP);

    await ctx.db.patch(progress._id, {
      xp: newXP,
      level: newLevel,
      streakDays: newStreakDays,
      lastActivityDate: today,
      updatedAt: Date.now(),
    });

    return progress._id;
  },
});

// Add XP manually (for achievements, bonuses, etc.)
export const addXP = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (progress) {
      const newXP = progress.xp + args.amount;
      const newLevel = getLevelFromXP(newXP);

      await ctx.db.patch(progress._id, {
        xp: newXP,
        level: newLevel,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("student_progress", {
        userId: args.userId,
        xp: args.amount,
        level: getLevelFromXP(args.amount),
        streakDays: 0,
        gamesCompleted: 0,
        quizzesCompleted: 0,
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        achievements: [],
        updatedAt: Date.now(),
      });
    }

    return { newTotal: (progress?.xp || 0) + args.amount };
  },
});

// Get quiz history for a user
export const getQuizHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("quiz_attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 20);

    // Enrich with course info
    const enriched = await Promise.all(
      attempts.map(async (attempt) => {
        const course = await ctx.db.get(attempt.courseId);
        return {
          ...attempt,
          courseName: course?.name || "Unknown Course",
          percentage: Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100),
        };
      })
    );

    return enriched;
  },
});

// Get leaderboard for a class
export const getClassLeaderboard = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    const classDoc = await ctx.db.get(args.classId);
    if (!classDoc) return [];

    const leaderboard = [];
    for (const studentId of classDoc.studentIds) {
      // Note: studentIds are stored as strings, but we need user IDs
      // This is a data model issue - for now we'll handle it
      const user = await ctx.db.query("users").collect().then(users => 
        users.find(u => u._id === studentId)
      );

      if (user) {
        const progress = await ctx.db
          .query("student_progress")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();

        leaderboard.push({
          userId: user._id,
          name: user.name,
          xp: progress?.xp || 0,
          level: progress?.level || 1,
          quizzesCompleted: progress?.quizzesCompleted || 0,
        });
      }
    }

    return leaderboard.sort((a, b) => b.xp - a.xp);
  },
});

// Get accuracy stats for a user by course
export const getAccuracyByCourse = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("quiz_attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Group by course
    const byCourse: Record<string, { total: number; correct: number; courseName: string }> = {};

    for (const attempt of attempts) {
      const courseId = attempt.courseId as string;
      if (!byCourse[courseId]) {
        const course = await ctx.db.get(attempt.courseId);
        byCourse[courseId] = {
          total: 0,
          correct: 0,
          courseName: course?.name || "Unknown",
        };
      }
      byCourse[courseId].total += attempt.totalQuestions;
      byCourse[courseId].correct += attempt.correctAnswers;
    }

    return Object.entries(byCourse).map(([courseId, data]) => ({
      courseId,
      courseName: data.courseName,
      totalQuestions: data.total,
      correctAnswers: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));
  },
});
