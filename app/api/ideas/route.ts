import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import Idea from '../../models/idea';
import User from '../../models/User';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

// GET - Fetch ideas for a community
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId');
    
    if (!communityId) {
      return NextResponse.json(
        { success: false, error: 'Community ID is required' },
        { status: 400 }
      );
    }
    
    // 🗑️ AUTO-CLEANUP: Delete discarded ideas older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const deleteResult = await Idea.deleteMany({
      communityId,
      status: 'discard',
      movedAt: { $lte: sevenDaysAgo, $ne: null }
    });
    
    if (deleteResult.deletedCount > 0) {
      console.log(`🗑️ Auto-deleted ${deleteResult.deletedCount} old discarded ideas from community ${communityId}`);
    }
    
    // Fetch remaining ideas
    const ideas = await Idea.find({ communityId })
      .sort({ createdAt: -1 });
    
    return NextResponse.json(
      { success: true, data: ideas },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new idea
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
    const { communityId, title, content } = body;
    
    if (!communityId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    const idea = await Idea.create({
      communityId,
      userId: user._id,
      userName: user.name,
      title,
      content,
      status: 'chat',
      votes: [],
      replies: []
    });
    
    return NextResponse.json(
      { success: true, data: idea },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creating idea:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}