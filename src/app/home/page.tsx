'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, BarChart3, Building2, User, Zap, Target, Crown, ChevronRight, Bell, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { generateDailyAdvice, analyzeMarketConditions, getTimeBasedAdvice, getWeekdayAdvice } from '@/lib/ai/advisory';
import { alertSystem, generateDailyAlertSummary } from '@/lib/ai/alerts';
import { BettorStyle } from '@/lib/types';
import PWAInstallBanner from '@/components/custom/pwa-install-banner';

function HomePageContent() {
  const [userProfile, setUserProfile] = useState('');
  const [userStyle, setUserStyle] = useState<BettorStyle>('balanced');
  const [dailyAdvice, setDailyAdvice] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const adminParam = searchParams.get('admin');
    setIsAdmin(adminParam === '1');
    const profile = localStorage.getItem('userProfileName') || 'Equilibrado';
    setUserProfile(profile);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container max-w-lg mx-auto pt-4 px-4">
        <h1 className="text-2xl font-bold">Bem-vindo, {userProfile}</h1>
        <p className="text-muted-foreground">Sua central de inteligência para apostas.</p>
        <PWAInstallBanner />
        {/* Aqui entra o restante do seu layout atual */}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">Carregando inteligência...</p>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
