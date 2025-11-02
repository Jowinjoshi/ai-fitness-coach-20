"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { Gamepad2, Loader2, Trophy, Zap, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function GameZonePage() {
  const { user, refreshUser } = useUser();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const generateQuiz = async () => {
    setIsGenerating(true);
    setQuiz([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setAnsweredCorrectly(null);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data.questions);
      } else {
        alert('Failed to generate quiz. Please try again.');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;

    const correct = parseInt(selectedAnswer) === quiz[currentQuestion].correctAnswer;
    setAnsweredCorrectly(correct);
    
    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer('');
        setAnsweredCorrectly(null);
      } else {
        finishQuiz(correct ? score + 1 : score);
      }
    }, 1500);
  };

  const finishQuiz = async (finalScore: number) => {
    setIsSubmitting(true);
    setShowResult(true);

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          score: finalScore,
          totalQuestions: quiz.length,
          quizData: { questions: quiz }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setXpEarned(data.quizAttempt.xpEarned);
        await refreshUser();

        // Celebrate with confetti
        if (data.accuracy >= 80) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAccuracyMessage = () => {
    const accuracy = (score / quiz.length) * 100;
    if (accuracy === 100) return "Perfect! You're a fitness expert! 🏆";
    if (accuracy >= 80) return "Excellent work! Keep it up! 🌟";
    if (accuracy >= 60) return "Good job! Room for improvement! 💪";
    return "Keep learning! Practice makes perfect! 📚";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

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
              <Gamepad2 className="w-10 h-10 text-purple-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Fitness Quiz Game Zone</h1>
            <p className="text-muted-foreground">Test your fitness knowledge and earn XP rewards!</p>
          </motion.div>

          {/* Main Content */}
          <div className="max-w-3xl mx-auto">
            {quiz.length === 0 ? (
              // Start Screen
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="text-2xl">Ready to Challenge Yourself?</CardTitle>
                    <CardDescription>
                      Take an AI-generated fitness quiz with 10 questions. Earn XP based on your performance!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                        <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                        <p className="font-semibold">10 Questions</p>
                        <p className="text-sm text-muted-foreground">Various topics</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="font-semibold">5 XP/Question</p>
                        <p className="text-sm text-muted-foreground">+ Bonus rewards</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                        <p className="font-semibold">Climb Ranks</p>
                        <p className="text-sm text-muted-foreground">Level up faster</p>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      onClick={generateQuiz}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : showResult ? (
              // Results Screen
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                        <Trophy className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
                    <CardDescription className="text-lg">{getAccuracyMessage()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-3xl font-bold text-green-500">{score}</p>
                        <p className="text-sm text-muted-foreground">Correct</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-3xl font-bold text-red-500">{quiz.length - score}</p>
                        <p className="text-sm text-muted-foreground">Wrong</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-3xl font-bold text-blue-500">{Math.round((score / quiz.length) * 100)}%</p>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                        <p className="text-3xl font-bold text-purple-500">+{xpEarned}</p>
                        <p className="text-sm text-muted-foreground">XP Earned</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        size="lg"
                        onClick={generateQuiz}
                        disabled={isGenerating}
                        className="flex-1"
                      >
                        Play Again
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => router.push('/dashboard')}
                        className="flex-1"
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              // Quiz Screen
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">
                        Question {currentQuestion + 1} of {quiz.length}
                      </Badge>
                      <Badge variant="outline">
                        Score: {score}/{currentQuestion}
                      </Badge>
                    </div>
                    <Progress value={((currentQuestion + 1) / quiz.length) * 100} className="mb-4" />
                    <CardTitle className="text-xl">{quiz[currentQuestion].question}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                      {quiz[currentQuestion].options.map((option, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                            answeredCorrectly !== null
                              ? index === quiz[currentQuestion].correctAnswer
                                ? 'border-green-500 bg-green-500/10'
                                : selectedAnswer === index.toString() && !answeredCorrectly
                                ? 'border-red-500 bg-red-500/10'
                                : 'border-muted'
                              : selectedAnswer === index.toString()
                              ? 'border-primary bg-primary/10'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem
                            value={index.toString()}
                            id={`option-${index}`}
                            disabled={answeredCorrectly !== null}
                          />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer flex items-center justify-between"
                          >
                            <span>{option}</span>
                            <AnimatePresence>
                              {answeredCorrectly !== null && index === quiz[currentQuestion].correctAnswer && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </motion.div>
                              )}
                              {answeredCorrectly === false && selectedAnswer === index.toString() && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <XCircle className="w-5 h-5 text-red-500" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={!selectedAnswer || answeredCorrectly !== null}
                      className="w-full"
                      size="lg"
                    >
                      {answeredCorrectly !== null ? 'Next Question...' : 'Submit Answer'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
