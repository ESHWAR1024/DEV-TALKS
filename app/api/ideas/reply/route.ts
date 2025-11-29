

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Idea from '../../../models/idea';
import User from '../../../models/User';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

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
    
    // Add reply
    idea.replies.push({
      userId: user._id,
      userName: user.name,
      content,
      createdAt: new Date()
    });
    
    await idea.save();
    
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