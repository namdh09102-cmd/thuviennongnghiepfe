import { supabaseAdmin } from './supabase';

export type NotificationType = 
  | 'comment_on_post' 
  | 'reply_to_comment' 
  | 'answer_to_question' 
  | 'expert_answer' 
  | 'best_answer' 
  | 'level_up' 
  | 'badge_earned' 
  | 'post_approved'
  | 'post_rejected'
  | 'like_post'
  | 'follow_user'
  | 'daily_reminder';

interface NotificationData {
  actor_name?: string;
  actor_avatar?: string;
  post_slug?: string;
  post_title?: string;
  question_id?: string;
  question_title?: string;
  badge_name?: string;
  level?: number;
  reason?: string;
}

export async function createNotification(
  userId: string, 
  type: NotificationType, 
  data: NotificationData,
  actorId?: string,
  entityType?: 'post' | 'comment' | 'question' | 'user' | 'system',
  entityId?: string
) {
  // Don't notify yourself
  if (userId === actorId) return;

  const { error } = await supabaseAdmin
    .from('notifications')
    .insert([{
      user_id: userId,
      actor_id: actorId,
      type,
      entity_type: entityType,
      entity_id: entityId,
      data,
      is_read: false
    }]);

  if (error) {
    console.error('Failed to create notification:', error);
  }
}

// Background version
export function createNotificationAsync(...args: Parameters<typeof createNotification>) {
  createNotification(...args).catch(console.error);
}

