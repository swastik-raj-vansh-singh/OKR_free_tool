import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, reminder_enabled, reminder_frequency, reminder_day, reminder_time } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Update user reminder settings
    // Note: Using 'id' column instead of 'user_id' based on Supabase schema
    const { data, error } = await supabase
      .from('users')
      .update({
        reminder_enabled: reminder_enabled ?? true,
        reminder_frequency: reminder_frequency ?? 'weekly',
        reminder_day: reminder_day ?? 'monday',
        reminder_time: reminder_time ?? '18:00:00',
      })
      .eq('id', user_id)
      .select();

    if (error) {
      return NextResponse.json({
        error: 'Failed to update reminder settings',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Reminder settings updated successfully',
      data: data?.[0] || null,
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update reminder settings',
      },
      { status: 500 }
    );
  }
}
