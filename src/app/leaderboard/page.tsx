"use client"

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { Trophy, Flame, Medal, Crown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardUser {
  rank: number;
  id: number;
  username: string;
  fullName: string;
  avatarUrl: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}

export default function LeaderboardPage() {
  const { user } = useUser();
  const [xpLeaderboard, setXpLeaderboard] = useState<LeaderboardUser[]>([]);
  const [streakLeaderboard, setStreakLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const [xpResponse, streakResponse] = await Promise.all([
          fetch('/api/leaderboard?type=xp&limit=50'),
          fetch('/api/leaderboard?type=streak&limit=50')
        ]);

        if (xpResponse.ok) {
          const xpData = await xpResponse.json();
          setXpLeaderboard(xpData.leaderboard);
        }

        if (streakResponse.ok) {
          const streakData = await streakResponse.json();
          setStreakLeaderboard(streakData.leaderboard);
        }
      } catch (error) {
        console.error('Error fetching leaderboards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700';
    return 'bg-muted';
  };

  const renderLeaderboardList = (leaderboard: LeaderboardUser[], type: 'xp' | 'streak') => (
    <div className="space-y-3">
      {leaderboard.map((player, index) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={`${user?.id === player.id ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className={`w-12 h-12 rounded-full ${getRankBadgeColor(player.rank)} flex items-center justify-center font-bold text-white flex-shrink-0`}>
                  {getRankIcon(player.rank) || `#${player.rank}`}
                </div>

                {/* Avatar */}
                <Avatar className="w-12 h-12">
                  <AvatarImage src={player.avatarUrl} alt={player.username} />
                  <AvatarFallback>{player.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{player.fullName || player.username}</p>
                    {user?.id === player.id && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{player.username}</p>
                </div>

                {/* Stats */}
                <div className="text-right">
                  {type === 'xp' ? (
                    <>
                      <p className="text-2xl font-bold">{player.xp.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">XP • Level {player.level}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold flex items-center justify-end gap-1">
                        {player.currentStreak}
                        <Flame className="w-5 h-5 text-orange-500" />
                      </p>
                      <p className="text-sm text-muted-foreground">day streak</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />

        <div className="container px-4 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">Compete with fitness enthusiasts worldwide</p>
          </motion.div>

          {/* Top 3 Podium */}
          {!isLoading && xpLeaderboard.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8"
            >
              {/* Second Place */}
              <div className="flex flex-col items-center pt-8">
                <Avatar className="w-16 h-16 mb-2 ring-4 ring-gray-400">
                  <AvatarImage src={xpLeaderboard[1]?.avatarUrl} />
                  <AvatarFallback>{xpLeaderboard[1]?.username[0]}</AvatarFallback>
                </Avatar>
                <Medal className="w-6 h-6 text-gray-400 mb-1" />
                <p className="font-semibold text-sm text-center">{xpLeaderboard[1]?.username}</p>
                <p className="text-xs text-muted-foreground">{xpLeaderboard[1]?.xp} XP</p>
                <div className="w-full h-24 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg mt-2" />
              </div>

              {/* First Place */}
              <div className="flex flex-col items-center">
                <Avatar className="w-20 h-20 mb-2 ring-4 ring-yellow-500">
                  <AvatarImage src={xpLeaderboard[0]?.avatarUrl} />
                  <AvatarFallback>{xpLeaderboard[0]?.username[0]}</AvatarFallback>
                </Avatar>
                <Crown className="w-8 h-8 text-yellow-500 mb-1" />
                <p className="font-bold text-center">{xpLeaderboard[0]?.username}</p>
                <p className="text-sm text-muted-foreground">{xpLeaderboard[0]?.xp} XP</p>
                <div className="w-full h-32 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg mt-2" />
              </div>

              {/* Third Place */}
              <div className="flex flex-col items-center pt-12">
                <Avatar className="w-14 h-14 mb-2 ring-4 ring-amber-600">
                  <AvatarImage src={xpLeaderboard[2]?.avatarUrl} />
                  <AvatarFallback>{xpLeaderboard[2]?.username[0]}</AvatarFallback>
                </Avatar>
                <Medal className="w-5 h-5 text-amber-600 mb-1" />
                <p className="font-semibold text-xs text-center">{xpLeaderboard[2]?.username}</p>
                <p className="text-xs text-muted-foreground">{xpLeaderboard[2]?.xp} XP</p>
                <div className="w-full h-20 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg mt-2" />
              </div>
            </motion.div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="xp" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="xp">
                <Trophy className="w-4 h-4 mr-2" />
                Top by XP
              </TabsTrigger>
              <TabsTrigger value="streak">
                <Flame className="w-4 h-4 mr-2" />
                Top by Streak
              </TabsTrigger>
            </TabsList>

            <TabsContent value="xp" className="mt-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                renderLeaderboardList(xpLeaderboard, 'xp')
              )}
            </TabsContent>

            <TabsContent value="streak" className="mt-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                renderLeaderboardList(streakLeaderboard, 'streak')
              )}
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
