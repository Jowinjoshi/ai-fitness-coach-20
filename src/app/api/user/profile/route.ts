import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userAchievements, quizAttempts, dailyLogins } from '@/db/schema';
import { eq, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    // Validate that at least one parameter is provided
    if (!id && !email) {
      return NextResponse.json(
        { 
          error: 'User ID or email is required',
          code: 'MISSING_IDENTIFIER'
        },
        { status: 400 }
      );
    }

    // Validate ID is a valid integer if provided
    if (id && isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid user ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Build the where condition based on provided parameter
    const whereCondition = id 
      ? eq(users.id, parseInt(id))
      : eq(users.email, email!);

    // Fetch user profile
    const userProfile = await db.select()
      .from(users)
      .where(whereCondition)
      .limit(1);

    if (userProfile.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const user = userProfile[0];

    // Calculate total achievements
    const achievementsCount = await db.select({ count: count() })
      .from(userAchievements)
      .where(eq(userAchievements.userId, user.id));

    // Calculate total quizzes
    const quizzesCount = await db.select({ count: count() })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, user.id));

    // Calculate total login days
    const loginDaysCount = await db.select({ count: count() })
      .from(dailyLogins)
      .where(eq(dailyLogins.userId, user.id));

    // Build response with stats
    const response = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastLoginDate: user.lastLoginDate,
      isGuest: user.isGuest,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        totalAchievements: achievementsCount[0]?.count ?? 0,
        totalQuizzes: quizzesCount[0]?.count ?? 0,
        totalLoginDays: loginDaysCount[0]?.count ?? 0
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}