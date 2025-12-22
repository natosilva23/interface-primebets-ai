'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Verificar se já está instalado
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    if (isInstalled) {
      return
    }

    // Verificar se usuário já recusou
    const hasDeclined = localStorage.getItem('pwa-install-declined')
    if (hasDeclined) {
      return
    }

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('✅ Usuário aceitou instalar PWA')
    } else {
      console.log('❌ Usuário recusou instalar PWA')
      localStorage.setItem('pwa-install-declined', 'true')
    }

    setDeferredPrompt(null)
    setShowBanner(false)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-install-declined', 'true')
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-br from-[#00E5FF] to-[#6A5CFF] text-white rounded-2xl p-4 shadow-2xl shadow-[#00E5FF]/30 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <Download className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-1">Instalar VEXTOR AI</h3>
            <p className="text-sm text-white/90 mb-3">
              Adicione à tela inicial para acesso rápido e experiência completa
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                className="bg-white text-[#0B1F3A] hover:bg-white/90 flex-1"
              >
                Instalar
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
