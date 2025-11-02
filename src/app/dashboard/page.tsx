"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { Flame, Zap, TrendingUp, Sparkles, Loader2, Dumbbell, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

const planFormSchema = z.object({
  planType: z.string().min(1, 'Plan type is required'),
  fitnessGoal: z.string().min(1, 'Fitness goal is required'),
  fitnessLevel: z.string().min(1, 'Fitness level is required'),
  age: z.string().min(1, 'Age is required'),
  weight: z.string().min(1, 'Weight is required'),
  height: z.string().min(1, 'Height is required'),
  dietaryPreferences: z.string().optional(),
});

type PlanFormData = z.infer<typeof planFormSchema>;

export default function DashboardPage() {
  const { user, refreshUser, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [greeting, setGreeting] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
  });

  const planType = watch('planType');

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, []);

  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const levelProgress = (user.xp % 100);
  const xpToNextLevel = 100 - levelProgress;

  const onSubmit = async (data: PlanFormData) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...data,
          age: parseInt(data.age),
          weight: parseFloat(data.weight),
          height: parseFloat(data.height),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/plan/${result.planId}`);
      } else {
        alert('Failed to generate plan. Please try again.');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />
        
        <div className="container px-4 py-8 space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-3xl md:text-4xl font-bold">
              {greeting}, {user.fullName || user.username}! 👋
            </h1>
            <p className="text-muted-foreground">Ready to crush your fitness goals today?</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-3xl font-bold">{user.currentStreak}</p>
                      <p className="text-xs text-muted-foreground">days 🔥</p>
                    </div>
                    <div className="p-3 bg-orange-500/20 rounded-full">
                      <Flame className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total XP</p>
                      <p className="text-3xl font-bold">{user.xp}</p>
                      <p className="text-xs text-muted-foreground">{xpToNextLevel} to next level</p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-full">
                      <Zap className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="text-3xl font-bold">{user.level}</p>
                      <div className="mt-2">
                        <Progress value={levelProgress} className="h-2" />
                      </div>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <TrendingUp className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Longest Streak</p>
                      <p className="text-3xl font-bold">{user.longestStreak}</p>
                      <p className="text-xs text-muted-foreground">days record 🏆</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <Sparkles className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Plan Generation Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Generate Your AI Fitness Plan
                </CardTitle>
                <CardDescription>
                  Fill in your details and let our AI create a personalized workout and diet plan for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Plan Type */}
                    <div className="space-y-2">
                      <Label htmlFor="planType">Plan Type *</Label>
                      <Select onValueChange={(value) => setValue('planType', value)}>
                        <SelectTrigger id="planType">
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="workout">Workout Only</SelectItem>
                          <SelectItem value="diet">Diet Only</SelectItem>
                          <SelectItem value="combined">Combined (Workout + Diet)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.planType && <p className="text-sm text-destructive">{errors.planType.message}</p>}
                    </div>

                    {/* Fitness Goal */}
                    <div className="space-y-2">
                      <Label htmlFor="fitnessGoal">Fitness Goal *</Label>
                      <Select onValueChange={(value) => setValue('fitnessGoal', value)}>
                        <SelectTrigger id="fitnessGoal">
                          <SelectValue placeholder="Select your goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight-loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                          <SelectItem value="endurance">Build Endurance</SelectItem>
                          <SelectItem value="flexibility">Improve Flexibility</SelectItem>
                          <SelectItem value="general-fitness">General Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.fitnessGoal && <p className="text-sm text-destructive">{errors.fitnessGoal.message}</p>}
                    </div>

                    {/* Fitness Level */}
                    <div className="space-y-2">
                      <Label htmlFor="fitnessLevel">Fitness Level *</Label>
                      <Select onValueChange={(value) => setValue('fitnessLevel', value)}>
                        <SelectTrigger id="fitnessLevel">
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.fitnessLevel && <p className="text-sm text-destructive">{errors.fitnessLevel.message}</p>}
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        {...register('age')}
                      />
                      {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="70"
                        {...register('weight')}
                      />
                      {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
                    </div>

                    {/* Height */}
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm) *</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        placeholder="170"
                        {...register('height')}
                      />
                      {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
                    </div>
                  </div>

                  {/* Dietary Preferences (conditional) */}
                  {(planType === 'diet' || planType === 'combined') && (
                    <div className="space-y-2">
                      <Label htmlFor="dietaryPreferences">Dietary Preferences (Optional)</Label>
                      <Textarea
                        id="dietaryPreferences"
                        placeholder="E.g., vegetarian, vegan, allergies, food preferences..."
                        {...register('dietaryPreferences')}
                      />
                      {errors.dietaryPreferences && <p className="text-sm text-destructive">{errors.dietaryPreferences.message}</p>}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Your Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate AI Plan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          {user.stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Your Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{user.stats.totalLoginDays}</p>
                      <p className="text-sm text-muted-foreground">Login Days</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{user.stats.totalQuizzes}</p>
                      <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{user.stats.totalAchievements}</p>
                      <p className="text-sm text-muted-foreground">Achievements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
