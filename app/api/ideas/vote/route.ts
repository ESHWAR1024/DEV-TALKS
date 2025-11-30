import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Idea from '../../../models/idea';
import User from '../../../models/User';
import Community from '../../../models/community';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { createVoteNotification, createIdeaMovedNotification } from '../../../lib/notification';

export async function POST(request: NextRequest) {
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
    
    const body = await request.json();
    const { ideaId, voteType } = body;
    
    if (!ideaId || !voteType) {
      return NextResponse.json(
        { success: false, error: 'Idea ID and vote type are required' },
        { status: 400 }
      );
    }
    
    if (!['proceed', 'hold', 'discard'].includes(voteType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vote type' },
        { status: 400 }
      );
    }
    
    const idea = await Idea.findById(ideaId);
    
    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea not found' },
        { status: 404 }
      );
    }
    
    // Get community to check total members
    const community = await Community.findById(idea.communityId);
    
    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }
    
    // Check if user already voted
    const existingVoteIndex = idea.votes.findIndex(
      (v: any) => v.userId.toString() === user._id.toString()
    );
    
    if (existingVoteIndex !== -1) {
      // Update existing vote
      idea.votes[existingVoteIndex].voteType = voteType;
    } else {
      // Add new vote
      idea.votes.push({
        userId: user._id,
        userName: user.name,
        voteType
      });
    }
    
    // Check if all members have voted the same
    const totalMembers = community.memberCount;
    const proceedVotes = idea.votes.filter((v: any) => v.voteType === 'proceed').length;
    const holdVotes = idea.votes.filter((v: any) => v.voteType === 'hold').length;
    const discardVotes = idea.votes.filter((v: any) => v.voteType === 'discard').length;
    
    console.log(`Vote counts - Proceed: ${proceedVotes}, Hold: ${holdVotes}, Discard: ${discardVotes}, Total Members: ${totalMembers}`);
    
    // Create vote notification for idea author
    await createVoteNotification(
      idea.userId.toString(),
      idea.userName,
      idea._id.toString(),
      idea.title,
      community._id.toString(),
      community.name,
      user._id.toString(),
      user.name,
      voteType
    );
    
    // If everyone voted the same, move the idea
    if (proceedVotes === totalMembers) {
      idea.status = 'proceed';
      idea.movedAt = new Date();
      console.log(`✅ Idea "${idea.title}" moved to PROCEED`);
      
      // Notify author their idea moved
      await createIdeaMovedNotification(
        idea.userId.toString(),
        idea.userName,
        idea._id.toString(),
        idea.title,
        community._id.toString(),
        community.name,
        'proceed'
      );
    } else if (holdVotes === totalMembers) {
      idea.status = 'hold';
      idea.movedAt = new Date();
      console.log(`⏸️ Idea "${idea.title}" moved to HOLD`);
      
      await createIdeaMovedNotification(
        idea.userId.toString(),
        idea.userName,
        idea._id.toString(),
        idea.title,
        community._id.toString(),
        community.name,
        'hold'
      );
    } else if (discardVotes === totalMembers) {
      idea.status = 'discard';
      idea.movedAt = new Date();
      console.log(`❌ Idea "${idea.title}" moved to DISCARD`);
      
      await createIdeaMovedNotification(
        idea.userId.toString(),
        idea.userName,
        idea._id.toString(),
        idea.title,
        community._id.toString(),
        community.name,
        'discard'
      );
    }
    
    await idea.save();
    
    return NextResponse.json(
      { 
        success: true, 
        data: idea,
        message: idea.movedAt ? `Idea moved to ${idea.status.toUpperCase()}!` : 'Vote recorded'
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error voting:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}