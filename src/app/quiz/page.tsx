'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const questions = [
  {
    id: 1,
    question: 'Com que frequência você faz apostas?',
    options: [
      { value: 'daily', label: 'Diariamente', points: { strategic: 3, highRisk: 2 } },
      { value: 'weekly', label: 'Semanalmente', points: { balanced: 3, strategic: 2 } },
      { value: 'monthly', label: 'Mensalmente', points: { conservative: 3, balanced: 1 } },
      { value: 'rarely', label: 'Raramente', points: { recreational: 3, conservative: 2 } }
    ]
  },
  {
    id: 2,
    question: 'Qual o valor médio que você investe por aposta?',
    options: [
      { value: 'low', label: 'Até R$ 20', points: { recreational: 3, conservative: 2 } },
      { value: 'medium', label: 'R$ 20 - R$ 100', points: { balanced: 3, strategic: 1 } },
      { value: 'high', label: 'R$ 100 - R$ 500', points: { strategic: 3, highRisk: 1 } },
      { value: 'veryHigh', label: 'Acima de R$ 500', points: { highRisk: 3, strategic: 2 } }
    ]
  },
  {
    id: 3,
    question: 'Qual sua preferência de risco?',
    options: [
      { value: 'low', label: 'Baixo risco, retorno estável', points: { conservative: 3 } },
      { value: 'medium', label: 'Risco moderado', points: { balanced: 3, strategic: 1 } },
      { value: 'high', label: 'Alto risco, alto retorno', points: { highRisk: 3 } },
      { value: 'calculated', label: 'Risco calculado', points: { strategic: 3 } }
    ]
  },
  {
    id: 4,
    question: 'Que tipo de palpite você prefere?',
    options: [
      { value: 'simple', label: 'Apostas simples', points: { conservative: 3, recreational: 2 } },
      { value: 'multiple', label: 'Apostas múltiplas', points: { balanced: 3, strategic: 2 } },
      { value: 'system', label: 'Apostas de sistema', points: { strategic: 3 } },
      { value: 'live', label: 'Apostas ao vivo', points: { highRisk: 3, strategic: 1 } }
    ]
  },
  {
    id: 5,
    question: 'Quais odds você prefere?',
    options: [
      { value: 'low', label: 'Odds baixas (1.20 - 1.80)', points: { conservative: 3 } },
      { value: 'medium', label: 'Odds médias (1.80 - 3.00)', points: { balanced: 3, strategic: 2 } },
      { value: 'high', label: 'Odds altas (3.00 - 5.00)', points: { highRisk: 2, strategic: 1 } },
      { value: 'veryHigh', label: 'Odds muito altas (5.00+)', points: { highRisk: 3, recreational: 1 } }
    ]
  },
  {
    id: 6,
    question: 'Qual sua modalidade preferida?',
    options: [
      { value: 'football', label: 'Futebol', points: { balanced: 1 } },
      { value: 'basketball', label: 'Basquete', points: { strategic: 1 } },
      { value: 'tennis', label: 'Tênis', points: { strategic: 1 } },
      { value: 'various', label: 'Várias modalidades', points: { highRisk: 1, recreational: 1 } }
    ]
  }
]

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const router = useRouter()

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateProfile()
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateProfile = () => {
    const scores = {
      conservative: 0,
      balanced: 0,
      highRisk: 0,
      strategic: 0,
      recreational: 0
    }

    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === parseInt(questionId))
      const option = question?.options.find(o => o.value === answer)
      
      if (option?.points) {
        Object.entries(option.points).forEach(([profile, points]) => {
          scores[profile as keyof typeof scores] += points
        })
      }
    })

    const maxScore = Math.max(...Object.values(scores))
    const profile = Object.keys(scores).find(
      key => scores[key as keyof typeof scores] === maxScore
    )

    const profileNames = {
      conservative: 'Conservador',
      balanced: 'Equilibrado',
      highRisk: 'Alto Risco',
      strategic: 'Estratégico',
      recreational: 'Recreativo'
    }

    localStorage.setItem('userProfile', profile || 'balanced')
    localStorage.setItem('userProfileName', profileNames[profile as keyof typeof profileNames] || 'Equilibrado')
    router.push('/home')
  }

  const currentQuestionData = questions[currentQuestion]
  const hasAnswer = answers[currentQuestionData.id]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {currentQuestionData.question}
          </h2>

          <div className="grid gap-3">
            {currentQuestionData.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  answers[currentQuestionData.id] === option.value
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg font-medium text-gray-900">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          {currentQuestion > 0 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1 h-12"
            >
              <ChevronLeft className="mr-2 w-5 h-5" />
              Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 h-12 text-lg font-semibold disabled:opacity-50"
          >
            {currentQuestion < questions.length - 1 ? 'Próxima' : 'Finalizar'}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
