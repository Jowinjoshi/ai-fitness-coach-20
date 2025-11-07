"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { Download, TrendingUp, Trophy, Flame, Zap, Calendar, Award, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleDownloadReport = () => {
    if (!user) return;

    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Header
      doc.setFontSize(24);
      doc.setTextColor(139, 92, 246);
      doc.text('AI Fitness Coach Report', 105, yPos, { align: 'center' });
      yPos += 15;

      // User Info
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`User: ${user.fullName || user.username}`, 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 15;

      // Stats Section
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Performance Statistics', 20, yPos);
      yPos += 10;

      const statsData = [
        ['Metric', 'Value'],
        ['Total XP', user.xp.toLocaleString()],
        ['Current Level', user.level.toString()],
        ['Current Streak', `${user.currentStreak} days`],
        ['Longest Streak', `${user.longestStreak} days`],
        ['Total Achievements', (user.stats?.totalAchievements || 0).toString()],
        ['Quizzes Completed', (user.stats?.totalQuizzes || 0).toString()],
        ['Total Login Days', (user.stats?.totalLoginDays || 0).toString()],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [statsData[0]],
        body: statsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        margin: { left: 20, right: 20 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Progress to Next Level
      doc.setFontSize(16);
      doc.text('Level Progress', 20, yPos);
      yPos += 10;

      const levelProgress = user.xp % 100;
      const xpToNextLevel = 100 - levelProgress;

      doc.setFontSize(12);
      doc.text(`Current: Level ${user.level} (${user.xp} XP)`, 20, yPos);
      yPos += 7;
      doc.text(`Next Level: Level ${user.level + 1} (${user.level * 100 + 100} XP)`, 20, yPos);
      yPos += 7;
      doc.text(`Progress: ${levelProgress}% (${xpToNextLevel} XP to go)`, 20, yPos);
      yPos += 15;

      // Achievements & Milestones
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.text('Achievements & Milestones', 20, yPos);
      yPos += 10;

      const achievements = [];
      
      if (user.currentStreak >= 7) achievements.push('🔥 7-Day Streak Master');
      if (user.currentStreak >= 30) achievements.push('🔥 30-Day Warrior');
      if (user.longestStreak >= 50) achievements.push('💪 50-Day Champion');
      if (user.level >= 10) achievements.push('⭐ Level 10 Achieved');
      if (user.level >= 50) achievements.push('👑 Level 50 Elite');
      if (user.xp >= 1000) achievements.push('💎 1000 XP Milestone');
      if (user.xp >= 5000) achievements.push('🏆 5000 XP Legend');
      if ((user.stats?.totalQuizzes || 0) >= 10) achievements.push('🎓 Quiz Master (10+)');
      if ((user.stats?.totalLoginDays || 0) >= 30) achievements.push('📅 30 Days Active');

      if (achievements.length > 0) {
        doc.setFontSize(12);
        achievements.forEach(achievement => {
          doc.text(`• ${achievement}`, 25, yPos);
          yPos += 7;
        });
      } else {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Keep training to unlock achievements!', 20, yPos);
        yPos += 7;
      }

      yPos += 10;

      // Recommendations
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Personalized Recommendations', 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      const recommendations = [
        `Maintain your ${user.currentStreak}-day streak by logging in daily`,
        'Complete fitness quizzes to boost your XP and knowledge',
        'Generate personalized workout plans from the dashboard',
        'Check the leaderboard to see how you rank against others',
        `Reach Level ${user.level + 5} by earning ${(user.level + 5) * 100 - user.xp} more XP`,
      ];

      recommendations.forEach(rec => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${rec}`, 25, yPos);
        yPos += 7;
      });

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `AI Fitness Coach 2.0 | Page ${i} of ${pageCount}`,
          105,
          285,
          { align: 'center' }
        );
      }

      doc.save(`fitness-report-${user.username}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF report. Please try again.');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const levelProgress = user.xp % 100;
  const xpToNextLevel = 100 - levelProgress;

  const achievements = [];
  if (user.currentStreak >= 7) achievements.push({ icon: '🔥', title: '7-Day Streak Master', desc: 'Maintained 7 consecutive days' });
  if (user.currentStreak >= 30) achievements.push({ icon: '🔥', title: '30-Day Warrior', desc: 'Maintained 30 consecutive days' });
  if (user.level >= 10) achievements.push({ icon: '⭐', title: 'Level 10 Achieved', desc: 'Reached Level 10' });
  if (user.level >= 50) achievements.push({ icon: '👑', title: 'Level 50 Elite', desc: 'Reached Level 50' });
  if (user.xp >= 1000) achievements.push({ icon: '💎', title: '1000 XP Milestone', desc: 'Earned 1000 total XP' });
  if (user.xp >= 5000) achievements.push({ icon: '🏆', title: '5000 XP Legend', desc: 'Earned 5000 total XP' });

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />

        <div className="container px-4 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Fitness Report</h1>
              <p className="text-muted-foreground">Your complete performance overview</p>
            </div>
            <Button onClick={handleDownloadReport} size="lg">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total XP</p>
                      <p className="text-3xl font-bold">{user.xp.toLocaleString()}</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Level</p>
                      <p className="text-3xl font-bold">{user.level}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-3xl font-bold">{user.currentStreak}</p>
                      <p className="text-xs text-muted-foreground">days</p>
                    </div>
                    <Flame className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Longest Streak</p>
                      <p className="text-3xl font-bold">{user.longestStreak}</p>
                      <p className="text-xs text-muted-foreground">days record</p>
                    </div>
                    <Trophy className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Level Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Level Progress</CardTitle>
                <CardDescription>Track your journey to the next level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Level {user.level}</span>
                  <span className="text-muted-foreground">{xpToNextLevel} XP to Level {user.level + 1}</span>
                </div>
                <Progress value={levelProgress} className="h-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{user.xp} XP</span>
                  <span>{user.level * 100 + 100} XP</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Login Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{user.stats?.totalLoginDays || 0}</p>
                  <p className="text-sm text-muted-foreground">Total active days</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-500" />
                    Quizzes Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{user.stats?.totalQuizzes || 0}</p>
                  <p className="text-sm text-muted-foreground">Knowledge tests taken</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{achievements.length}</p>
                  <p className="text-sm text-muted-foreground">Milestones reached</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <Card>
              <CardHeader>
                <CardTitle>Unlocked Achievements</CardTitle>
                <CardDescription>Your fitness milestones and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{achievement.icon}</span>
                          <div>
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Keep training to unlock achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}