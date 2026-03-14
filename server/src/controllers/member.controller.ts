import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { gymId } = req.query as { gymId?: string };
    
    if (!gymId) {
      return res.status(400).json({ error: 'Gym ID required' });
    }
    
    // Verify user has access to this gym
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { role: true, gymId: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check permission - only gym owners, staff, or admins can view members
    if (user.role !== 'ADMIN' && user.gymId !== gymId) {
      const gym = await prisma.gym.findFirst({
        where: { 
          id: gymId,
          OR: [
            { ownerId: req.userId! },
            { staff: { some: { userId: req.userId! } } }
          ]
        }
      });
      
      if (!gym) {
        return res.status(403).json({ error: 'Access denied - You do not have permission to view these members' });
      }
    }
    
    const members = await prisma.memberProfile.findMany({
      where: { gymId },
      include: { 
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        subscription: {
          include: {
            plan: true
          }
        },
        attendance: {
          orderBy: { checkIn: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(members);
  } catch (error) {
    next(error);
  }
};

export const getMemberById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const member = await prisma.memberProfile.findUnique({
      where: { id },
      include: { user: true, attendance: true, workouts: true },
    });
    res.json(member);
  } catch (error) {
    next(error);
  }
};

export const createMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, gymId, membershipTier, fitnessGoals } = req.body;
    const member = await prisma.memberProfile.create({
      data: { userId, gymId, membershipTier, fitnessGoals },
    });
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const member = await prisma.memberProfile.update({
      where: { id },
      data: req.body,
    });
    res.json(member);
  } catch (error) {
    next(error);
  }
};

export const deleteMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.memberProfile.delete({ where: { id } });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    next(error);
  }
};

export const trackAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId, deviceInfo } = req.body;
    const attendance = await prisma.attendance.create({
      data: { memberId, deviceInfo },
    });
    res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.params as { memberId: string };
    const attendance = await prisma.attendance.findMany({
      where: { memberId },
      orderBy: { checkIn: 'desc' },
    });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};
