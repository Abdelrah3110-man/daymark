export interface AvatarDefinition {
  id: string;
  name: string;
  nameAr: string;
  emoji: string;
  iconName: string;
  bgColor: string;
  requiredXP: number; // 0 = unlocked by default
  title: string;
  description: string;
}

export const AVATARS: AvatarDefinition[] = [
  // Starter Avatars (0 XP)
  {
    id: 'fox',
    name: 'Smart Fox',
    nameAr: 'الثعلب الذكي',
    emoji: '🦊',
    iconName: 'paw',
    bgColor: '#FFE3D1',
    requiredXP: 0,
    title: 'Agile & Sharp',
    description: 'Quick to plan, clever in execution.',
  },
  {
    id: 'panda',
    name: 'Zen Panda',
    nameAr: 'الباندا الهادئ',
    emoji: '🐼',
    iconName: 'heart',
    bgColor: '#E2F0D9',
    requiredXP: 0,
    title: 'Calm & Balanced',
    description: 'Maintains steady focus without stress.',
  },
  {
    id: 'lion',
    name: 'Brave Lion',
    nameAr: 'الأسد الشجاع',
    emoji: '🦁',
    iconName: 'shield',
    bgColor: '#FFF0C2',
    requiredXP: 0,
    title: 'Decisive Leader',
    description: 'Tackles tough priorities head-on.',
  },
  {
    id: 'spark',
    name: 'High Voltage',
    nameAr: 'طاقة البرق',
    emoji: '⚡',
    iconName: 'flash',
    bgColor: '#E0F2FE',
    requiredXP: 0,
    title: 'Energetic Mover',
    description: 'Turns intentions into swift momentum.',
  },

  // XP Unlockable Avatars
  {
    id: 'owl',
    name: 'Wise Owl',
    nameAr: 'البومة الحكيمة',
    emoji: '🦉',
    iconName: 'book',
    bgColor: '#EDE9FE',
    requiredXP: 100,
    title: 'The Master Strategist',
    description: 'Unlocks at 100 XP. Sees every week with visionary clarity.',
  },
  {
    id: 'rocket',
    name: 'Rocket Pioneer',
    nameAr: 'رائد الفضاء',
    emoji: '🚀',
    iconName: 'rocket',
    bgColor: '#FCE7F3',
    requiredXP: 300,
    title: 'Goal Launcher',
    description: 'Unlocks at 300 XP. Accelerates tasks to supersonic finish.',
  },
  {
    id: 'crown',
    name: 'Royal Monarch',
    nameAr: 'التاج الملكي',
    emoji: '👑',
    iconName: 'trophy',
    bgColor: '#FEF3C7',
    requiredXP: 600,
    title: 'Sovereign of Habits',
    description: 'Unlocks at 600 XP. Rules over daily routines with distinction.',
  },
  {
    id: 'dragon',
    name: 'Blazing Dragon',
    nameAr: 'التنين الأسطوري',
    emoji: '🐉',
    iconName: 'flame',
    bgColor: '#FFEDD5',
    requiredXP: 1200,
    title: 'Unstoppable Force',
    description: 'Unlocks at 1200 XP. Conquers massive projects effortlessly.',
  },
  {
    id: 'cosmos',
    name: 'Cosmic Sage',
    nameAr: 'حكيم الكون',
    emoji: '🌌',
    iconName: 'planet',
    bgColor: '#DDD6FE',
    requiredXP: 2500,
    title: 'Grandmaster of Time',
    description: 'Unlocks at 2500 XP. Ultimate mastery over mind and productivity.',
  },
];

export function getAvatarById(id?: string): AvatarDefinition {
  const found = AVATARS.find((a) => a.id === id);
  return found || AVATARS[0];
}

export function isAvatarUnlocked(avatarId: string, currentTotalXP: number): boolean {
  const avatar = getAvatarById(avatarId);
  return (currentTotalXP || 0) >= avatar.requiredXP;
}
