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
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Espace Étudiant</h1>
              <p className="text-sm text-muted-foreground">{data.full_name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Masterclass & Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ma Masterclass
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Masterclass Title */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Formation :</p>
                  <p className="font-semibold text-lg text-primary">{data.masterclass_title}</p>
                  {data.masterclass_description && (
                    <p className="text-sm text-muted-foreground mt-1">{data.masterclass_description}</p>
                  )}
                </div>

                {/* Session Date */}
                {data.session_date ? (
                  <>
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-3">Session réservée :</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">📅 Date :</span>
                          <span className="font-semibold">{formatDate(data.session_date)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">⏰ Horaire :</span>
                          <span className="font-semibold">9h00 - 15h00</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                      📍 Les détails de connexion vous seront communiqués par email avant la session.
                    </div>
                  </>
                ) : (
                  <div className="border-t pt-4">
                    <p className="text-muted-foreground text-center py-2">⚠️ Aucune session réservée</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test PRE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Test Pré-Inscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.pre_test_id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Score :</span>
                    <Badge variant="secondary" className="text-lg">
                      {data.pre_test_score}/{data.pre_test_max_score}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Passé le :</span>
                    <span>{data.pre_test_date ? formatDate(data.pre_test_date) : '-'}</span>
                  </div>
                  <Link href={`/test/results/${data.pre_test_id}`}>
                    <Button variant="outline" className="w-full">
                      Voir les résultats détaillés
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">Test non encore passé</p>
                  <Button className="w-full">
                    Passer le test maintenant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test POST */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Test Post-Masterclass
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.post_test_id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Score :</span>
                    <Badge variant="secondary" className="text-lg">
                      {data.post_test_score}/{data.post_test_max_score}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Passé le :</span>
                    <span>{data.post_test_date ? formatDate(data.post_test_date) : '-'}</span>
                  </div>
                  <Link href={`/test/results/${data.post_test_id}`}>
                    <Button variant="outline" className="w-full">
                      Voir les résultats détaillés
                    </Button>
                  </Link>
                </div>
              ) : data.post_test_available ? (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-semibold">✅ Test disponible !</p>
                    <p className="text-sm text-green-700 mt-2">
                      Votre masterclass a eu lieu. Vous pouvez maintenant passer le test final.
                    </p>
                  </div>
                  <Link href="/test/post">
                    <Button className="w-full">
                      Passer le test post-masterclass
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <Clock className="h-10 w-10 mx-auto text-orange-600 mb-3" />
                    <p className="font-semibold text-orange-900 mb-2">⏳ Test verrouillé</p>
                    <p className="text-sm text-orange-800 mb-3">
                      Ce test sera disponible après votre masterclass
                      {data.session_date && ` le ${formatDate(data.session_date)} à 15h00`}
                    </p>
                    {countdown && (
                      <div className="mt-4 p-3 bg-white rounded-lg border-2 border-orange-300">
                        <p className="text-xs text-orange-700 mb-1">Disponible dans :</p>
                        <p className="text-2xl font-bold text-orange-600 font-mono tracking-wide">
                          {countdown}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-blue-800">
                <p>📧 <strong>Email :</strong> {data.email}</p>
                <p>📅 <strong>Inscrit le :</strong> {formatDate(data.inscription_date)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
