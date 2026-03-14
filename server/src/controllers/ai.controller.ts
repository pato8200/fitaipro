import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';
import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face Inference (or use local model)
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const hf = HF_API_KEY ? new HfInference(HF_API_KEY) : null;

// Alternative: Use Ollama for local LLM (completely free, no API key needed)
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export const generateWorkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      fitnessLevel, 
      goals, 
      duration, 
      equipment, 
      focusAreas,
      injuries 
    } = req.body;

    // Get user's workout history for personalization
    const recentWorkouts = await prisma.workoutLog.findMany({
      where: { userId: req.userId! },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: { exercises: true },
    });

    // Use Hugging Face or Ollama instead of OpenAI
    const prompt = `
      You are an expert AI personal trainer. Create a personalized workout plan with these specifications:
      
      User Profile:
      - Fitness Level: ${fitnessLevel}
      - Goals: ${goals.join(', ')}
      - Available Duration: ${duration} minutes
      - Available Equipment: ${equipment?.join(', ') || 'bodyweight only'}
      - Focus Areas: ${focusAreas?.join(', ') || 'full body'}
      - Injuries/Limitations: ${injuries?.join(', ') || 'none'}
      
      Recent Workout History (to avoid repetition and ensure progression):
      ${recentWorkouts.map((w: any) => `- ${w.name}: ${w.exercises.map((e: any) => `${e.name} (${e.sets}x${e.reps})`).join(', ')}`).join('\n')}
      
      Create a structured workout with:
      1. Warm-up (5-10 minutes)
      2. Main workout with specific exercises, sets, reps, and rest times
      3. Cool-down stretches
      
      Format the response as JSON with this structure:
      {
        "name": "Workout Name",
        "warmup": [{"exercise": "...", "duration": "...", "instructions": "..."}],
        "exercises": [
          {"name": "...", "sets": 3, "reps": 12, "restSeconds": 60, "notes": "..."}
        ],
        "cooldown": [{"stretch": "...", "duration": "..."}],
        "tips": ["...", "..."]
      }
    `;

    let workoutPlan: any;

    // Try Ollama first (local, free), then Hugging Face, then fallback
    if (process.env.USE_OLLAMA === 'true') {
      // Use local Ollama (requires ollama run llama2 or similar)
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: prompt,
          stream: false,
          format: 'json'
        })
      });
      const data: any = await response.json();
      workoutPlan = JSON.parse(data.response);
    } else if (hf) {
      // Use Hugging Face Inference API
      const response = await hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          return_full_text: false
        }
      });
      workoutPlan = JSON.parse(response.generated_text);
    } else {
      // Fallback: Rule-based workout generator (no AI API needed)
      workoutPlan = generateRuleBasedWorkout(fitnessLevel, goals, duration, equipment, focusAreas);
    }

    // Save conversation to history
    await prisma.aIConversation.create({
      data: {
        userId: req.userId!,
        role: 'user',
        message: `Generate workout: ${goals.join(', ')}, ${duration} min`,
        metadata: { fitnessLevel, goals, duration, equipment },
      },
    });

    await prisma.aIConversation.create({
      data: {
        userId: req.userId!,
        role: 'assistant',
        message: `Generated workout: ${workoutPlan.name}`,
        metadata: workoutPlan,
      },
    });

    res.json(workoutPlan);
  } catch (error) {
    // Error will be handled by global error middleware
    next(error);
  }
};

