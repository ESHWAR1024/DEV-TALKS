import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/User';
import Community from '../../../models/community';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    await connectDB();
    
    // Get current user from NextAuth session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await User.findOne({ name: session.user.name });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all communities the user has joined
    const communities = await Community.find({
      _id: { $in: user.communities || [] }
    })
    .select('-password') // Don't send passwords
    .sort({ createdAt: -1 }); // Newest first

    return NextResponse.json(
      { 
        success: true, 
        data: communities 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching user communities:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}