import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return default quiz if no API key
      return NextResponse.json({
        questions: [
          {
            question: "What is the recommended daily water intake for adults?",
            options: ["2 liters", "4 liters", "6 liters", "8 liters"],
            correctAnswer: 0
          },
          {
            question: "How many calories does one pound of fat contain?",
            options: ["2500", "3500", "4500", "5500"],
            correctAnswer: 1
          },
          {
            question: "What is the ideal heart rate zone for fat burning?",
            options: ["50-60% max HR", "60-70% max HR", "70-80% max HR", "80-90% max HR"],
            correctAnswer: 1
          },
          {
            question: "Which macronutrient is most important for muscle building?",
            options: ["Carbohydrates", "Protein", "Fats", "Fiber"],
            correctAnswer: 1
          },
          {
            question: "How long should you rest between strength training sets?",
            options: ["15-30 seconds", "30-60 seconds", "60-90 seconds", "2-3 minutes"],
            correctAnswer: 2
          },
          {
            question: "What BMI range is considered healthy?",
            options: ["15-18.5", "18.5-24.9", "25-29.9", "30-35"],
            correctAnswer: 1
          },
          {
            question: "How many days per week should beginners strength train?",
            options: ["1-2 days", "2-3 days", "4-5 days", "6-7 days"],
            correctAnswer: 1
          },
          {
            question: "What is the best time to stretch?",
            options: ["Before workout", "During workout", "After workout", "Never"],
            correctAnswer: 2
          },
          {
            question: "How much protein should an active adult consume per kg of body weight?",
            options: ["0.5-0.8g", "0.8-1.0g", "1.6-2.2g", "3.0-4.0g"],
            correctAnswer: 2
          },
          {
            question: "What is progressive overload?",
            options: ["Eating more calories", "Gradually increasing training intensity", "Resting longer", "Doing the same workout"],
            correctAnswer: 1
          }
        ]
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Generate a fitness quiz with exactly 10 multiple-choice questions. Cover topics like nutrition, exercise, health, and wellness. Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0
    }
  ]
}

Make questions educational and interesting. correctAnswer should be the index (0-3) of the correct option.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up response
    text = text.replace(/```json\n?|\n?```/g, '');
    text = text.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

    try {
      const quizData = JSON.parse(text);
      
      // Validate structure
      if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length !== 10) {
        throw new Error('Invalid quiz structure');
      }

      return NextResponse.json(quizData);
    } catch (parseError) {
      console.error('Failed to parse quiz:', text);
      // Return fallback quiz
      return NextResponse.json({
        questions: [
          {
            question: "What is the primary benefit of cardiovascular exercise?",
            options: ["Muscle gain", "Heart health", "Flexibility", "Balance"],
            correctAnswer: 1
          },
          {
            question: "How many hours of sleep do adults need per night?",
            options: ["4-5 hours", "5-6 hours", "7-9 hours", "10-12 hours"],
            correctAnswer: 2
          },
          {
            question: "What is the best pre-workout meal timing?",
            options: ["Right before", "30 minutes before", "1-2 hours before", "4 hours before"],
            correctAnswer: 2
          },
          {
            question: "Which exercise targets the quadriceps?",
            options: ["Bicep curl", "Squat", "Shoulder press", "Tricep dip"],
            correctAnswer: 1
          },
          {
            question: "What is HIIT training?",
            options: ["Heavy Intensity Interval Training", "High Intensity Interval Training", "Hard Indoor Intense Training", "High Impact Incremental Training"],
            correctAnswer: 1
          },
          {
            question: "How often should you change your workout routine?",
            options: ["Every day", "Every week", "Every 4-6 weeks", "Never"],
            correctAnswer: 2
          },
          {
            question: "What is the main energy source during high-intensity exercise?",
            options: ["Protein", "Fat", "Carbohydrates", "Vitamins"],
            correctAnswer: 2
          },
          {
            question: "How long does it take to form a habit?",
            options: ["7 days", "21 days", "66 days", "100 days"],
            correctAnswer: 2
          },
          {
            question: "What is the recommended weekly cardio duration?",
            options: ["75 minutes", "150 minutes", "300 minutes", "450 minutes"],
            correctAnswer: 1
          },
          {
            question: "Which vitamin is produced by sun exposure?",
            options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E"],
            correctAnswer: 2
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}