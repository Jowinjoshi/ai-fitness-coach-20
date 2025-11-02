import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/db';
import { fitnessPlans } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      planType,
      fitnessGoal,
      fitnessLevel,
      age,
      weight,
      height,
      dietaryPreferences
    } = body;

    // Validate required fields
    if (!userId || !planType || !fitnessGoal || !fitnessLevel || !age || !weight || !height) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    let workoutContent = null;
    let dietContent = null;
    let motivationContent = null;

    // Generate Workout Plan
    if (planType === 'workout' || planType === 'combined') {
      const workoutPrompt = `Create a detailed personalized workout plan for:
- Fitness Level: ${fitnessLevel}
- Goal: ${fitnessGoal}
- Age: ${age}
- Weight: ${weight}kg
- Height: ${height}cm

Return a JSON object with this structure:
{
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Upper Body",
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": "12-15",
          "rest": "60 seconds",
          "notes": "Keep core tight"
        }
      ],
      "duration": "45 minutes"
    }
  ],
  "tips": ["Warm up for 5-10 minutes", "Stay hydrated"],
  "equipment": ["Dumbbells", "Resistance bands"]
}`;

      const workoutResult = await model.generateContent(workoutPrompt);
      const workoutText = workoutResult.response.text();
      try {
        workoutContent = JSON.parse(workoutText.replace(/```json\n?|\n?```/g, ''));
      } catch {
        workoutContent = { error: 'Failed to parse workout plan', rawText: workoutText };
      }
    }

    // Generate Diet Plan
    if (planType === 'diet' || planType === 'combined') {
      const dietPrompt = `Create a detailed personalized diet/meal plan for:
- Fitness Level: ${fitnessLevel}
- Goal: ${fitnessGoal}
- Age: ${age}
- Weight: ${weight}kg
- Height: ${height}cm
${dietaryPreferences ? `- Dietary Preferences: ${dietaryPreferences}` : ''}

Return a JSON object with this structure:
{
  "dailyCalories": 2000,
  "macros": {
    "protein": "150g",
    "carbs": "200g",
    "fats": "60g"
  },
  "meals": [
    {
      "meal": "Breakfast",
      "time": "7:00 AM",
      "foods": [
        {
          "name": "Oatmeal with berries",
          "calories": 300,
          "protein": "10g",
          "carbs": "50g",
          "fats": "8g"
        }
      ],
      "total": 300
    }
  ],
  "tips": ["Drink 8 glasses of water daily", "Eat every 3-4 hours"],
  "supplements": ["Multivitamin", "Omega-3"]
}`;

      const dietResult = await model.generateContent(dietPrompt);
      const dietText = dietResult.response.text();
      try {
        dietContent = JSON.parse(dietText.replace(/```json\n?|\n?```/g, ''));
      } catch {
        dietContent = { error: 'Failed to parse diet plan', rawText: dietText };
      }
    }

    // Generate Motivation
    const motivationPrompt = `Create motivational content for someone with goal: ${fitnessGoal}. Return JSON with:
{
  "quote": "A powerful motivational quote",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "milestones": [
    {
      "week": 1,
      "goal": "Complete all scheduled workouts",
      "reward": "Treat yourself to new workout gear"
    }
  ]
}`;

    const motivationResult = await model.generateContent(motivationPrompt);
    const motivationText = motivationResult.response.text();
    try {
      motivationContent = JSON.parse(motivationText.replace(/```json\n?|\n?```/g, ''));
    } catch {
      motivationContent = { 
        quote: 'Your only limit is you!',
        tips: ['Stay consistent', 'Track your progress', 'Believe in yourself']
      };
    }

    // Save to database
    const now = new Date().toISOString();
    const newPlan = await db.insert(fitnessPlans)
      .values({
        userId,
        planType,
        fitnessGoal,
        fitnessLevel,
        age,
        weight,
        height,
        dietaryPreferences: dietaryPreferences || null,
        workoutContent: workoutContent ? JSON.stringify(workoutContent) : null,
        dietContent: dietContent ? JSON.stringify(dietContent) : null,
        motivationContent: JSON.stringify(motivationContent),
        createdAt: now
      })
      .returning();

    return NextResponse.json({
      success: true,
      planId: newPlan[0].id,
      message: 'Plan generated successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate plan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}