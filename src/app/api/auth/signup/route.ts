import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, fullName, isGuest = false } = body;

    if (!username || !email) {
      return NextResponse.json(
        { error: 'Username and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(or(
        eq(users.username, username),
        eq(users.email, email)
      ))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    // Create new user
    const newUser = await db.insert(users)
      .values({
        username,
        email,
        fullName: fullName || username,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        isGuest,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json({
      id: newUser[0].id,
      username: newUser[0].username,
      email: newUser[0].email,
      fullName: newUser[0].fullName,
      avatarUrl: newUser[0].avatarUrl,
      xp: newUser[0].xp,
      level: newUser[0].level,
      currentStreak: newUser[0].currentStreak,
      longestStreak: newUser[0].longestStreak,
      isGuest: newUser[0].isGuest,
      stats: {
        totalAchievements: 0,
        totalQuizzes: 0,
        totalLoginDays: 0
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