export const chatWithTrainer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Get user profile for context
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: {
        memberProfile: true,
        trainerProfile: true,
        aiConversations: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    // Build conversation history for context
    const conversationHistory = user?.aiConversations.slice(-10).map((conv: any) => ({
      role: conv.role,
      content: conv.message,
    })) || [];

    const systemPrompt = `
      You are FitAI Pro, an intelligent, friendly, and motivating AI personal trainer.
      
      User Context:
      - Name: ${user?.firstName} ${user?.lastName}
      - Role: ${user?.role}
      - Fitness Goals: ${user?.memberProfile?.fitnessGoals?.join(', ') || 'Not specified'}
      - Membership: ${user?.memberProfile?.membershipTier || 'N/A'}
      
      Your capabilities:
      - Answer fitness and nutrition questions
      - Provide workout advice and modifications
      - Motivate and guide users
      - Track progress and suggest adjustments
      - Explain proper form and technique
      
      Guidelines:
      - Be encouraging and positive
      - Prioritize safety and proper form
      - Adapt advice to user's fitness level
      - Cite scientific sources when possible
      - Acknowledge limitations and suggest consulting professionals for medical advice
    `;

    let response: string;

    // Use local/self-hosted LLM instead of OpenAI
    if (process.env.USE_OLLAMA === 'true') {
      // Local Ollama inference (free, no API costs)
      const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: `${systemPrompt}\n\nUser: ${message}\nAssistant:`,
          stream: false,
          max_tokens: 1000
        })
      });
      const data: any = await ollamaResponse.json();
      response = data.response.trim();
    } else if (hf) {
      // Hugging Face Inference
      const hfResponse = await hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: `${systemPrompt}\n\nUser: ${message}\nAssistant:`,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          return_full_text: false
        }
      });
      response = hfResponse.generated_text.trim();
    } else {
      // Fallback: Rule-based responses (no AI)
      response = generateRuleBasedChatResponse(message, user);
    }

    // Save conversation
    await prisma.aIConversation.create({
      data: {
        userId: req.userId!,
        role: 'user',
        message,
        metadata: context,
      },
    });

    await prisma.aIConversation.create({
      data: {
        userId: req.userId!,
        role: 'assistant',
        message: response,
      },
    });

    res.json({ response });
  } catch (error) {
    console.error('Error in AI chat:', error);
    next(error);
  }
};

export const getNutritionAdvice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      dietaryPreferences, 
      allergies, 
      goals,
      currentWeight,
      targetWeight,
      height,
      age,
      activityLevel 
    } = req.body;

    // Calculate BMI if data available
    let bmi = null;
    if (currentWeight && height) {
      bmi = currentWeight / ((height / 100) ** 2);
    }

    const prompt = `
      You are a certified nutritionist AI. Provide personalized nutrition advice.
      
      Client Profile:
      - Current Weight: ${currentWeight ? `${currentWeight} kg` : 'Not provided'}
      - Target Weight: ${targetWeight ? `${targetWeight} kg` : 'Not provided'}
      - Height: ${height ? `${height} cm` : 'Not provided'}
      - Age: ${age ? `${age} years` : 'Not provided'}
      - Activity Level: ${activityLevel || 'Moderate'}
      - Dietary Preferences: ${dietaryPreferences?.join(', ') || 'No restrictions'}
      - Allergies: ${allergies?.join(', ') || 'None'}
      - Goals: ${goals?.join(', ') || 'General health'}
      - BMI: ${bmi ? bmi.toFixed(1) : 'Not calculated'}
      
      Provide:
      1. Daily caloric needs (TDEE calculation)
      2. Macronutrient breakdown (protein, carbs, fats)
      3. Meal timing recommendations
      4. Sample meal plan for one day
      5. Supplement recommendations (if applicable)
      6. Hydration guidelines
      
      Format as JSON with clear sections.
    `;

    let advice: any;

    // Use local/self-hosted LLM for nutrition advice
    if (process.env.USE_OLLAMA === 'true') {
      const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: prompt,
          stream: false,
          format: 'json'
        })
      });
      const data: any = await ollamaResponse.json();
      advice = JSON.parse(data.response);
    } else if (hf) {
      const hfResponse = await hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          return_full_text: false
        }
      });
      advice = JSON.parse(hfResponse.generated_text);
    } else {
      // Fallback: Basic nutrition template
      advice = {
        dailyCalories: 2000,
        macronutrients: {
          protein: '30% (150g)',
          carbs: '40% (200g)',
          fats: '30% (67g)'
        },
        mealTiming: ['Breakfast 7AM', 'Lunch 12PM', 'Dinner 6PM', 'Snacks as needed'],
        sampleMealPlan: {
          breakfast: 'Oatmeal with fruits and nuts',
          lunch: 'Grilled chicken with quinoa and vegetables',
          dinner: 'Salmon with sweet potato and broccoli',
          snacks: 'Greek yogurt, almonds, or fruit'
        },
        supplements: ['Whey protein (if needed)', 'Multivitamin', 'Omega-3'],
        hydration: 'Drink at least 3 liters of water daily'
      };
    }

    res.json(advice);
  } catch (error) {
    console.error('Error getting nutrition advice:', error);
    next(error);
  }
};

