import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, dailyLogins } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // Validate userId
    if (!userId || isNaN(parseInt(userId.toString()))) {
      return NextResponse.json(
        { 
          error: 'Valid userId is required',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    const userIdInt = parseInt(userId.toString());

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, userIdInt))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const user = existingUser[0];

    // Get current date as ISO date string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Check if user already logged in today
    const todayLogin = await db.select()
      .from(dailyLogins)
      .where(and(
        eq(dailyLogins.userId, userIdInt),
        eq(dailyLogins.loginDate, today)
      ))
      .limit(1);

    if (todayLogin.length > 0) {
      return NextResponse.json({
        message: 'Already logged in today',
        xpEarned: 0,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalXp: user.xp,
        level: user.level,
        loginRecord: todayLogin[0]
      }, { status: 200 });
    }

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (user.lastLoginDate === yesterdayStr) {
      // Continue streak
      newStreak = user.currentStreak + 1;
    } else if (user.lastLoginDate !== today) {
      // Reset streak (not consecutive days)
      newStreak = 1;
    }

    // Update longest streak if needed
    const newLongestStreak = Math.max(newStreak, user.longestStreak);

    // Calculate XP: 10 base + 5 per streak day
    const xpEarned = 10 + (newStreak * 5);
    const newTotalXp = user.xp + xpEarned;

    // Calculate new level
    const newLevel = Math.floor(newTotalXp / 100) + 1;

    // Insert daily login record
    const loginRecord = await db.insert(dailyLogins)
      .values({
        userId: userIdInt,
        loginDate: today,
        xpEarned: xpEarned,
        createdAt: new Date().toISOString()
      })
      .returning();

    // Update user stats
    const updatedUser = await db.update(users)
      .set({
        xp: newTotalXp,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastLoginDate: today,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userIdInt))
      .returning();

    return NextResponse.json({
      message: 'Daily login recorded',
      xpEarned: xpEarned,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      totalXp: newTotalXp,
      level: newLevel,
      loginRecord: loginRecord[0]
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}