'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Session {
  id: string;
  session_date: string;
  max_participants: number;
  current_participants: number;
  is_full: boolean;
}

interface SessionStats {
  totalCapacity: number;
  totalBooked: number;
  availableSpots: number;
  totalSessions: number;
}

interface SessionSelectorProps {
  inscriptionId: string;
  onSuccess?: () => void;
}

export function SessionSelector({ inscriptionId, onSuccess }: SessionSelectorProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();

      if (response.ok) {
        setSessions(data.sessions);
        setStats(data.stats);
      } else {
        setError(data.error || 'Erreur lors du chargement des sessions');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSession = async () => {
    if (!selectedSession) return;

    setIsBooking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inscription_id: inscriptionId,
          session_id: selectedSession,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Rediriger vers le test PRE
        window.location.href = `/test/pre?inscription_id=${inscriptionId}`;
      } else {
        setError(data.error || 'Erreur lors de la réservation');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  const getSessionTime = () => {
    return '9h00 - 13h00';
  };

  const getMonthSessions = (month: string) => {
    return sessions.filter((session) => {
      const date = new Date(session.session_date);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'long' });
      return monthName.toLowerCase() === month.toLowerCase();
    });
  };

  const getAvailabilityColor = (session: Session) => {
    const percentage = (session.current_participants / session.max_participants) * 100;
    if (percentage >= 100) return 'bg-red-100 border-red-300 text-red-700';
    if (percentage >= 80) return 'bg-orange-100 border-orange-300 text-orange-700';
    if (percentage >= 50) return 'bg-yellow-100 border-yellow-300 text-yellow-700';
    return 'bg-green-100 border-green-300 text-green-700';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      {stats && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Places Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{stats.availableSpots}</div>
                <div className="text-sm text-muted-foreground">Places restantes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{stats.totalBooked}</div>
                <div className="text-sm text-muted-foreground">Déjà inscrits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.totalCapacity}</div>
                <div className="text-sm text-muted-foreground">Capacité totale</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats.totalSessions}</div>
                <div className="text-sm text-muted-foreground">Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sélection de session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Choisissez votre date de masterclass
          </CardTitle>
          <CardDescription>
            Sélectionnez la date qui vous convient le mieux. 12 sessions disponibles, 25 places par session (300 places au total).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sessions Octobre */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">📅 Octobre 2025</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getMonthSessions('octobre').map((session) => (
                <button
                  key={session.id}
                  onClick={() => !session.is_full && setSelectedSession(session.id)}
                  disabled={session.is_full}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all text-left
                    ${selectedSession === session.id ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-200 hover:border-primary/50'}
                    ${session.is_full ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-foreground">
                        {formatDate(session.session_date)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getSessionTime()}
                      </div>
                    </div>
                    {selectedSession === session.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(session)}`}>
                    <Users className="h-3 w-3" />
                    {session.current_participants}/{session.max_participants} places
                  </div>
                  {session.is_full && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      COMPLET
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sessions Novembre */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">📅 Novembre 2025</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getMonthSessions('novembre').map((session) => (
                <button
                  key={session.id}
                  onClick={() => !session.is_full && setSelectedSession(session.id)}
                  disabled={session.is_full}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all text-left
                    ${selectedSession === session.id ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-200 hover:border-primary/50'}
                    ${session.is_full ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-foreground">
                        {formatDate(session.session_date)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getSessionTime()}
                      </div>
                    </div>
                    {selectedSession === session.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(session)}`}>
                    <Users className="h-3 w-3" />
                    {session.current_participants}/{session.max_participants} places
                  </div>
                  {session.is_full && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      COMPLET
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Messages d'erreur/succès */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-accent bg-accent/10">
              <CheckCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="text-accent">{success}</AlertDescription>
            </Alert>
          )}

          {/* Bouton de confirmation */}
          <Button
            onClick={handleBookSession}
            disabled={!selectedSession || isBooking}
            size="lg"
            className="w-full"
          >
            {isBooking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Réservation en cours...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmer ma réservation
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground">
            Après la réservation, vous passerez le test de pré-évaluation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
