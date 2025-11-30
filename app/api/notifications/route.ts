import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import Notification from '../../models/Notification';
import User from '../../models/User';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

// GET - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in' },
        { status: 401 }
      );
    }
    
    const user = await User.findOne({ name: session.user.name });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    const query: any = { userId: user._id };
    if (unreadOnly) {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50); // Last 50 notifications
    
    return NextResponse.json(
      { success: true, data: notifications },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}