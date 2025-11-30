import Notification from '../models/Notification';
import { connectDB } from './mongodb';

interface CreateNotificationParams {
  userId: string;
  userName: string;
  type: 'reply' | 'vote' | 'idea_moved' | 'new_idea';
  message: string;
  ideaId: string;
  ideaTitle: string;
  communityId: string;
  communityName: string;
  fromUserId?: string;
  fromUserName?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await connectDB();
    
    // Don't create notification if user is notifying themselves
    if (params.fromUserId && params.userId === params.fromUserId) {
      return null;
    }
    
    const notification = await Notification.create({
      userId: params.userId,
      userName: params.userName,
      type: params.type,
      message: params.message,
      ideaId: params.ideaId,
      ideaTitle: params.ideaTitle,
      communityId: params.communityId,
      communityName: params.communityName,
      fromUserId: params.fromUserId || null,
      fromUserName: params.fromUserName || null,
      isRead: false,
      createdAt: new Date()
    });
    
    console.log(`✅ Notification created for ${params.userName}: ${params.message}`);
    return notification;
    
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

export async function createReplyNotification(
  ideaAuthorId: string,
  ideaAuthorName: string,
  ideaId: string,
  ideaTitle: string,
  communityId: string,
  communityName: string,
  replyAuthorId: string,
  replyAuthorName: string
) {
  return createNotification({
    userId: ideaAuthorId,
    userName: ideaAuthorName,
    type: 'reply',
    message: `${replyAuthorName} replied to your idea "${ideaTitle}"`,
    ideaId,
    ideaTitle,
    communityId,
    communityName,
    fromUserId: replyAuthorId,
    fromUserName: replyAuthorName
  });
}

export async function createVoteNotification(
  ideaAuthorId: string,
  ideaAuthorName: string,
  ideaId: string,
  ideaTitle: string,
  communityId: string,
  communityName: string,
  voterId: string,
  voterName: string,
  voteType: string
) {
  return createNotification({
    userId: ideaAuthorId,
    userName: ideaAuthorName,
    type: 'vote',
    message: `${voterName} voted "${voteType}" on your idea "${ideaTitle}"`,
    ideaId,
    ideaTitle,
    communityId,
    communityName,
    fromUserId: voterId,
    fromUserName: voterName
  });
}

export async function createIdeaMovedNotification(
  ideaAuthorId: string,
  ideaAuthorName: string,
  ideaId: string,
  ideaTitle: string,
  communityId: string,
  communityName: string,
  newStatus: string
) {
  const statusEmoji = {
    proceed: '✅',
    hold: '⏸️',
    discard: '❌'
  }[newStatus] || '📌';
  
  return createNotification({
    userId: ideaAuthorId,
    userName: ideaAuthorName,
    type: 'idea_moved',
    message: `${statusEmoji} Your idea "${ideaTitle}" moved to ${newStatus.toUpperCase()}`,
    ideaId,
    ideaTitle,
    communityId,
    communityName
  });
}