'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, BarChart3, Building2, User as UserIcon, ChevronLeft, Crown, LogOut, CreditCard, Edit, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { 
  getSubscriptionStatus, 
  cancelSubscription,
  type SubscriptionData 
} from '@/lib/services/payments'

export default function PerfilPage() {
  const [userProfile, setUserProfile] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const profile = localStorage.getItem('userProfileName') || 'Equilibrado'
    const premium = localStorage.getItem('isPremium') === 'true'
    setUserProfile(profile)
    setIsPremium(premium)

    // Verificar status da assinatura
    const userId = 'user_123' // Em produção, pegar do contexto
    const subStatus = getSubscriptionStatus(userId)
    setSubscription(subStatus)

    // Verificar se veio de pagamento bem-sucedido
    if (searchParams.get('payment') === 'success') {
      setPaymentSuccess(true)
      setTimeout(() => setPaymentSuccess(false), 5000)
    }
  }, [searchParams])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userProfile')
    localStorage.removeItem('userProfileName')
    localStorage.removeItem('isPremium')
    router.push('/login')
  }

  const handleCancelSubscription = async () => {
    setIsCancelling(true)
    
    const userId = 'user_123' // Em produção, pegar do contexto
    const result = await cancelSubscription(userId)

    if (result.success) {
      setIsPremium(false)
      setSubscription(null)
      setShowCancelDialog(false)
      router.refresh()
    }

    setIsCancelling(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const menuItems = [
    {
      icon: <Edit className="w-5 h-5" />,
      title: 'Estilo de Apostador',
      subtitle: userProfile,
      action: () => router.push('/quiz')
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: 'Minha Assinatura',
      subtitle: isPremium ? 'Premium Ativo' : 'Plano Gratuito',
      action: () => router.push('/premium')
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: 'Formas de Pagamento',
      subtitle: 'Gerenciar cartões',
      action: () => router.push('/pagamento')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/home" className="inline-flex items-center gap-2 mb-4 text-white/90 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Notificação de Sucesso */}
        {paymentSuccess && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-900">Pagamento aprovado!</p>
              <p className="text-sm text-emerald-700">Sua assinatura Premium foi ativada com sucesso.</p>
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              A
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Apostador</h2>
              <p className="text-gray-600">apostador@email.com</p>
              {isPremium && (
                <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold mt-2">
                  <Crown className="w-3 h-3" />
                  Premium
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">127</div>
              <div className="text-xs text-gray-600">Apostas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">68%</div>
              <div className="text-xs text-gray-600">Taxa de acerto</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">R$ 2.4k</div>
              <div className="text-xs text-gray-600">Lucro total</div>
            </div>
          </div>
        </div>

        {/* Informações da Assinatura Premium */}
        {isPremium && subscription && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6" />
              <h3 className="text-lg font-bold">Assinatura Premium</h3>
            </div>
            <div className="space-y-2 text-white/90 text-sm">
              <p>Plano: <span className="font-semibold text-white">{subscription.plan === 'monthly' ? 'Mensal' : subscription.plan === 'quarterly' ? 'Trimestral' : 'Anual'}</span></p>
              <p>Status: <span className="font-semibold text-white">{subscription.status === 'active' ? 'Ativo' : 'Cancelado'}</span></p>
              <p>Início: <span className="font-semibold text-white">{formatDate(subscription.startDate)}</span></p>
              <p>Renovação: <span className="font-semibold text-white">{formatDate(subscription.expiresAt)}</span></p>
              <p>Renovação automática: <span className="font-semibold text-white">{subscription.autoRenew ? 'Ativa' : 'Desativada'}</span></p>
            </div>
            {subscription.status === 'active' && (
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                className="w-full mt-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Cancelar Assinatura
              </Button>
            )}
          </div>
        )}

        {/* Dialog de Cancelamento */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Cancelar Assinatura?</h3>
                  <p className="text-sm text-gray-600">Você perderá acesso aos recursos Premium</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-700">
                <p>• Palpites ilimitados</p>
                <p>• Análise avançada com IA</p>
                <p>• Comparador de plataformas</p>
                <p>• Suporte prioritário 24/7</p>
              </div>

              <p className="text-sm text-gray-600">
                Você ainda terá acesso até {subscription && formatDate(subscription.expiresAt)}
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCancelDialog(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isCancelling}
                >
                  Manter Premium
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-600">{item.subtitle}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="mr-2 w-5 h-5" />
          Sair da Conta
        </Button>

        <div className="text-center text-xs text-gray-500">
          PrimeBets AI v1.0.0
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-around py-3">
          <Link href="/home" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/analise" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">Análises</span>
          </Link>
          <Link href="/plataformas" className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600">
            <Building2 className="w-6 h-6" />
            <span className="text-xs font-medium">Plataformas</span>
          </Link>
          <Link href="/perfil" className="flex flex-col items-center gap-1 text-emerald-600">
            <UserIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