export const analyzeProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { timeframe } = req.body; // 'week', 'month', 'quarter'

    // Get user's workout and progress data
    const workouts = await prisma.workoutLog.findMany({
      where: {
        userId: req.userId!,
        completedAt: {
          gte: getTimeframeDate(timeframe || 'month'),
        },
      },
      include: { exercises: true },
      orderBy: { completedAt: 'desc' },
    });

    const goals = await prisma.goal.findMany({
      where: { memberId: req.userId! },
    });

    const prompt = `
      Analyze this user's fitness progress and provide insights.
      
      Workout Data (last ${timeframe || 'month'}):
      - Total Workouts: ${workouts.length}
      - Recent Workouts:
      ${workouts.slice(0, 5).map((w: any) => 
        `${w.name} - Rating: ${w.rating}/5, Duration: ${w.duration}min, Calories: ${w.calories}`
      ).join('\n')}
      
      Goals:
      ${goals.map((g: any) => `- ${g.type}: ${g.current || 'N/A'} / ${g.target} ${g.unit} (${g.status})`).join('\n')}
      
      Provide analysis on:
      1. Consistency and adherence
      2. Progression trends (strength, endurance, etc.)
      3. Areas of improvement
      4. Suggested adjustments to training
      5. Motivation and next steps
      
      Format as JSON with actionable insights.
    `;

    let analysis: any;

    // Use local/self-hosted LLM for progress analysis
    if (process.env.USE_OLLAMA === 'true') {
      const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: prompt,
          stream: false,
          format: 'json'
        })
      });
      const data: any = await ollamaResponse.json();
      analysis = JSON.parse(data.response);
    } else if (hf) {
      const hfResponse = await hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          return_full_text: false
        }
      });
      analysis = JSON.parse(hfResponse.generated_text);
    } else {
      // Fallback: Basic analysis template
      analysis = {
        consistency: {
          score: workouts.length > 0 ? Math.min(workouts.length * 10, 100) : 0,
          summary: workouts.length > 0 ? 'Good workout frequency!' : 'Start with 2-3 workouts per week'
        },
        progression: {
          strength: 'Maintain current routine',
          endurance: 'Add cardio sessions',
          flexibility: 'Include stretching'
        },
        improvements: [
          'Track your workouts consistently',
          'Focus on progressive overload',
          'Ensure adequate protein intake'
        ],
        suggestions: [
          'Consider adding rest days between intense sessions',
          'Track nutrition alongside workouts',
          'Set specific, measurable goals'
        ],
        motivation: 'Keep going! Consistency is key to seeing results.'
      };
    }

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing progress:', error);
    next(error);
  }
};

export const predictChurn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only accessible by gym owners/admins
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { gym: true },
    });

    if (!user?.gym) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get gym membership data
    const members = await prisma.memberProfile.findMany({
      where: { gymId: user.gym.id },
      include: {
        attendance: {
          orderBy: { checkIn: 'desc' },
          take: 30,
        },
        subscription: true,
      },
    });

    const prompt = `
      Analyze gym membership data to predict churn risk.
      
      Total Members: ${members.length}
      
      Sample Member Data:
      ${members.slice(0, 20).map((m: any) => `
        - Member: ${m.user.firstName}
        - Status: ${m.status}
        - Attendance (last 30 days): ${m.attendance.length} visits
        - Subscription: ${m.subscription?.status || 'N/A'}
        - Last Visit: ${m.attendance[0]?.checkIn || 'Never'}
      `).join('\n')}
      
      Identify:
      1. High-risk members (likely to cancel)
      2. Medium-risk members
      3. Common patterns among at-risk members
      4. Recommended retention strategies
      5. Engagement opportunities
      
      Format as JSON with member IDs and risk scores (0-100).
    `;

    let churnPrediction: any;

    // Use local/self-hosted LLM for churn prediction
    if (process.env.USE_OLLAMA === 'true') {
      const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama2',
          prompt: prompt,
          stream: false,
          format: 'json'
        })
      });
      const data: any = await ollamaResponse.json();
      churnPrediction = JSON.parse(data.response);
    } else if (hf) {
      const hfResponse = await hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          return_full_text: false
        }
      });
      churnPrediction = JSON.parse(hfResponse.generated_text);
    } else {
      // Fallback: Rule-based churn detection
      const atRiskMembers = members.filter((m: any) => {
        const attendanceCount = m.attendance.length;
        const isInactive = m.status === 'INACTIVE';
        const hasLowAttendance = attendanceCount < 5;
        return isInactive || hasLowAttendance;
      });

      churnPrediction = {
        totalMembers: members.length,
        highRisk: {
          count: atRiskMembers.length,
          percentage: Math.round((atRiskMembers.length / members.length) * 100),
          members: atRiskMembers.slice(0, 10).map((m: any) => ({
            id: m.id,
            name: m.user.firstName,
            riskScore: m.status === 'INACTIVE' ? 90 : 60,
            reasons: [
              m.status === 'INACTIVE' ? 'Inactive status' : 'Low attendance',
              m.attendance.length < 3 ? 'Haven\'t visited in weeks' : ''
            ].filter(Boolean)
          }))
        },
        mediumRisk: {
          count: Math.floor(members.length * 0.15),
          percentage: 15
        },
        patterns: [
          'Members who miss 2+ weeks are likely to churn',
          'Low engagement in first month predicts churn',
          'Lack of goal setting increases churn risk'
        ],
        retentionStrategies: [
          'Send personalized check-in emails to inactive members',
          'Offer free personal training session to at-risk members',
          'Create engagement challenges with rewards',
          'Implement automatic renewal reminders'
        ],
        engagementOpportunities: [
          'Group fitness challenges',
          'Progress tracking milestones',
          'Member spotlight features',
          'Referral bonus program'
        ]
      };
    }

    res.json(churnPrediction);
  } catch (error) {
    console.error('Error predicting churn:', error);
    next(error);
  }
};

