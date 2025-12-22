'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CreditCard, 
  ChevronLeft, 
  Check, 
  Loader2,
  QrCode,
  Building2,
  Smartphone
} from 'lucide-react'
import Link from 'next/link'
import {
  createPaymentTransaction,
  processPixPayment,
  processCreditCardPayment,
  processStripePayment,
  processMercadoPagoPayment,
  processAsaasPayment,
  confirmPixPayment,
  PLAN_PRICES,
  type PaymentMethod,
  type SubscriptionPlan
} from '@/lib/services/payments'

export default function PagamentoPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('quarterly')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix')
  const [isProcessing, setIsProcessing] = useState(false)
  const [pixQrCode, setPixQrCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Dados do cartão
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const handlePayment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const userId = 'user_123' // Em produção, pegar do contexto de autenticação

      // Criar transação
      const transaction = createPaymentTransaction(userId, selectedPlan, selectedMethod)

      let result

      switch (selectedMethod) {
        case 'pix':
          result = await processPixPayment(transaction)
          if (result.success && result.qrCode) {
            setPixQrCode(result.qrCode)
            // Simular confirmação após 5 segundos
            setTimeout(async () => {
              await confirmPixPayment(transaction.id)
              router.push('/perfil?payment=success')
            }, 5000)
          } else {
            setError(result.error || 'Erro ao processar PIX')
          }
          break

        case 'credit_card':
          const [month, year] = cardExpiry.split('/')
          result = await processCreditCardPayment(transaction, {
            number: cardNumber,
            holderName: cardName,
            expiryMonth: month,
            expiryYear: year,
            cvv: cardCvv
          })
          if (result.success) {
            router.push('/perfil?payment=success')
          } else {
            setError(result.error || 'Erro ao processar cartão')
          }
          break

        case 'stripe':
          result = await processStripePayment(transaction, 'stripe_token_mock')
          if (result.success) {
            router.push('/perfil?payment=success')
          } else {
            setError(result.error || 'Erro ao processar com Stripe')
          }
          break

        case 'mercadopago':
          result = await processMercadoPagoPayment(transaction, {})
          if (result.success) {
            router.push('/perfil?payment=success')
          } else {
            setError(result.error || 'Erro ao processar com Mercado Pago')
          }
          break

        case 'asaas':
          result = await processAsaasPayment(transaction, {})
          if (result.success) {
            router.push('/perfil?payment=success')
          } else {
            setError(result.error || 'Erro ao processar com ASAAS')
          }
          break
      }
    } catch (err) {
      setError('Erro inesperado ao processar pagamento')
    } finally {
      setIsProcessing(false)
    }
  }

  const paymentMethods = [
    { id: 'pix' as PaymentMethod, name: 'PIX', icon: <QrCode className="w-5 h-5" /> },
    { id: 'credit_card' as PaymentMethod, name: 'Cartão de Crédito', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'stripe' as PaymentMethod, name: 'Stripe', icon: <Building2 className="w-5 h-5" /> },
    { id: 'mercadopago' as PaymentMethod, name: 'Mercado Pago', icon: <Smartphone className="w-5 h-5" /> },
    { id: 'asaas' as PaymentMethod, name: 'ASAAS', icon: <Building2 className="w-5 h-5" /> }
  ]

  const plans = [
    { id: 'monthly' as SubscriptionPlan, ...PLAN_PRICES.monthly },
    { id: 'quarterly' as SubscriptionPlan, ...PLAN_PRICES.quarterly },
    { id: 'yearly' as SubscriptionPlan, ...PLAN_PRICES.yearly }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/premium" className="inline-flex items-center gap-2 mb-4 text-white/90 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-2xl font-bold">Finalizar Pagamento</h1>
          <p className="text-white/90">Escolha seu plano e forma de pagamento</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Seleção de Plano */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Escolha seu plano</h2>
          <div className="space-y-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedPlan === plan.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">{plan.period}</div>
                    {plan.discount > 0 && (
                      <div className="text-sm text-emerald-600 font-semibold">
                        Economize {plan.discount}%
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      R$ {plan.price.toFixed(2)}
                    </div>
                    {plan.monthlyEquivalent && (
                      <div className="text-sm text-gray-600">
                        R$ {plan.monthlyEquivalent.toFixed(2)}/mês
                      </div>
                    )}
                  </div>
                  {selectedPlan === plan.id && (
                    <div className="ml-4">
                      <Check className="w-6 h-6 text-emerald-600" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Seleção de Método de Pagamento */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Forma de pagamento</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selectedMethod === method.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  selectedMethod === method.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {method.icon}
                </div>
                <span className="font-semibold text-gray-900">{method.name}</span>
                {selectedMethod === method.id && (
                  <Check className="w-5 h-5 text-emerald-600 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Formulário de Cartão */}
        {selectedMethod === 'credit_card' && !pixQrCode && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Dados do Cartão</h2>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no Cartão</Label>
              <Input
                id="cardName"
                placeholder="NOME COMPLETO"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Validade</Label>
                <Input
                  id="cardExpiry"
                  placeholder="MM/AA"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardCvv">CVV</Label>
                <Input
                  id="cardCvv"
                  placeholder="000"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  maxLength={4}
                  type="password"
                />
              </div>
            </div>
          </div>
        )}

        {/* QR Code PIX */}
        {pixQrCode && (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <QrCode className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Escaneie o QR Code</h2>
            <div className="bg-gray-100 p-4 rounded-xl">
              <div className="bg-white p-4 rounded-lg inline-block">
                <div className="text-xs font-mono break-all text-gray-600">
                  {pixQrCode}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Aguardando confirmação do pagamento...
            </p>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-sm text-gray-600">Processando</span>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {/* Botão de Pagamento */}
        {!pixQrCode && (
          <Button
            onClick={handlePayment}
            disabled={isProcessing || (selectedMethod === 'credit_card' && (!cardNumber || !cardName || !cardExpiry || !cardCvv))}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Pagar R$ {PLAN_PRICES[selectedPlan].price.toFixed(2)}
                <CreditCard className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        )}

        {/* Informações de Segurança */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>🔒 Pagamento 100% seguro e criptografado</p>
          <p>Cancele quando quiser • Garantia de 7 dias</p>
        </div>
      </div>
    </div>
  )
}
