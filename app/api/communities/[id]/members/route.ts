import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Community from '../../../../models/community';
import User from '../../../../models/User';
import Idea from '../../../../models/idea';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const communityId = params.id;
    
    // Get community with populated members
    const community = await Community.findById(communityId).populate('members', 'name');
    
    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }
    
    // Get all ideas for stats
    const ideas = await Idea.find({ communityId });
    
    // Build member stats
    const memberStats = await Promise.all(
      community.members.map(async (member: any) => {
        const ideasPosted = ideas.filter(idea => idea.userId.toString() === member._id.toString()).length;
        
        // Count votes cast
        let votesCast = 0;
        ideas.forEach(idea => {
          if (idea.votes.some((v: any) => v.userId.toString() === member._id.toString())) {
            votesCast++;
          }
        });
        
        // Count replies made
        let repliesMade = 0;
        ideas.forEach(idea => {
          repliesMade += idea.replies.filter((r: any) => r.userId.toString() === member._id.toString()).length;
        });
        
        const isCreator = community.creatorId?.toString() === member._id.toString();
        
        return {
          _id: member._id,
          name: member.name,
          isCreator,
          stats: {
            ideasPosted,
            votesCast,
            repliesMade,
            totalActivity: ideasPosted + votesCast + repliesMade
          }
        };
      })
    );
    
    // Sort by total activity
    memberStats.sort((a, b) => b.stats.totalActivity - a.stats.totalActivity);
    
    return NextResponse.json(
      { success: true, data: memberStats },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 