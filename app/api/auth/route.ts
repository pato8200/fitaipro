// Next.js App Router API Route for Auth
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, action } = body;
    
    // Determine route from query param or body
    const url = new URL(request.url);
    const route = url.searchParams.get('route') || action || 'login';
    
    console.log('📍 Auth API called - Route:', route);

    if (route === 'register') {
      return await handleRegister(body);
    } else {
      return await handleLogin(body);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

async function handleLogin(body: any) {
  console.log('🔐 Login attempt:', body.email);
  
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password required' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      gym: true,
      memberProfile: true,
      trainerProfile: true,
    },
  });

  console.log('User found:', user ? 'Yes' : 'No');

  if (!user) {
    console.log('❌ User not found:', email);
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    console.log('❌ Invalid password for:', email);
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  console.log('✅ Login successful for:', email);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      gym: user.gym,
      memberProfile: user.memberProfile,
      trainerProfile: user.trainerProfile,
    },
    token,
    refreshToken,
  });
}

async function handleRegister(body: any) {
  const { email, password, firstName, lastName, role, gymId } = body;

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: 'Email already registered' },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'MEMBER',
      gymId,
    },
    include: {
      gym: true,
    },
  });

  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      gym: user.gym,
    },
    token,
    refreshToken,
  });
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });
}
