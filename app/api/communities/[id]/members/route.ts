import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Community from '@/app/models/community';
import Idea from '@/app/models/idea';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Await the params in Next.js 15+
    const { id: communityId } = await context.params;
    
    console.log('Members route called for community:', communityId);
    
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
    
    console.log(`Found ${community.members.length} members and ${ideas.length} ideas`);
    
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
    
    console.log('Member stats prepared successfully');
    
    return NextResponse.json(
      { success: true, data: memberStats },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch members' },
      { status: 500 }
    );
  }
}