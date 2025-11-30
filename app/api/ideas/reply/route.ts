import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Idea from '../../../models/idea';
import User from '../../../models/User';
import Community from '../../../models/community';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { createReplyNotification } from '../../../lib/notification';

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
    const { ideaId, content } = body;
    
    if (!ideaId || !content) {
      return NextResponse.json(
        { success: false, error: 'Idea ID and content are required' },
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
    
    // Get community for notification
    const community = await Community.findById(idea.communityId);
    
    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }
    
    // Add reply
    idea.replies.push({
      userId: user._id,
      userName: user.name,
      content,
      createdAt: new Date()
    });
    
    await idea.save();
    
    // Create notification for idea author (if not replying to own idea)
    if (idea.userId.toString() !== user._id.toString()) {
      await createReplyNotification(
        idea.userId.toString(),
        idea.userName,
        idea._id.toString(),
        idea.title,
        community._id.toString(),
        community.name,
        user._id.toString(),
        user.name
      );
    }
    
    return NextResponse.json(
      { success: true, data: idea },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error adding reply:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}