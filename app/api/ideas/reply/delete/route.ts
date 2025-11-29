import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Idea from '../../../../models/idea';
import User from '../../../../models/User';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function DELETE(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');
    const replyId = searchParams.get('replyId');
    
    if (!ideaId || !replyId) {
      return NextResponse.json(
        { success: false, error: 'Idea ID and Reply ID are required' },
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
    
    // Find the reply
    const reply = idea.replies.id(replyId);
    
    if (!reply) {
      return NextResponse.json(
        { success: false, error: 'Reply not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the author
    if (reply.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own replies' },
        { status: 403 }
      );
    }
    
    // Remove reply using pull
    idea.replies.pull(replyId);
    await idea.save();
    
    return NextResponse.json(
      { success: true, data: idea, message: 'Reply deleted successfully' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error deleting reply:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}