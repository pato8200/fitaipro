import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

export const getClasses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const classes = await prisma.fitnessClass.findMany({
      include: { trainer: true, bookings: true },
    });
    res.json(classes);
  } catch (error) {
    next(error);
  }
};

export const getClassById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const fitnessClass = await prisma.fitnessClass.findUnique({
      where: { id },
      include: { trainer: true, bookings: true },
    });
    res.json(fitnessClass);
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { gymId, trainerId, name, description, category, duration, capacity, startTime, recurrence } = req.body;
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    const fitnessClass = await prisma.fitnessClass.create({
      data: {
        gymId,
        trainerId,
        name,
        description,
        category,
        duration,
        capacity,
        startTime,
        endTime,
        recurrence,
      },
    });
    res.status(201).json(fitnessClass);
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const fitnessClass = await prisma.fitnessClass.update({
      where: { id },
      data: req.body,
    });
    res.json(fitnessClass);
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.fitnessClass.delete({ where: { id } });
    res.json({ message: 'Class deleted' });
  } catch (error) {
    next(error);
  }
};

export const bookClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { classId, memberId } = req.body;
    const booking = await prisma.classBooking.create({
      data: { classId, memberId },
    });
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params as { bookingId: string };
    await prisma.classBooking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    next(error);
  }
};

export const getMemberBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.params as { memberId: string };
    const bookings = await prisma.classBooking.findMany({
      where: { memberId },
      include: { class: true },
    });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};
