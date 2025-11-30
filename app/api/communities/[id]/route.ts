import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Community from '@/app/models/community';
import User from '@/app/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in' },
        { status: 401 }
      );
    }
    
    // Await the params in Next.js 15+
    const { id: communityId } = await context.params;
    
    console.log('Fetching community:', communityId);
    
    const community = await Community.findById(communityId)
      .select('-password')
      .populate('members', 'name');
    
    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }
    
    // Get current user
    const user = await User.findOne({ name: session.user.name });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if current user is admin (creator)
    const isAdmin = community.creatorId?.toString() === user._id.toString();
    
    const communityData = {
      _id: community._id,
      name: community.name,
      description: community.description,
      memberCount: community.memberCount,
      members: community.members,
      creatorName: community.creatorName,
      isAdmin: isAdmin,
    };
    
    console.log('Community data prepared:', communityData.name);
    
    return NextResponse.json(
      { success: true, data: communityData },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch community' },
      { status: 500 }
    );
  }
}