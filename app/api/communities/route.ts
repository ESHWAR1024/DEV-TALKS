import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Community from '@/app/models/community';
import User from '@/app/models/User';
import bcryptjs from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET - Fetch all communities
export async function GET() {
  try {
    await connectDB();
    
    const communities = await Community.find({})
      .select('-password') // Don't send passwords to frontend
      .sort({ createdAt: -1 }); // Newest first
    
    return NextResponse.json({ 
      success: true, 
      data: communities 
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Create new community
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get current user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to create a community' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await User.findOne({ name: session.user.name });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { name, description, password } = body;

    // Validation
    if (!name || !description || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if community name already exists
    const existingCommunity = await Community.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } // Case insensitive
    });

    if (existingCommunity) {
      return NextResponse.json(
        { success: false, error: 'Community name already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create community with creator info and add creator as first member
    const community = await Community.create({
      name,
      description,
      password: hashedPassword,
      creatorId: user._id,
      creatorName: user.name,
      members: [user._id], // Add creator as first member
      memberCount: 1,
    });

    // Add community to user's communities list
    if (!user.communities) {
      user.communities = [];
    }
    if (!user.communities.includes(community._id)) {
      user.communities.push(community._id);
      await user.save();
    }

    // Return without password
    const communityData = {
      _id: community._id,
      name: community.name,
      description: community.description,
      memberCount: community.memberCount,
      creatorName: community.creatorName,
      createdAt: community.createdAt,
    };

    return NextResponse.json(
      { success: true, data: communityData, message: 'Community created successfully!' },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create community' },
      { status: 500 }
    );
  }
}