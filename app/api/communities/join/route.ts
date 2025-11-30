import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Community from '@/app/models/community';
import User from '@/app/models/User';
import bcryptjs from 'bcryptjs';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);

    console.log('🔍 Full Session:', JSON.stringify(session, null, 2));
    
    if (!session || !session.user || !session.user.name) {
      console.log('❌ Authentication failed - No valid session');
      return NextResponse.json(
        { success: false, error: 'You must be logged in to join a community. Please log in again.' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', session.user.name);

    const user = await User.findOne({ name: session.user.name });
    
    if (!user) {
      console.log('❌ User not found in database:', session.user.name);
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    console.log('✅ User found in DB:', user._id);
    
    const body = await request.json();
    const { communityId, password } = body;

    if (!communityId || !password) {
      return NextResponse.json(
        { success: false, error: 'Community ID and password are required' },
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

    console.log('✅ Community found:', community.name);

    // FIX: If community doesn't have creatorId/creatorName, set the first member as creator
    if (!community.creatorId || !community.creatorName) {
      console.log('⚠️ Community missing creator info, fixing...');
      if (community.members && community.members.length > 0) {
        const firstMember = await User.findById(community.members[0]);
        if (firstMember) {
          community.creatorId = firstMember._id;
          community.creatorName = firstMember.name;
          await community.save();
          console.log('✅ Creator info fixed');
        }
      } else {
        // If no members yet, set current user as creator
        community.creatorId = user._id;
        community.creatorName = user.name;
        await community.save();
        console.log('✅ Set current user as creator');
      }
    }

    const isPasswordValid = await bcryptjs.compare(password, community.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    console.log('✅ Password valid');

    if (!community.members) {
      community.members = [];
    }

    const isAlreadyMember = community.members.some(
      (member: any) => member.toString() === user._id.toString()
    );

    if (isAlreadyMember) {
      return NextResponse.json(
        { success: false, error: 'You are already a member of this community' },
        { status: 400 }
      );
    }

    community.members.push(user._id);
    community.memberCount = community.members.length;
    await community.save();

    console.log('✅ User added to community');

    if (!user.communities) {
      user.communities = [];
    }

    if (!user.communities.includes(communityId)) {
      user.communities.push(communityId);
      await user.save();
    }

    console.log('✅ Community added to user profile');

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
    console.error('❌ Error joining community:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred while joining the community' },
      { status: 500 }
    );
  }
}