// Helper function
function getTimeframeDate(timeframe: string): Date {
  const now = new Date();
  switch (timeframe) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'quarter':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

// Rule-based workout generator (fallback when no AI API available)
function generateRuleBasedWorkout(
  fitnessLevel: string,
  goals: string[],
  duration: number,
  equipment: string[],
  focusAreas: string[]
) {
  const workouts: any = {
    beginner: {
      name: 'Beginner Full Body Workout',
      warmup: [
        { exercise: 'Jumping Jacks', duration: '2 minutes', instructions: 'Light cardio to warm up' },
        { exercise: 'Arm Circles', duration: '1 minute', instructions: 'Forward and backward' },
        { exercise: 'Bodyweight Squats', duration: '1 minute', instructions: 'Slow and controlled' }
      ],
      exercises: [
        { name: 'Push-ups', sets: 3, reps: 10, restSeconds: 60, notes: 'Modify on knees if needed' },
        { name: 'Bodyweight Squats', sets: 3, reps: 15, restSeconds: 60, notes: 'Keep chest up' },
        { name: 'Lunges', sets: 3, reps: 10, restSeconds: 60, notes: 'Each leg' },
        { name: 'Plank', sets: 3, reps: 30, restSeconds: 45, notes: 'Hold position' }
      ],
      cooldown: [
        { stretch: 'Hamstring Stretch', duration: '30 seconds each leg' },
        { stretch: 'Quad Stretch', duration: '30 seconds each leg' },
        { stretch: 'Chest Stretch', duration: '30 seconds' }
      ],
      tips: ['Focus on form over speed', 'Stay hydrated', 'Rest 1-2 days between sessions']
    },
    intermediate: {
      name: 'Intermediate Strength Builder',
      warmup: [
        { exercise: 'High Knees', duration: '2 minutes', instructions: 'Drive knees up' },
        { exercise: 'Shoulder Rolls', duration: '1 minute', instructions: 'Both directions' },
        { exercise: 'Leg Swings', duration: '1 minute', instructions: 'Front-to-back and side-to-side' }
      ],
      exercises: [
        { name: 'Diamond Push-ups', sets: 4, reps: 12, restSeconds: 60, notes: 'Hands close together' },
        { name: 'Bulgarian Split Squats', sets: 4, reps: 12, restSeconds: 60, notes: 'Each leg' },
        { name: 'Pike Push-ups', sets: 4, reps: 10, restSeconds: 60, notes: 'Shoulders focus' },
        { name: 'Reverse Lunges', sets: 3, reps: 12, restSeconds: 60, notes: 'Controlled movement' },
        { name: 'Mountain Climbers', sets: 3, reps: 30, restSeconds: 45, notes: 'Fast pace' }
      ],
      cooldown: [
        { stretch: 'Downward Dog', duration: '1 minute' },
        { stretch: 'Child\'s Pose', duration: '1 minute' },
        { stretch: 'Hip Flexor Stretch', duration: '30 seconds each side' }
      ],
      tips: ['Increase intensity gradually', 'Track your progress', 'Focus on mind-muscle connection']
    },
    advanced: {
      name: 'Advanced Athletic Performance',
      warmup: [
        { exercise: 'Burpees', duration: '1 minute', instructions: 'Full range' },
        { exercise: 'Jump Rope', duration: '2 minutes', instructions: 'Quick pace' },
        { exercise: 'Dynamic Stretches', duration: '2 minutes', instructions: 'Full body' }
      ],
      exercises: [
        { name: 'Archer Push-ups', sets: 5, reps: 10, restSeconds: 90, notes: 'Each side' },
        { name: 'Pistol Squats', sets: 5, reps: 8, restSeconds: 90, notes: 'Each leg, use support if needed' },
        { name: 'Handstand Push-ups', sets: 4, reps: 8, restSeconds: 90, notes: 'Against wall' },
        { name: 'Jump Squats', sets: 4, reps: 15, restSeconds: 60, notes: 'Explosive' },
        { name: 'Muscle-ups', sets: 4, reps: 6, restSeconds: 90, notes: 'Or pull-up to dip transition' }
      ],
      cooldown: [
        { stretch: 'Pigeon Pose', duration: '2 minutes each side' },
        { stretch: 'Thoracic Extension', duration: '1 minute' },
        { stretch: 'Full Body Hang', duration: '1 minute' }
      ],
      tips: ['Prioritize recovery', 'Consider periodization', 'Listen to your body']
    }
  };

  return workouts[fitnessLevel as keyof typeof workouts] || workouts.beginner;
}

// Rule-based chat responses (fallback when no AI API available)
function generateRuleBasedChatResponse(message: string, user: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Keyword-based responses
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    return 'I recommend starting with a balanced routine that includes strength training and cardio. For beginners, try 3 days per week with full-body workouts. Focus on compound movements like squats, push-ups, and rows. Would you like a specific workout plan?';
  }
  
  if (lowerMessage.includes('protein') || lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
    return 'Protein is essential for muscle recovery! Aim for 0.8-1g per pound of body weight. Include lean meats, fish, eggs, or plant-based sources. Don\'t forget to balance with carbs and healthy fats for energy.';
  }
  
  if (lowerMessage.includes('weight loss') || lowerMessage.includes('lose fat')) {
    return 'For fat loss, focus on: 1) Calorie deficit (burn more than you consume), 2) High protein intake, 3) Strength training to preserve muscle, 4) Cardio for additional calorie burn. Consistency is key - aim for 1-2 lbs per week!';
  }
  
  if (lowerMessage.includes('muscle') || lowerMessage.includes('gain') || lowerMessage.includes('stronger')) {
    return 'To build muscle: 1) Progressive overload (increase weight/reps weekly), 2) Eat in a slight calorie surplus, 3) Get 7-9 hours of sleep, 4) Train each muscle 2-3x per week. Patience and consistency will get you there!';
  }
  
  if (lowerMessage.includes('form') || lowerMessage.includes('technique')) {
    return 'Proper form is crucial! Always: 1) Start with bodyweight to learn the movement, 2) Keep core engaged, 3) Use full range of motion, 4) Control the eccentric (lowering) phase. Quality over quantity always!';
  }
  
  if (lowerMessage.includes('rest') || lowerMessage.includes('recovery')) {
    return 'Recovery is when the magic happens! Get 7-9 hours of sleep, stay hydrated, include rest days, and consider active recovery like walking or light stretching. Your muscles grow during rest, not during workouts!';
  }
  
  if (lowerMessage.includes('motivation') || lowerMessage.includes('tired') || lowerMessage.includes('quit')) {
    return 'Remember why you started! Every workout counts, even the short ones. Progress isn\'t linear - some days are harder than others. You\'re stronger than you think. Just show up today, that\'s what matters!';
  }
  
  if (lowerMessage.includes('injury') || lowerMessage.includes('pain')) {
    return 'Safety first! If you\'re experiencing pain, stop the exercise immediately. Consult with a healthcare professional before continuing. We can modify exercises to work around injuries - just ask!';
  }
  
  // Default response
  return 'That\'s a great question! As your AI fitness coach, I\'m here to help with workouts, nutrition, motivation, and technique. Could you tell me more about your specific goals? Are you looking to build muscle, lose weight, or improve your overall fitness?';
}
