import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Idea from '../../../models/idea';
import User from '../../../models/User';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function PUT(request: NextRequest) {
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
    const { ideaId, title, content } = body;
    
    if (!ideaId || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
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
    
    // Check if user is the author
    if (idea.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own ideas' },
        { status: 403 }
      );
    }
    
    // Can only edit ideas in CHAT status (not moved yet)
    if (idea.status !== 'chat') {
      return NextResponse.json(
        { success: false, error: 'Cannot edit ideas that have been moved from CHAT' },
        { status: 400 }
      );
    }
    
    // Update idea
    idea.title = title;
    idea.content = content;
    idea.isEdited = true;
    idea.editedAt = new Date();
    
    await idea.save();
    
    return NextResponse.json(
      { success: true, data: idea, message: 'Idea updated successfully' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error editing idea:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}