import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Community from '../../../../models/community';
import User from '../../../../models/User';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    const currentUser = await User.findOne({ name: session.user.name });
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const communityId = params.id;
    const body = await request.json();
    const { memberId } = body;
    
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }
    
    const community = await Community.findById(communityId);
    
    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }
    
    // Check if current user is admin (creator)
    if (community.creatorId.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Only the community creator can kick members' },
        { status: 403 }
      );
    }
    
    // Can't kick yourself
    if (memberId === currentUser._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'You cannot kick yourself' },
        { status: 400 }
      );
    }
    
    // Can't kick the creator
    if (memberId === community.creatorId.toString()) {
      return NextResponse.json(
        { success: false, error: 'Cannot kick the community creator' },
        { status: 400 }
      );
    }
    
    // Remove member from community
    community.members = community.members.filter(
      (id: any) => id.toString() !== memberId
    );
    community.memberCount = community.members.length;
    await community.save();
    
    // Remove community from user's communities
    const memberUser = await User.findById(memberId);
    if (memberUser) {
      memberUser.communities = memberUser.communities.filter(
        (id: any) => id.toString() !== communityId
      );
      await memberUser.save();
    }
    
    return NextResponse.json(
      { success: true, message: 'Member removed successfully' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error kicking member:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}