'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, CheckCircle, Clock, Award, LogOut } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  full_name: string;
  email: string;
  inscription_date: string;
  masterclass_title: string;
  masterclass_description: string | null;
  session_date: string | null;
  session_id: string | null;
  pre_test_id: string | null;
  pre_test_score: number | null;
  pre_test_max_score: number | null;
  pre_test_date: string | null;
  post_test_id: string | null;
  post_test_score: number | null;
  post_test_max_score: number | null;
  post_test_date: string | null;
  post_test_available: boolean;
  post_test_unlocks_at: string | null;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    const fetchDashboard = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const inscriptionId = searchParams.get('inscription_id');
      
      if (!inscriptionId) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`/api/student/dashboard?inscription_id=${inscriptionId}`);
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 404) {
            router.push('/');
            return;
          }
          throw new Error(result.error || 'Erreur de chargement');
        }

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  // Countdown timer for POST test
  useEffect(() => {
    if (!data?.post_test_unlocks_at || data.post_test_available) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const unlockTime = new Date(data.post_test_unlocks_at!);
      const diff = unlockTime.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Disponible maintenant !');
        // Refresh data to update availability
        window.location.reload();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days}j ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const handleLogout = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive">{error || 'Erreur de chargement'}</p>
              <Button onClick={() => router.push('/')}>
                Retour à l&apos;accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplifié avec couleurs du thème */}
      <header className="bg-primary shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-white">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Espace Étudiant</h1>
              </div>
              <p className="text-primary-foreground/90 ml-9 sm:ml-11 text-sm sm:text-base">Bienvenue, {data.full_name}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white self-end sm:self-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Déconnexion</span>
              <span className="sm:hidden">Quitter</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Masterclass & Session Info */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <span>Ma Masterclass</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 pt-4 sm:pt-6">
              {/* Masterclass Title */}
              <div className="bg-secondary p-4 sm:p-5 rounded-xl border-2 border-primary/10">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Formation</p>
                <p className="font-bold text-lg sm:text-xl text-foreground">
                  {data.masterclass_title}
                </p>
                {data.masterclass_description && (
                  <p className="text-sm text-muted-foreground mt-2">{data.masterclass_description}</p>
                )}
              </div>

              {/* Session Date */}
              {data.session_date ? (
                <>
                  <div className="bg-primary/5 p-4 sm:p-5 rounded-xl border-2 border-primary/20">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                      ✅ Session Réservée
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-card p-3 sm:p-4 rounded-lg shadow-sm border border-border">
                        <div className="bg-primary p-2 rounded-lg flex-shrink-0">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Date de la session</p>
                          <p className="font-bold text-sm sm:text-base text-foreground truncate">{formatDate(data.session_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-card p-3 sm:p-4 rounded-lg shadow-sm border border-border">
                        <div className="bg-accent p-2 rounded-lg flex-shrink-0">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Horaires</p>
                          <p className="font-bold text-sm sm:text-base text-foreground">9h00 - 15h00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-destructive/10 p-4 sm:p-6 rounded-xl border-2 border-destructive/30 text-center">
                  <p className="text-destructive font-semibold text-sm sm:text-base">⚠️ Aucune session réservée</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test PRE */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <span>Test Pré-Inscription</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 sm:pt-6">
              {data.pre_test_id ? (
                <>
                  <div className="bg-primary/5 p-4 sm:p-5 rounded-xl border-2 border-primary/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                      <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wide">Votre Score</span>
                      <div className="bg-primary text-white px-4 sm:px-5 py-2 rounded-full text-xl sm:text-2xl font-bold shadow-lg">
                        {data.pre_test_score}/{data.pre_test_max_score}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Passé le : <strong>{data.pre_test_date ? formatDate(data.pre_test_date) : '-'}</strong></span>
                    </div>
                  </div>
                  <Link href={`/test/results/${data.pre_test_id}`}>
                    <Button variant="outline" className="w-full h-11 sm:h-12 font-semibold bg-primary text-white border-0 hover:bg-primary/90 text-sm sm:text-base">
                      📊 Voir les résultats détaillés
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-secondary p-4 sm:p-6 rounded-xl border-2 border-border">
                    <p className="text-foreground font-semibold text-sm sm:text-base">Test non encore passé</p>
                  </div>
                  <Button className="w-full h-11 sm:h-12 font-semibold bg-primary hover:bg-primary/90 text-sm sm:text-base">
                    🚀 Passer le test maintenant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test POST */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-accent/5">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <span>Test Post-Masterclass</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 sm:pt-6">
              {data.post_test_id ? (
                <>
                  <div className="bg-accent/5 p-4 sm:p-5 rounded-xl border-2 border-accent/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                      <span className="text-xs sm:text-sm font-semibold text-accent uppercase tracking-wide">Votre Score Final</span>
                      <div className="bg-accent text-white px-4 sm:px-5 py-2 rounded-full text-xl sm:text-2xl font-bold shadow-lg">
                        {data.post_test_score}/{data.post_test_max_score}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Passé le : <strong>{data.post_test_date ? formatDate(data.post_test_date) : '-'}</strong></span>
                    </div>
                  </div>
                  <Link href={`/test/results/${data.post_test_id}`}>
                    <Button variant="outline" className="w-full h-11 sm:h-12 font-semibold bg-accent text-white border-0 hover:bg-accent/90 text-sm sm:text-base">
                      🏆 Voir les résultats détaillés
                    </Button>
                  </Link>
                </>
              ) : data.post_test_available ? (
                <div className="text-center space-y-4">
                  <div className="bg-primary/5 p-4 sm:p-6 rounded-xl border-2 border-primary/20 shadow-md">
                    <div className="text-4xl sm:text-5xl md:text-6xl mb-3">✅</div>
                    <p className="text-primary font-bold text-base sm:text-lg mb-2">Test disponible !</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Votre masterclass a eu lieu. Vous pouvez maintenant passer le test final.
                    </p>
                  </div>
                  <Link href="/test/post">
                    <Button className="w-full h-11 sm:h-12 font-semibold bg-primary hover:bg-primary/90 text-sm sm:text-base">
                      🎯 Passer le test post-masterclass
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-secondary p-4 sm:p-6 rounded-xl border-2 border-border shadow-md">
                    <div className="bg-accent w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg">
                      <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <p className="font-bold text-base sm:text-xl text-foreground mb-2">⏳ Test verrouillé</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      Ce test sera disponible après votre masterclass
                      {data.session_date && ` le ${formatDate(data.session_date)} à 15h00`}
                    </p>
                    {countdown && (
                      <div className="mt-4 bg-card p-3 sm:p-4 rounded-xl border-2 border-primary/30 shadow-md">
                        <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Disponible dans :</p>
                        <p className="text-2xl sm:text-3xl font-bold text-accent font-mono tracking-wide">
                          {countdown}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info personnelles */}
          <Card className="shadow-lg">
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-3 bg-background p-3 sm:p-4 rounded-xl border border-border">
                <div className="bg-primary p-2 rounded-lg flex-shrink-0">
                  <span className="text-xl sm:text-2xl">📧</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</p>
                  <p className="font-bold text-sm sm:text-base text-foreground truncate">{data.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-background p-3 sm:p-4 rounded-xl border border-border">
                <div className="bg-accent p-2 rounded-lg flex-shrink-0">
                  <span className="text-xl sm:text-2xl">📅</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inscrit le</p>
                  <p className="font-bold text-sm sm:text-base text-foreground">{formatDate(data.inscription_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
