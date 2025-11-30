import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Notification from '../../../models/Notification';
import User from '../../../models/User';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function DELETE(request: NextRequest) {
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
    const notificationId = searchParams.get('notificationId');
    const deleteAll = searchParams.get('deleteAll') === 'true';
    
    if (deleteAll) {
      // Delete all read notifications
      await Notification.deleteMany({
        userId: user._id,
        isRead: true
      });
      
      return NextResponse.json(
        { success: true, message: 'All read notifications deleted' },
        { status: 200 }
      );
    }
    
    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (notification.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Not your notification' },
        { status: 403 }
      );
    }
    
    await Notification.findByIdAndDelete(notificationId);
    
    return NextResponse.json(
      { success: true, message: 'Notification deleted' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}