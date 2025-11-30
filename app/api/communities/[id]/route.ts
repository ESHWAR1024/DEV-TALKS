import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Community from '@/app/models/community';
import bcryptjs from 'bcryptjs';

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

    // Create community
    const community = await Community.create({
      name,
      description,
      password: hashedPassword,
      memberCount: 0,
    });

    // Return without password
    const communityData = {
      _id: community._id,
      name: community.name,
      description: community.description,
      memberCount: community.memberCount,
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