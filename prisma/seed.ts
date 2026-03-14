import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fitai-pro.com' },
    update: {},
    create: {
      email: 'admin@fitai-pro.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create gym owner
  const gymOwner = await prisma.user.upsert({
    where: { email: 'owner@gym.com' },
    update: {},
    create: {
      email: 'owner@gym.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'GYM_OWNER',
    },
  })

  console.log('✅ Created gym owner:', gymOwner.email)

  // Create gym
  const gym = await prisma.gym.create({
    data: {
      name: 'FitAI Pro Demo Gym',
      description: 'State-of-the-art fitness center with AI-powered training',
      address: '123 Fitness Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      phone: '+1 (555) 123-4567',
      email: 'contact@fitaidemo.com',
      ownerId: gymOwner.id,
    },
  })

  console.log('✅ Created gym:', gym.name)

  // Create membership plans
  const basicPlan = await prisma.membershipPlan.create({
    data: {
      gymId: gym.id,
      name: 'Basic Membership',
      description: 'Access to gym equipment during staffed hours',
      price: 49.0,
      duration: 1, // 1 month
      features: ['Gym access', 'Free WiFi', 'Locker room'],
    },
  })

  const proPlan = await prisma.membershipPlan.create({
    data: {
      gymId: gym.id,
      name: 'Pro Membership',
      description: 'Full access with AI personal training',
      price: 99.0,
      duration: 1,
      features: ['24/7 access', 'AI personal trainer', 'Custom workouts', 'Nutrition planning'],
    },
  })

  console.log('✅ Created membership plans')

  // Create trainer
  const trainer = await prisma.user.create({
    data: {
      email: 'trainer@gym.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'TRAINER',
    },
  })

  await prisma.trainerProfile.create({
    data: {
      userId: trainer.id,
      gymId: gym.id,
      specialization: ['Strength Training', 'HIIT', 'Nutrition'],
      bio: 'Certified personal trainer with 10 years of experience',
      certifications: ['NASM-CPT', 'CrossFit Level 2'],
      hourlyRate: 75.0,
      rating: 4.8,
      totalSessions: 150,
    },
  })

  console.log('✅ Created trainer profile')

  // Create some members
  for (let i = 1; i <= 5; i++) {
    const member = await prisma.user.create({
      data: {
        email: `member${i}@example.com`,
        password: hashedPassword,
        firstName: `Member ${i}`,
        lastName: `Test`,
        role: 'MEMBER',
      },
    })

    const memberProfile = await prisma.memberProfile.create({
      data: {
        userId: member.id,
        gymId: gym.id,
        membershipTier: i % 2 === 0 ? 'PRO' : 'BASIC',
        status: 'ACTIVE',
        fitnessGoals: ['Weight Loss', 'Muscle Gain'],
      },
    })

    // Create subscription
    await prisma.subscription.create({
      data: {
        gymId: gym.id,
        memberId: memberProfile.id,
        planId: i % 2 === 0 ? proPlan.id : basicPlan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })
  }

  console.log('✅ Created 5 test members')

  // Create fitness classes
  const classes = [
    { name: 'Morning HIIT', category: 'Cardio', level: 'INTERMEDIATE' },
    { name: 'Power Yoga', category: 'Flexibility', level: 'ALL_LEVELS' },
    { name: 'Strength Training', category: 'Strength', level: 'BEGINNER' },
  ]

  for (const classData of classes) {
    await prisma.fitnessClass.create({
      data: {
        gymId: gym.id,
        trainerId: trainer.id,
        name: classData.name,
        description: `${classData.name} class for all fitness levels`,
        category: classData.category,
        level: classData.level,
        duration: 60,
        capacity: 20,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        recurrence: 'WEEKLY',
      },
    })
  }

  console.log('✅ Created fitness classes')

  // Create equipment
  const equipment = [
    { name: 'Treadmill #1', category: 'Cardio', status: 'ACTIVE' },
    { name: 'Bench Press', category: 'Strength', status: 'ACTIVE' },
    { name: 'Leg Press', category: 'Strength', status: 'MAINTENANCE' },
    { name: 'Rowing Machine', category: 'Cardio', status: 'ACTIVE' },
  ]

  for (const equip of equipment) {
    await prisma.equipment.create({
      data: {
        gymId: gym.id,
        name: equip.name,
        category: equip.category,
        status: equip.status as any,
        purchaseDate: new Date('2024-01-01'),
      },
    })
  }

  console.log('✅ Created equipment inventory')

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - 1 Admin user`)
  console.log(`   - 1 Gym owner`)
  console.log(`   - 1 Gym`)
  console.log(`   - 2 Membership plans`)
  console.log(`   - 1 Trainer`)
  console.log(`   - 5 Members`)
  console.log(`   - 3 Fitness classes`)
  console.log(`   - 4 Equipment items`)
  console.log('\n🔐 Test Credentials:')
  console.log(`   Admin: admin@fitai-pro.com / admin123`)
  console.log(`   Owner: owner@gym.com / admin123`)
  console.log(`   Member: member1@example.com / admin123`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
