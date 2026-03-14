import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

export const createGym = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, address, city, state, zipCode, phone, email } = req.body;
    
    const gym = await prisma.gym.create({
      data: {
        name,
        description,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        ownerId: req.userId!,
      },
    });

    res.status(201).json(gym);
  } catch (error) {
    next(error);
  }
};

export const getGyms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gyms = await prisma.gym.findMany({
      where: { ownerId: req.userId! },
      include: {
        _count: {
          select: { members: true, classes: true }
        }
      }
    });
    res.json(gyms);
  } catch (error) {
    next(error);
  }
};

export const getGymById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const gym = await prisma.gym.findUnique({
      where: { id },
      include: {
        members: true,
        trainers: true,
        classes: true,
        equipment: true,
      }
    });
    res.json(gym);
  } catch (error) {
    next(error);
  }
};

export const updateGym = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const gym = await prisma.gym.update({
      where: { id },
      data: req.body,
    });
    res.json(gym);
  } catch (error) {
    next(error);
  }
};

export const deleteGym = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.gym.delete({
      where: { id },
    });
    res.json({ message: 'Gym deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getGymMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const members = await prisma.memberProfile.findMany({
      where: { gymId: id },
      include: { user: true, subscription: true },
    });
    res.json(members);
  } catch (error) {
    next(error);
  }
};
