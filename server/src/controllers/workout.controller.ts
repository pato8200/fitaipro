import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

export const getWorkouts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const workouts = await prisma.workoutLog.findMany({
      where: { userId: req.userId! },
      include: { exercises: true },
      orderBy: { completedAt: 'desc' },
    });
    res.json(workouts);
  } catch (error) {
    next(error);
  }
};

export const getWorkoutById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const workout = await prisma.workoutLog.findUnique({
      where: { id },
      include: { exercises: true },
    });
    res.json(workout);
  } catch (error) {
    next(error);
  }
};

export const createWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, type, duration, exercises } = req.body;
    const workout = await prisma.workoutLog.create({
      data: {
        userId: req.userId!,
        name,
        type,
        duration,
        exercises: {
          create: exercises.map((ex: any, index: number) => ({
            ...ex,
            order: index,
          })),
        },
      },
      include: { exercises: true },
    });
    res.status(201).json(workout);
  } catch (error) {
    next(error);
  }
};

export const logWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { workoutId, rating, calories, notes } = req.body;
    const workout = await prisma.workoutLog.update({
      where: { id: workoutId },
      data: { rating, calories, notes, completedAt: new Date() },
    });
    res.json(workout);
  } catch (error) {
    next(error);
  }
};

export const getWorkoutStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalWorkouts = await prisma.workoutLog.count({
      where: { userId: req.userId! },
    });
    const totalCalories = await prisma.workoutLog.aggregate({
      where: { userId: req.userId! },
      _sum: { calories: true },
    });
    res.json({ totalWorkouts, totalCalories: totalCalories._sum.calories || 0 });
  } catch (error) {
    next(error);
  }
};
