"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { Dumbbell, UtensilsCrossed, Sparkles, Download, Volume2, VolumeX, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import Link from 'next/link';

interface Plan {
  id: number;
  planType: string;
  fitnessGoal: string;
  fitnessLevel: string;
  age: number;
  weight: number;
  height: number;
  workoutContent: any;
  dietContent: any;
  motivationContent: any;
  createdAt: string;
}

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTab, setCurrentTab] = useState('workout');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/plan/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPlan(data);
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [params.id, router]);

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let textToSpeak = '';

    if (currentTab === 'workout' && plan?.workoutContent) {
      textToSpeak = `Workout Plan. `;
      plan.workoutContent.weeklySchedule?.forEach((day: any) => {
        textToSpeak += `${day.day}, focusing on ${day.focus}. `;
        day.exercises?.forEach((ex: any) => {
          textToSpeak += `${ex.name}, ${ex.sets} sets of ${ex.reps} reps. `;
        });
      });
    } else if (currentTab === 'diet' && plan?.dietContent) {
      textToSpeak = `Diet Plan. Daily calorie target: ${plan.dietContent.dailyCalories} calories. `;
      plan.dietContent.meals?.forEach((meal: any) => {
        textToSpeak += `${meal.meal} at ${meal.time}. `;
        meal.foods?.forEach((food: any) => {
          textToSpeak += `${food.name}, ${food.calories} calories. `;
        });
      });
    } else if (currentTab === 'motivation' && plan?.motivationContent) {
      textToSpeak = `Motivation. ${plan.motivationContent.quote}. `;
      plan.motivationContent.tips?.forEach((tip: string) => {
        textToSpeak += `${tip}. `;
      });
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleDownloadPDF = () => {
    if (!plan) return;

    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.text('AI Fitness Plan', 105, yPos, { align: 'center' });
      yPos += 10;

      // User Info
      doc.setFontSize(12);
      doc.text(`Goal: ${plan.fitnessGoal} | Level: ${plan.fitnessLevel}`, 105, yPos, { align: 'center' });
      yPos += 10;

      // Workout Section
      if (plan.workoutContent && plan.workoutContent.weeklySchedule) {
        doc.setFontSize(16);
        doc.text('Workout Plan', 20, yPos);
        yPos += 10;

        plan.workoutContent.weeklySchedule.forEach((day: any) => {
          doc.setFontSize(14);
          doc.text(`${day.day} - ${day.focus}`, 20, yPos);
          yPos += 7;

          const exercises = day.exercises?.map((ex: any) => [
            ex.name,
            `${ex.sets} sets`,
            ex.reps,
            ex.rest
          ]) || [];

          autoTable(doc, {
            startY: yPos,
            head: [['Exercise', 'Sets', 'Reps', 'Rest']],
            body: exercises,
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246] },
          });

          yPos = (doc as any).lastAutoTable.finalY + 10;
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
        });
      }

      // Diet Section
      if (plan.dietContent && plan.dietContent.meals) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.text('Diet Plan', 20, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.text(`Daily Calories: ${plan.dietContent.dailyCalories || 'N/A'}`, 20, yPos);
        yPos += 10;

        plan.dietContent.meals.forEach((meal: any) => {
          doc.setFontSize(14);
          doc.text(`${meal.meal} - ${meal.time}`, 20, yPos);
          yPos += 7;

          const foods = meal.foods?.map((food: any) => [
            food.name,
            `${food.calories} cal`,
            food.protein || 'N/A',
            food.carbs || 'N/A',
            food.fats || 'N/A'
          ]) || [];

          autoTable(doc, {
            startY: yPos,
            head: [['Food', 'Calories', 'Protein', 'Carbs', 'Fats']],
            body: foods,
            theme: 'grid',
            headStyles: { fillColor: [34, 197, 94] },
          });

          yPos = (doc as any).lastAutoTable.finalY + 10;
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
        });
      }

      doc.save(`fitness-plan-${plan.id}.pdf`);
      toast.success('Plan downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Plan not found</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Navbar />

        <div className="container px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">Your AI-Generated Plan</h1>
              <p className="text-muted-foreground">
                {plan.fitnessGoal} • {plan.fitnessLevel} Level
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTextToSpeech} variant="outline">
                {isSpeaking ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                {isSpeaking ? 'Stop' : 'Read Aloud'}
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              {(plan.planType === 'workout' || plan.planType === 'combined') && (
                <TabsTrigger value="workout">
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Workout
                </TabsTrigger>
              )}
              {(plan.planType === 'diet' || plan.planType === 'combined') && (
                <TabsTrigger value="diet">
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Diet
                </TabsTrigger>
              )}
              <TabsTrigger value="motivation">
                <Sparkles className="w-4 h-4 mr-2" />
                Motivation
              </TabsTrigger>
            </TabsList>

            {/* Workout Tab */}
            {plan.workoutContent && (
              <TabsContent value="workout" className="space-y-4">
                {plan.workoutContent.weeklySchedule?.map((day: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {day.day}
                          <Badge>{day.focus}</Badge>
                        </CardTitle>
                        <CardDescription>Duration: {day.duration}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {day.exercises?.map((exercise: any, exIdx: number) => (
                          <div key={exIdx} className="p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2">{exercise.name}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Sets:</span> {exercise.sets}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Reps:</span> {exercise.reps}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Rest:</span> {exercise.rest}
                              </div>
                            </div>
                            {exercise.notes && (
                              <p className="text-sm text-muted-foreground mt-2">💡 {exercise.notes}</p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {plan.workoutContent.tips && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Workout Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {plan.workoutContent.tips.map((tip: string, idx: number) => (
                          <li key={idx} className="text-muted-foreground">{tip}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            {/* Diet Tab */}
            {plan.dietContent && (
              <TabsContent value="diet" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Nutrition Target</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Calories</p>
                        <p className="text-2xl font-bold">{plan.dietContent.dailyCalories}</p>
                      </div>
                      {plan.dietContent.macros && (
                        <>
                          <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">Protein</p>
                            <p className="text-2xl font-bold">{plan.dietContent.macros.protein}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">Carbs</p>
                            <p className="text-2xl font-bold">{plan.dietContent.macros.carbs}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">Fats</p>
                            <p className="text-2xl font-bold">{plan.dietContent.macros.fats}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {plan.dietContent.meals?.map((meal: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {meal.meal}
                          <Badge variant="outline">{meal.time}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {meal.foods?.map((food: any, foodIdx: number) => (
                          <div key={foodIdx} className="p-3 bg-muted rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{food.name}</h4>
                              <Badge>{food.calories} cal</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                              <div>Protein: {food.protein || 'N/A'}</div>
                              <div>Carbs: {food.carbs || 'N/A'}</div>
                              <div>Fats: {food.fats || 'N/A'}</div>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold">Total: {meal.total} calories</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            )}

            {/* Motivation Tab */}
            <TabsContent value="motivation" className="space-y-4">
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <CardHeader>
                  <CardTitle>Your Motivational Quote</CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-xl italic font-semibold">
                    "{plan.motivationContent?.quote || 'Stay strong and focused!'}"
                  </blockquote>
                </CardContent>
              </Card>

              {plan.motivationContent?.tips && (
                <Card>
                  <CardHeader>
                    <CardTitle>Success Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.motivationContent.tips.map((tip: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {plan.motivationContent?.milestones && (
                <Card>
                  <CardHeader>
                    <CardTitle>Milestones & Rewards</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {plan.motivationContent.milestones.map((milestone: any, idx: number) => (
                      <div key={idx} className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Week {milestone.week}</h4>
                          <Badge>🎯</Badge>
                        </div>
                        <p className="text-sm mb-1">{milestone.goal}</p>
                        <p className="text-sm text-muted-foreground">🎁 {milestone.reward}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}