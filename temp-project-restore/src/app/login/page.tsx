'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Zap, Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLogin) {
      localStorage.setItem('isAuthenticated', 'true')
      const hasCompletedQuiz = localStorage.getItem('userProfile')
      if (hasCompletedQuiz) {
        router.push('/home')
      } else {
        router.push('/quiz')
      }
    } else {
      localStorage.setItem('isAuthenticated', 'true')
      router.push('/quiz')
    }
  }

  const handleSocialLogin = (provider: string) => {
    localStorage.setItem('isAuthenticated', 'true')
    const hasCompletedQuiz = localStorage.getItem('userProfile')
    if (hasCompletedQuiz) {
      router.push('/home')
    } else {
      router.push('/quiz')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0B1F3A] to-[#1A2942] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0B1F3A] border border-[#1E3A5F] rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] p-3 rounded-xl">
              <Zap className="w-10 h-10 text-[#0B1F3A]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00E5FF] to-[#6A5CFF] bg-clip-text text-transparent">
            VEXTOR AI
          </h1>
          <h2 className="text-xl font-semibold text-white">
            {isLogin ? 'Bem-vindo de volta!' : 'Criar conta'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Entre para continuar' : 'Comece sua jornada no VEXTOR AI'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 bg-[#1A2942] border-[#1E3A5F] text-white placeholder:text-gray-500 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-[#1A2942] border-[#1E3A5F] text-white placeholder:text-gray-500 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-[#1A2942] border-[#1E3A5F] text-white placeholder:text-gray-500 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                required
              />
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <Link href="/recuperar-senha" className="text-sm text-[#00E5FF] hover:text-[#6A5CFF] transition-colors">
                Esqueceu a senha?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#00E5FF] to-[#6A5CFF] hover:from-[#00B8D4] hover:to-[#5A4CFF] text-[#0B1F3A] h-12 text-lg font-semibold transition-all duration-300 shadow-lg shadow-[#00E5FF]/20"
          >
            {isLogin ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1E3A5F]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0B1F3A] text-gray-400">Ou continue com</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin('google')}
            className="h-12 bg-[#1A2942] border-[#1E3A5F] text-white hover:bg-[#1E3A5F] hover:border-[#00E5FF] transition-all"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialLogin('apple')}
            className="h-12 bg-[#1A2942] border-[#1E3A5F] text-white hover:bg-[#1E3A5F] hover:border-[#00E5FF] transition-all"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Apple
          </Button>
        </div>

        <div className="text-center text-sm text-gray-400">
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          {' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#00E5FF] hover:text-[#6A5CFF] font-semibold transition-colors"
          >
            {isLogin ? 'Criar conta' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
