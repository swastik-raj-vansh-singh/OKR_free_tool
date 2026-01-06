import { NextRequest, NextResponse } from 'next/server';
import { sendOKRReminders } from '@/lib/lamatic-api';

export async function GET(req: NextRequest) {
  // Security: Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendOKRReminders();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: result,
      sent_count: result.sent_count || 0,
      message: result.message || 'Reminders processed'
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reminders',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
