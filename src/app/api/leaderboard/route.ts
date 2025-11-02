import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'xp';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);

    // Validate type parameter
    if (type !== 'xp' && type !== 'streak') {
      return NextResponse.json({ 
        error: "Invalid type parameter. Must be 'xp' or 'streak'",
        code: "INVALID_TYPE" 
      }, { status: 400 });
    }

    // Build query based on type
    let query = db.select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
      xp: users.xp,
      level: users.level,
      currentStreak: users.currentStreak,
      longestStreak: users.longestStreak
    }).from(users);

    // Order by type
    if (type === 'xp') {
      query = query.orderBy(desc(users.xp));
    } else {
      query = query.orderBy(desc(users.currentStreak), desc(users.longestStreak));
    }

    // Apply limit
    const results = await query.limit(limit);

    // Add rank to each user
    const leaderboard = results.map((user, index) => ({
      rank: index + 1,
      ...user
    }));

    return NextResponse.json({
      leaderboard,
      type,
      total: leaderboard.length
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}