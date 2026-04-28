import { supabaseAdmin } from './supabase';

type NotificationType = 
  | 'comment_on_post' 
  | 'reply_to_comment' 
  | 'answer_to_question' 
  | 'best_answer' 
  | 'level_up' 
  | 'badge_earned' 
  | 'post_approved';

interface NotificationData {
  actor_name: string;
  actor_avatar?: string;
  post_slug?: string;
  post_title?: string;
  question_id?: string;
  question_title?: string;
  badge_name?: string;
  level?: number;
}

export async function createNotification(
  userId: string, 
  type: NotificationType, 
  data: NotificationData
) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .insert([{
      user_id: userId,
      type,
      data,
      is_read: false
    }]);

  if (error) {
    console.error('Failed to create notification:', error);
  }
}
