import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

// Helper function to validate user has access to gym data
const validateGymAccess = async (gymId: string, userId: string) => {
  const gym = await prisma.gym.findFirst({
    where: {
      id: gymId,
      OR: [
        { ownerId: userId },
        { 
          staff: {
            some: { userId }
          }
        },
        {
          members: {
            some: { userId }
          }
        }
      ]
    }
  });
  
  return !!gym;
};

export const getGymAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { gymId } = req.params as { gymId: string };
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    
    // SECURITY: Validate user has access to this gym's data
    const hasAccess = await validateGymAccess(gymId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied - You do not have permission to view this gym\'s data' });
    }
    
    const totalMembers = await prisma.memberProfile.count({ where: { gymId } });
    const activeMembers = await prisma.memberProfile.count({ 
      where: { gymId, status: 'ACTIVE' } 
    });
    const totalClasses = await prisma.fitnessClass.count({ where: { gymId } });
    const revenue = await prisma.payment.aggregate({
      where: { subscription: { gymId } },
      _sum: { amount: true },
    });

    res.json({
      totalMembers,
      activeMembers,
      totalClasses,
      totalRevenue: revenue._sum.amount ?? 0,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemberMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Get user's gym ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gymId: true }
    });
    
    if (!user?.gymId) {
      return res.status(404).json({ error: 'Gym not found' });
    }
    
    const gymId = user.gymId;
    
    // New members this month (real calculation)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const newMembersThisMonth = await prisma.memberProfile.count({
      where: {
        gymId,
        createdAt: { gte: firstDayOfMonth },
      },
    });

    // Calculate real churn rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeMembersStart = await prisma.memberProfile.count({
      where: {
        gymId,
        status: 'ACTIVE',
        createdAt: { lt: thirtyDaysAgo },
      },
    });
    
    const churnedMembers = await prisma.memberProfile.count({
      where: {
        gymId,
        status: { in: ['INACTIVE', 'EXPIRED'] },
        updatedAt: { gte: thirtyDaysAgo },
      },
    });
    
    const churnRate = activeMembersStart > 0 
      ? (churnedMembers / activeMembersStart) * 100 
      : 0;

    res.json({
      newMembersThisMonth,
      churnRate: parseFloat(churnRate.toFixed(2)),
      retentionRate: parseFloat((100 - churnRate).toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Get user's gym ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gymId: true }
    });
    
    if (!user?.gymId) {
      return res.status(404).json({ error: 'Gym not found' });
    }
    
    const gymId = user.gymId;
    
    // Monthly recurring revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyRevenue = await prisma.payment.aggregate({
      where: { 
        paymentDate: { gte: thirtyDaysAgo },
        subscription: { gymId }
      },
      _sum: { amount: true },
    });

    const mrr = monthlyRevenue._sum.amount || 0;
    
    // Calculate average revenue per member
    const totalMembers = await prisma.memberProfile.count({ where: { gymId } });
    const averageRevenuePerMember = totalMembers > 0 ? mrr / totalMembers : 0;
    
    res.json({
      mrr,
      arr: mrr * 12,
      averageRevenuePerMember: parseFloat(averageRevenuePerMember.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Get user's gym ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gymId: true }
    });
    
    if (!user?.gymId) {
      return res.status(404).json({ error: 'Gym not found' });
    }
    
    const gymId = user.gymId;
    
    // Today's check-ins
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCheckIns = await prisma.attendance.count({
      where: {
        member: { gymId },
        checkIn: {
          gte: today,
        },
      },
    });

    // Average daily check-ins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const totalCheckInsLastWeek = await prisma.attendance.count({
      where: {
        member: { gymId },
        checkIn: { gte: sevenDaysAgo },
      },
    });
    
    const averageDailyCheckIns = totalCheckInsLastWeek / 7;

    // Calculate peak hours from recent attendance
    const recentAttendances = await prisma.attendance.findMany({
      where: {
        member: { gymId },
        checkIn: { gte: sevenDaysAgo },
      },
      select: {
        checkIn: true,
      },
      orderBy: {
        checkIn: 'desc',
      },
      take: 100,
    });
    
    const hourCounts = new Array(24).fill(0);
    recentAttendances.forEach((attendance: { checkIn: Date }) => {
      const hour = new Date(attendance.checkIn).getHours();
      hourCounts[hour]++;
    });
    
    // Get top 4 peak hours
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(item => item.hour);

    res.json({
      todayCheckIns,
      averageDailyCheckIns: parseFloat(averageDailyCheckIns.toFixed(1)),
      peakHours: peakHours.length > 0 ? peakHours : [9, 10, 17, 18],
    });
  } catch (error) {
    next(error);
  }
};

export const getEquipmentUsage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Get user's gym ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gymId: true }
    });
    
    if (!user?.gymId) {
      return res.status(404).json({ error: 'Gym not found' });
    }
    
    const gymId = user.gymId;
    
    const equipmentList = await prisma.equipment.findMany({
      where: { gymId },
      include: { maintenanceLogs: true },
    });

    res.json({
      totalEquipment: equipmentList.length,
      activeEquipment: equipmentList.filter((e: any) => e.status === 'ACTIVE').length,
      underMaintenance: equipmentList.filter((e: any) => e.status === 'MAINTENANCE').length,
      brokenEquipment: equipmentList.filter((e: any) => e.status === 'BROKEN').length,
    });
  } catch (error) {
    next(error);
  }
};
