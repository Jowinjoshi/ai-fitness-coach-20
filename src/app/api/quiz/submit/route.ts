import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, quizAttempts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, score, totalQuestions, quizData } = body;

    // Validate required fields
    if (userId === undefined || userId === null) {
      return NextResponse.json({ 
        error: "userId is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (score === undefined || score === null) {
      return NextResponse.json({ 
        error: "score is required",
        code: "MISSING_SCORE" 
      }, { status: 400 });
    }

    if (totalQuestions === undefined || totalQuestions === null) {
      return NextResponse.json({ 
        error: "totalQuestions is required",
        code: "MISSING_TOTAL_QUESTIONS" 
      }, { status: 400 });
    }

    // Validate userId is a valid integer
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return NextResponse.json({ 
        error: "userId must be a valid integer",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    // Validate score and totalQuestions
    const parsedScore = parseInt(score);
    const parsedTotalQuestions = parseInt(totalQuestions);

    if (isNaN(parsedScore) || parsedScore < 0) {
      return NextResponse.json({ 
        error: "score must be a non-negative integer",
        code: "INVALID_SCORE" 
      }, { status: 400 });
    }

    if (isNaN(parsedTotalQuestions) || parsedTotalQuestions <= 0) {
      return NextResponse.json({ 
        error: "totalQuestions must be a positive integer",
        code: "INVALID_TOTAL_QUESTIONS" 
      }, { status: 400 });
    }

    if (parsedScore > parsedTotalQuestions) {
      return NextResponse.json({ 
        error: "score cannot be greater than totalQuestions",
        code: "SCORE_EXCEEDS_TOTAL" 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parsedUserId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    const user = existingUser[0];

    // Calculate accuracy
    const accuracy = (parsedScore / parsedTotalQuestions) * 100;

    // Calculate XP earned
    let xpEarned = parsedScore * 5; // Base XP: 5 XP per correct answer
    let bonusAwarded = `Base XP: ${xpEarned} XP (${parsedScore} correct × 5)`;

    // Accuracy bonus: 80% or higher
    if (accuracy >= 80 && accuracy < 90) {
      xpEarned += 20;
      bonusAwarded += `, Accuracy Bonus: 20 XP (≥80% accuracy)`;
    }

    // Accuracy bonus: 90% or higher
    if (accuracy >= 90) {
      xpEarned += 50;
      bonusAwarded += `, Accuracy Bonus: 50 XP (≥90% accuracy)`;
    }

    // Perfect score bonus
    if (parsedScore === parsedTotalQuestions) {
      xpEarned += 100;
      bonusAwarded += `, Perfect Score Bonus: 100 XP`;
    }

    // Calculate new total XP and level
    const newXp = user.xp + xpEarned;
    const newLevel = Math.floor(newXp / 100) + 1;

    const now = new Date().toISOString();

    // Insert quiz attempt record
    const newQuizAttempt = await db.insert(quizAttempts)
      .values({
        userId: parsedUserId,
        score: parsedScore,
        totalQuestions: parsedTotalQuestions,
        xpEarned,
        quizData: quizData || null,
        createdAt: now
      })
      .returning();

    // Update user XP and level
    const updatedUser = await db.update(users)
      .set({
        xp: newXp,
        level: newLevel,
        updatedAt: now
      })
      .where(eq(users.id, parsedUserId))
      .returning();

    return NextResponse.json({
      message: "Quiz submitted successfully",
      quizAttempt: {
        id: newQuizAttempt[0].id,
        userId: newQuizAttempt[0].userId,
        score: newQuizAttempt[0].score,
        totalQuestions: newQuizAttempt[0].totalQuestions,
        xpEarned: newQuizAttempt[0].xpEarned,
        createdAt: newQuizAttempt[0].createdAt
      },
      accuracy: Math.round(accuracy * 100) / 100,
      totalXp: updatedUser[0].xp,
      level: updatedUser[0].level,
      bonusAwarded
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}