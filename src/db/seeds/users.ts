import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const now = new Date();
    const getRecentDate = (daysAgo: number) => {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    };

    const sampleUsers = [
        {
            username: 'FitWarrior',
            email: 'fitwarrior@fitness.app',
            fullName: 'Marcus Rodriguez',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FitWarrior',
            xp: 5000,
            level: 51,
            currentStreak: 30,
            longestStreak: 35,
            lastLoginDate: getRecentDate(0),
            isGuest: false,
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            username: 'IronPulse',
            email: 'ironpulse@fitness.app',
            fullName: 'Sarah Chen',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IronPulse',
            xp: 4200,
            level: 43,
            currentStreak: 25,
            longestStreak: 28,
            lastLoginDate: getRecentDate(1),
            isGuest: false,
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            username: 'ZenAthlete',
            email: 'zenathlete@fitness.app',
            fullName: 'David Kim',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZenAthlete',
            xp: 3500,
            level: 36,
            currentStreak: 20,
            longestStreak: 25,
            lastLoginDate: getRecentDate(2),
            isGuest: false,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            username: 'PowerLift',
            email: 'powerlift@fitness.app',
            fullName: 'Jessica Martinez',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PowerLift',
            xp: 2800,
            level: 29,
            currentStreak: 15,
            longestStreak: 20,
            lastLoginDate: getRecentDate(3),
            isGuest: false,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            username: 'FlexMaster',
            email: 'flexmaster@fitness.app',
            fullName: 'Ryan Thompson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FlexMaster',
            xp: 2100,
            level: 22,
            currentStreak: 12,
            longestStreak: 15,
            lastLoginDate: getRecentDate(4),
            isGuest: false,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            username: 'CardioKing',
            email: 'cardioking@fitness.app',
            fullName: 'Michael Johnson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CardioKing',
            xp: 1500,
            level: 16,
            currentStreak: 10,
            longestStreak: 12,
            lastLoginDate: getRecentDate(5),
            isGuest: false,
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            username: 'MuscleQueen',
            email: 'musclequeen@fitness.app',
            fullName: 'Emily Anderson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MuscleQueen',
            xp: 1000,
            level: 11,
            currentStreak: 7,
            longestStreak: 10,
            lastLoginDate: getRecentDate(6),
            isGuest: false,
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            username: 'YogaFlow',
            email: 'yogaflow@fitness.app',
            fullName: 'Olivia Parker',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YogaFlow',
            xp: 600,
            level: 7,
            currentStreak: 5,
            longestStreak: 7,
            lastLoginDate: getRecentDate(1),
            isGuest: false,
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            username: 'SprintStar',
            email: 'sprintstar@fitness.app',
            fullName: 'James Wilson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SprintStar',
            xp: 300,
            level: 4,
            currentStreak: 3,
            longestStreak: 5,
            lastLoginDate: getRecentDate(2),
            isGuest: false,
            createdAt: new Date('2024-02-15').toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            username: 'EnduranceElite',
            email: 'enduranceelite@fitness.app',
            fullName: 'Sophia Lee',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EnduranceElite',
            xp: 100,
            level: 2,
            currentStreak: 1,
            longestStreak: 3,
            lastLoginDate: getRecentDate(0),
            isGuest: false,
            createdAt: new Date('2024-02-20').toISOString(),
            updatedAt: now.toISOString(),
        },
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});