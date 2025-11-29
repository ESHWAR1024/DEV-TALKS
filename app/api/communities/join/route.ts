import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Community from '../../../models/community';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get current user from NextAuth session
    const session = await getServerSession(authOptions);

    console.log('🔍 Session check:', session);
    console.log('🔍 User:', session?.user);
    console.log('🔍 User name:', session?.user?.name);




    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to join a community' },
        { status: 401 }
      );
    }

    // Get user from database using name from session
    const user = await User.findOne({ name: session.user.name });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { communityId, password } = body;

    if (!communityId || !password) {
      return NextResponse.json(
        { success: false, error: 'Community ID and password are required' },
        { status: 400 }
      );
    }

    // Find community
    const community = await Community.findById(communityId);

    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, community.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Check if user is already a member
    const isAlreadyMember = community.members.some(
      (member: any) => member.toString() === user._id.toString()
    );

    if (isAlreadyMember) {
      return NextResponse.json(
        { success: false, error: 'You are already a member of this community' },
        { status: 400 }
      );
    }

    // Add user to community members
    community.members.push(user._id);
    community.memberCount = community.members.length;
    await community.save();

    // Add community to user's communities list
    if (!user.communities.includes(communityId)) {
      user.communities.push(communityId);
      await user.save();
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully joined community!',
        data: {
          _id: community._id,
          name: community.name,
          description: community.description,
          memberCount: community.memberCount,
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error joining community:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}