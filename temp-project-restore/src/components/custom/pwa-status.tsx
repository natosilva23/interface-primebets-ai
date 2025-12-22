'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Monitor, CheckCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [platform, setPlatform] = useState<'mobile' | 'desktop' | 'unknown'>('unknown')

  useEffect(() => {
    // Verificar se está instalado
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)
    setIsInstalled(standalone)

    // Detectar plataforma
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setPlatform(isMobile ? 'mobile' : 'desktop')

    // Verificar se está no iOS standalone
    if ((window.navigator as any).standalone) {
      setIsInstalled(true)
      setIsStandalone(true)
    }
  }, [])

  const handleInstallPrompt = () => {
    const deferredPrompt = (window as any).deferredPrompt
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ Usuário aceitou instalar PWA')
        }
        (window as any).deferredPrompt = null
      })
    }
  }

  return (
    <div className="bg-[#0B1F3A] border border-[#1E3A5F] rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        {platform === 'mobile' ? (
          <Smartphone className="w-6 h-6 text-[#00E5FF]" />
        ) : (
          <Monitor className="w-6 h-6 text-[#00E5FF]" />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-white">Status da Instalação</h3>
          <p className="text-sm text-gray-400">
            {platform === 'mobile' ? 'Dispositivo Móvel' : 'Desktop'}
          </p>
        </div>
        {isInstalled && (
          <CheckCircle className="w-6 h-6 text-green-500" />
        )}
      </div>

      {isInstalled ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-500 mb-1">
                ✅ App Instalado
              </p>
              <p className="text-sm text-gray-300">
                VEXTOR AI está instalado e funcionando em modo {isStandalone ? 'standalone' : 'navegador'}.
                Você tem acesso completo a todas as funcionalidades!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-[#00E5FF] mb-1">
                  Instale o App
                </p>
                <p className="text-sm text-gray-300 mb-3">
                  Adicione VEXTOR AI à sua tela inicial para acesso rápido e experiência completa.
                </p>
                <Button
                  onClick={handleInstallPrompt}
                  className="bg-gradient-to-r from-[#00E5FF] to-[#6A5CFF] text-[#0B1F3A] hover:from-[#00B8D4] hover:to-[#5A4CFF] w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Instalar Agora
                </Button>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400 space-y-2">
            <p className="font-semibold text-white">Como instalar:</p>
            {platform === 'mobile' ? (
              <>
                <p>📱 <strong>Android:</strong> Toque no menu (⋮) → "Adicionar à tela inicial"</p>
                <p>🍎 <strong>iOS:</strong> Toque em compartilhar (□↑) → "Adicionar à Tela de Início"</p>
              </>
            ) : (
              <p>💻 <strong>Desktop:</strong> Clique no ícone (+) na barra de endereço ou use o botão acima</p>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-[#1E3A5F] pt-4 space-y-2">
        <p className="text-sm font-semibold text-white">Benefícios da Instalação:</p>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>🚀 Acesso rápido pela tela inicial</li>
          <li>📱 Experiência em tela cheia</li>
          <li>⚡ Carregamento mais rápido</li>
          <li>🔔 Notificações em tempo real</li>
          <li>💾 Funciona offline</li>
        </ul>
      </div>
    </div>
  )
}
