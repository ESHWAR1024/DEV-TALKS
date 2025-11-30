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
    
    console.log('Dashboard route called for community:', communityId);
    
    // Get community
    const community = await Community.findById(communityId);
    
    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }
    
    // Get all ideas for this community
    const ideas = await Idea.find({ communityId });
    
    console.log(`Found ${ideas.length} ideas for community ${communityId}`);
    
    // Calculate statistics
    const totalIdeas = ideas.length;
    const totalVotes = ideas.reduce((sum, idea) => sum + idea.votes.length, 0);
    const totalReplies = ideas.reduce((sum, idea) => sum + idea.replies.length, 0);
    
    const statusCounts = {
      chat: ideas.filter(i => i.status === 'chat').length,
      proceed: ideas.filter(i => i.status === 'proceed').length,
      hold: ideas.filter(i => i.status === 'hold').length,
      discard: ideas.filter(i => i.status === 'discard').length,
    };
    
    // Top contributors (by ideas posted)
    const contributorMap = new Map();
    ideas.forEach(idea => {
      const count = contributorMap.get(idea.userName) || 0;
      contributorMap.set(idea.userName, count + 1);
    });
    
    const topContributors = Array.from(contributorMap.entries())
      .map(([name, count]) => ({ name, ideasPosted: count }))
      .sort((a, b) => b.ideasPosted - a.ideasPosted)
      .slice(0, 5);
    
    // Most voted ideas
    const mostVoted = ideas
      .sort((a, b) => b.votes.length - a.votes.length)
      .slice(0, 5)
      .map(idea => ({
        _id: idea._id,
        title: idea.title,
        userName: idea.userName,
        voteCount: idea.votes.length,
        replyCount: idea.replies.length,
        status: idea.status,
      }));
    
    // Most discussed ideas
    const mostDiscussed = ideas
      .sort((a, b) => b.replies.length - a.replies.length)
      .slice(0, 5)
      .map(idea => ({
        _id: idea._id,
        title: idea.title,
        userName: idea.userName,
        voteCount: idea.votes.length,
        replyCount: idea.replies.length,
        status: idea.status,
      }));
    
    // Recent activity (last 10 ideas)
    const recentActivity = ideas
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(idea => ({
        _id: idea._id,
        title: idea.title,
        userName: idea.userName,
        status: idea.status,
        createdAt: idea.createdAt,
      }));
    
    // Ideas created per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentIdeas = ideas.filter(idea => new Date(idea.createdAt) >= sevenDaysAgo);
    
    const activityByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = recentIdeas.filter(idea => {
        const ideaDate = new Date(idea.createdAt);
        return ideaDate >= date && ideaDate < nextDate;
      }).length;
      
      activityByDay.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      });
    }
    
    const dashboard = {
      statistics: {
        totalIdeas,
        totalVotes,
        totalReplies,
        totalMembers: community.memberCount,
        statusCounts,
      },
      topContributors,
      mostVoted,
      mostDiscussed,
      recentActivity,
      activityByDay,
    };
    
    console.log('Dashboard data prepared successfully');
    
    return NextResponse.json(
      { success: true, data: dashboard },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}