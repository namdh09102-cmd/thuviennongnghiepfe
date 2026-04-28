import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'score' | 'crop' | 'region';
}

export interface UserProfile {
  id: string;
  username: string;
  role: string;
  avatar: string;
  points: number;
  badges: Badge[];
  activitiesCount: { posts: number; answers: number; bestAnswers: number };
}

interface GamificationState {
  currentUser: UserProfile;
  leaderboard: UserProfile[];
  addPoints: (amount: number) => void;
  incrementActivity: (type: 'posts' | 'answers' | 'bestAnswers') => void;
}

const ALL_BADGES: Record<string, Badge> = {
  new_member: { id: 'b1', name: 'Thành viên Mới', description: 'Vừa gia nhập đại gia đình Thư viện Nông nghiệp.', icon: '🌱', category: 'score' },
  active_member: { id: 'b2', name: 'Thành viên Tích cực', description: 'Đạt 50 điểm hoạt động.', icon: '☘️', category: 'score' },
  expert: { id: 'b3', name: 'Chuyên gia Nông nghiệp', description: 'Đạt 200 điểm hoạt động.', icon: '👑', category: 'score' },
  rice_farmer: { id: 'b4', name: 'Nông dân Lúa', description: 'Đăng 5 bài viết về cây Lúa.', icon: '🌾', category: 'crop' },
  durian_expert: { id: 'b5', name: 'Chuyên gia Sầu Riêng', description: 'Có câu trả lời về sầu riêng được chọn.', icon: '🍈', category: 'crop' },
  tay_nguyen: { id: 'b6', name: 'Nông dân Tây Nguyên', description: 'Khu vực canh tác thuộc Tây Nguyên.', icon: '☕', category: 'region' },
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set) => ({
      currentUser: {
        id: 'u_current',
        username: 'Nhà Nông 4.0',
        role: 'Nông dân',
        avatar: '👨‍🌾',
        points: 15,
        badges: [ALL_BADGES.new_member, ALL_BADGES.tay_nguyen],
        activitiesCount: { posts: 1, answers: 1, bestAnswers: 0 }
      },
      leaderboard: [
        { id: 'l1', username: 'Lão Nông Tư Đờn', role: 'Lão nông', avatar: '👴', points: 280, badges: [ALL_BADGES.expert, ALL_BADGES.rice_farmer], activitiesCount: { posts: 12, answers: 22, bestAnswers: 5 } },
        { id: 'l2', username: 'KS. Trần Mai', role: 'Kỹ sư BVTV', avatar: '👩‍🔬', points: 210, badges: [ALL_BADGES.expert], activitiesCount: { posts: 5, answers: 18, bestAnswers: 8 } },
        { id: 'l3', username: 'Út Hiền', role: 'Nông dân', avatar: '👩‍🌾', points: 95, badges: [ALL_BADGES.active_member], activitiesCount: { posts: 4, answers: 12, bestAnswers: 2 } },
        { id: 'l4', username: 'Lê Nam', role: 'Nhà vườn', avatar: '👨‍🌾', points: 75, badges: [ALL_BADGES.active_member, ALL_BADGES.durian_expert], activitiesCount: { posts: 6, answers: 7, bestAnswers: 1 } },
        { id: 'l5', username: 'Văn Tám', role: 'Nông dân', avatar: '👨‍🌾', points: 35, badges: [ALL_BADGES.new_member], activitiesCount: { posts: 2, answers: 4, bestAnswers: 0 } },
      ],
      addPoints: (amount) => set((state) => {
        const newPoints = state.currentUser.points + amount;
        const updatedBadges = [...state.currentUser.badges];

        // Tự động nâng cấp badge theo điểm
        if (newPoints >= 50 && !updatedBadges.some(b => b.id === 'b2')) {
          updatedBadges.push(ALL_BADGES.active_member);
        }
        if (newPoints >= 200 && !updatedBadges.some(b => b.id === 'b3')) {
          updatedBadges.push(ALL_BADGES.expert);
        }

        return { currentUser: { ...state.currentUser, points: newPoints, badges: updatedBadges } };
      }),
      incrementActivity: (type) => set((state) => {
        const newCount = { ...state.currentUser.activitiesCount, [type]: state.currentUser.activitiesCount[type] + 1 };
        const updatedBadges = [...state.currentUser.badges];

        if (type === 'posts' && newCount.posts >= 5 && !updatedBadges.some(b => b.id === 'b4')) {
          updatedBadges.push(ALL_BADGES.rice_farmer);
        }

        return { currentUser: { ...state.currentUser, activitiesCount: newCount, badges: updatedBadges } };
      }),
    }),
    {
      name: 'farming-gamification-storage',
    }
  )
);
