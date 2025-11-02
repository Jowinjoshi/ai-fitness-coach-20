import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fitnessPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const planId = parseInt(params.id);

    if (isNaN(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    const plan = await db.select()
      .from(fitnessPlans)
      .where(eq(fitnessPlans.id, planId))
      .limit(1);

    if (plan.length === 0) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const planData = plan[0];
    return NextResponse.json({
      ...planData,
      workoutContent: planData.workoutContent ? JSON.parse(planData.workoutContent as string) : null,
      dietContent: planData.dietContent ? JSON.parse(planData.dietContent as string) : null,
      motivationContent: planData.motivationContent ? JSON.parse(planData.motivationContent as string) : null,
    });

  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
