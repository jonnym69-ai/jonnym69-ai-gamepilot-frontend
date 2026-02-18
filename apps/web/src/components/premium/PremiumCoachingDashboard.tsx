import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Target, TrendingUp, Clock, CheckCircle, Plus, Star, BookOpen, Zap, LogIn } from 'lucide-react'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/stores/authStore'

interface Goal {
  id: string
  goal_type: string
  title: string
  description?: string
  target_value?: number
  current_value: number
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  deadline?: string
  created_at: string
  completed_at?: string
}

interface WeeklyPlan {
  id: string
  theme: string
  recommendations: Array<{
    gameId: string
    gameName: string
    reasoning: string
    estimatedTime: number
    alignmentScore: number
    moodSuitability: string
  }>
  goalsAlignment: Array<{
    goalType: string
    alignment: string
    progress: string
  }>
  weeklyTips: string[]
  totalEstimatedTime: number
  generated_at: string
}

export default function PremiumCoachingDashboard() {
  const { user } = useAuthStore()
  const isAuthenticated = !!user
  const [goals, setGoals] = useState<Goal[]>([])
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    goal_type: 'finish_backlog',
    title: '',
    description: '',
    target_value: '',
    priority: 'medium' as const
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'weekly-plan'>('overview')

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCoachingData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const loadCoachingData = async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No active session for coaching data')
        setIsLoading(false)
        return
      }

      // Load goals
      const goalsResponse = await fetch('/api/coaching/goals', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json()
        setGoals(goalsData.goals || [])
      }

      // Load weekly plan
      const planResponse = await fetch('/api/coaching/weekly-plan', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (planResponse.ok) {
        const planData = await planResponse.json()
        setWeeklyPlan(planData.plan)
      }
    } catch (error) {
      console.error('Error loading coaching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createGoal = async () => {
    if (!newGoal.title) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/coaching/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          goalType: newGoal.goal_type,
          title: newGoal.title,
          description: newGoal.description,
          targetValue: newGoal.target_value ? parseInt(newGoal.target_value) : null,
          priority: newGoal.priority
        })
      })

      if (response.ok) {
        setShowGoalForm(false)
        setNewGoal({
          goal_type: 'finish_backlog',
          title: '',
          description: '',
          target_value: '',
          priority: 'medium'
        })
        loadCoachingData()
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const generateWeeklyPlan = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/coaching/weekly-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          availableTime: 15 // Default 15 hours/week
        })
      })

      if (response.ok) {
        const data = await response.json()
        setWeeklyPlan(data.plan)
      }
    } catch (error) {
      console.error('Error generating weekly plan:', error)
    }
  }

  const getGoalIcon = (goalType: string) => {
    switch (goalType) {
      case 'finish_backlog': return <BookOpen className="w-4 h-4" />
      case 'relax_more': return <Zap className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your coaching dashboard...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md text-center">
          <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Gaming Coach</h2>
          <p className="text-gray-400 mb-6">
            Access your personal AI-powered gaming coach with goal tracking, weekly plans, and personalized recommendations.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You need to be logged in to use the coaching features.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In to Access Coach
          </a>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Premium Gaming Coach</h1>
          <p className="text-muted-foreground">Your personal AI-powered gaming coach</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateWeeklyPlan} className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Generate Weekly Plan
          </Button>
          <Button onClick={() => setShowGoalForm(!showGoalForm)} variant="secondary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Simple Tab Navigation */}
      <div className="flex border-b border-gray-700 mb-6">
        {[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'goals', label: 'Goals', icon: '🎯' },
          { key: 'weekly-plan', label: 'Weekly Plan', icon: '📅' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Goal Creation Form */}
      {showGoalForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Goal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Goal Type</label>
              <select
                value={newGoal.goal_type}
                onChange={(e) => setNewGoal({...newGoal, goal_type: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                aria-label="Goal Type"
              >
                <option value="finish_backlog">Finish Backlog</option>
                <option value="relax_more">Relax More</option>
                <option value="try_new_genres">Try New Genres</option>
                <option value="beat_favorites">Beat Favorites</option>
                <option value="social_play">Social Play</option>
                <option value="skill_improvement">Skill Improvement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Goal Title</label>
              <Input
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                placeholder="e.g., Complete 5 games this month"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <Input
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                placeholder="More details about your goal..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Value (Optional)</label>
              <Input
                type="number"
                value={newGoal.target_value}
                onChange={(e) => setNewGoal({...newGoal, target_value: e.target.value})}
                placeholder="e.g., 5 games"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createGoal}>Create Goal</Button>
              <Button onClick={() => setShowGoalForm(false)} variant="secondary">Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Goals</p>
                <p className="text-2xl font-bold">{goals.filter(g => g.status === 'active').length}</p>
              </div>
              <Target className="w-8 h-8 text-gray-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold">{goals.filter(g => g.status === 'completed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Weekly Plan</p>
                <p className="text-2xl font-bold">{weeklyPlan ? 'Active' : 'None'}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">This Week</p>
                <p className="text-2xl font-bold">{weeklyPlan ? `${weeklyPlan.totalEstimatedTime}h` : '0h'}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getGoalIcon(goal.goal_type)}
                  <h3 className="font-semibold">{goal.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(goal.priority)}`}></div>
                  <Badge variant="secondary">{goal.status}</Badge>
                </div>
              </div>
              {goal.description && (
                <p className="text-gray-400 mb-2">{goal.description}</p>
              )}
              {goal.target_value && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{goal.current_value}/{goal.target_value}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </Card>
          ))}
          {goals.length === 0 && (
            <Card className="p-8 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
              <p className="text-gray-400 mb-4">Set your first gaming goal to get personalized coaching</p>
              <Button onClick={() => setShowGoalForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'weekly-plan' && (
        <div className="space-y-4">
          {weeklyPlan ? (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" />
                <h2 className="text-xl font-bold">{weeklyPlan.theme}</h2>
              </div>
              <p className="text-gray-400 mb-6">Total estimated time: {weeklyPlan.totalEstimatedTime} hours</p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Recommended Games</h3>
                  <div className="space-y-3">
                    {weeklyPlan.recommendations.map((rec, index) => (
                      <div key={index} className="border border-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{rec.gameName}</h4>
                          <Badge variant="secondary">{rec.estimatedTime}min</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{rec.reasoning}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-gray-700 px-2 py-1 rounded">Alignment: {(rec.alignmentScore * 100).toFixed(0)}%</span>
                          <span className="bg-gray-700 px-2 py-1 rounded">{rec.moodSuitability}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Goal Alignment</h3>
                  <div className="space-y-2">
                    {weeklyPlan.goalsAlignment.map((alignment, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{alignment.goalType}:</span> {alignment.alignment}
                        <br />
                        <span className="text-gray-500">{alignment.progress}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Weekly Tips</h3>
                  <ul className="text-sm space-y-1">
                    {weeklyPlan.weeklyTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No weekly plan yet</h3>
              <p className="text-gray-400 mb-4">Generate your first personalized weekly gaming plan</p>
              <Button onClick={generateWeeklyPlan}>
                <Calendar className="w-4 h-4 mr-2" />
                Generate Weekly Plan
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
