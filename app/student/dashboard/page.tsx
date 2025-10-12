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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header avec gradient moderne */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                  <Award className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">Espace Étudiant</h1>
              </div>
              <p className="text-blue-100 ml-12 text-lg">Bienvenue, {data.full_name} 👋</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Masterclass & Session Info - Carte avec gradient */}
          <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:shadow-3xl transition-all duration-300">
            <CardHeader className="bg-white/10 backdrop-blur-md border-b border-white/20">
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                Ma Masterclass
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white/95 backdrop-blur-sm">
              <div className="space-y-5 py-4">
                {/* Masterclass Title */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Formation</p>
                  <p className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {data.masterclass_title}
                  </p>
                  {data.masterclass_description && (
                    <p className="text-sm text-gray-600 mt-2">{data.masterclass_description}</p>
                  )}
                </div>

                {/* Session Date */}
                {data.session_date ? (
                  <>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">
                        ✅ Session Réservée
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Date de la session</p>
                            <p className="font-bold text-gray-800">{formatDate(data.session_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                          <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-2 rounded-lg">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Horaires</p>
                            <p className="font-bold text-gray-800">9h00 - 15h00</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl text-white shadow-lg">
                      <p className="text-sm flex items-center gap-2">
                        <span className="text-xl">📍</span>
                        <span className="font-medium">Les détails de connexion vous seront communiqués par email avant la session.</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200 text-center">
                    <p className="text-orange-700 font-semibold">⚠️ Aucune session réservée</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test PRE - Design moderne */}
          <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-white/10 backdrop-blur-md border-b border-white/20">
              <CardTitle className="flex items-center gap-3 text-white text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <CheckCircle className="h-6 w-6" />
                </div>
                Test Pré-Inscription
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white/95 backdrop-blur-sm py-6">
              {data.pre_test_id ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">Votre Score</span>
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2 rounded-full text-2xl font-bold shadow-lg">
                        {data.pre_test_score}/{data.pre_test_max_score}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Passé le : <strong>{data.pre_test_date ? formatDate(data.pre_test_date) : '-'}</strong></span>
                    </div>
                  </div>
                  <Link href={`/test/results/${data.pre_test_id}`}>
                    <Button variant="outline" className="w-full h-12 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 hover:from-green-700 hover:to-emerald-700">
                      📊 Voir les résultats détaillés
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
                    <p className="text-orange-700 font-semibold">Test non encore passé</p>
                  </div>
                  <Button className="w-full h-12 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg">
                    🚀 Passer le test maintenant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test POST - Design moderne */}
          <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-white/10 backdrop-blur-md border-b border-white/20">
              <CardTitle className="flex items-center gap-3 text-white text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Award className="h-6 w-6" />
                </div>
                Test Post-Masterclass
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white/95 backdrop-blur-sm py-6">
              {data.post_test_id ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border-2 border-amber-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Votre Score Final</span>
                      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-5 py-2 rounded-full text-2xl font-bold shadow-lg">
                        {data.post_test_score}/{data.post_test_max_score}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Passé le : <strong>{data.post_test_date ? formatDate(data.post_test_date) : '-'}</strong></span>
                    </div>
                  </div>
                  <Link href={`/test/results/${data.post_test_id}`}>
                    <Button variant="outline" className="w-full h-12 font-semibold bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 hover:from-amber-700 hover:to-orange-700">
                      🏆 Voir les résultats détaillés
                    </Button>
                  </Link>
                </div>
              ) : data.post_test_available ? (
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300 shadow-lg">
                    <div className="text-6xl mb-3">✅</div>
                    <p className="text-green-800 font-bold text-lg mb-2">Test disponible !</p>
                    <p className="text-sm text-green-700">
                      Votre masterclass a eu lieu. Vous pouvez maintenant passer le test final.
                    </p>
                  </div>
                  <Link href="/test/post">
                    <Button className="w-full h-12 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg">
                      🎯 Passer le test post-masterclass
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-300 shadow-lg">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-xl">
                      <Clock className="h-10 w-10 text-white" />
                    </div>
                    <p className="font-bold text-xl text-orange-900 mb-2">⏳ Test verrouillé</p>
                    <p className="text-sm text-orange-800 mb-3">
                      Ce test sera disponible après votre masterclass
                      {data.session_date && ` le ${formatDate(data.session_date)} à 15h00`}
                    </p>
                    {countdown && (
                      <div className="mt-4 bg-white p-4 rounded-xl border-2 border-orange-400 shadow-lg">
                        <p className="text-xs text-orange-700 font-semibold mb-2 uppercase tracking-wide">Disponible dans :</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-mono tracking-wide">
                          {countdown}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info - Carte d'information moderne */}
          <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500">
            <CardContent className="bg-white/90 backdrop-blur-sm py-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Email</p>
                    <p className="font-bold text-gray-800">{data.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Inscrit le</p>
                    <p className="font-bold text-gray-800">{formatDate(data.inscription_date)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
