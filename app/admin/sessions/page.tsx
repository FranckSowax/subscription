'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Download, Loader2, Printer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SessionWithParticipants {
  id: string;
  session_date: string;
  max_participants: number;
  current_participants: number;
  participants: {
    full_name: string;
    email: string;
    whatsapp_number: string;
    registration_date: string;
    pre_test_score: number | null;
    validated: boolean;
  }[];
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionWithParticipants[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions');
      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const exportSessionCSV = (session: SessionWithParticipants) => {
    const headers = ['Nom', 'Email', 'Téléphone', 'Date inscription', 'Score PRE', 'Validé'];
    const rows = session.participants.map(p => [
      p.full_name,
      p.email,
      p.whatsapp_number,
      new Date(p.registration_date).toLocaleDateString('fr-FR'),
      p.pre_test_score?.toString() || 'N/A',
      p.validated ? 'Oui' : 'Non'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `session_${session.session_date}_participants.csv`;
    link.click();
  };

  const printSessionList = (session: SessionWithParticipants) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const participantsHTML = session.participants.map((p, index) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px; text-align: center;">${index + 1}</td>
        <td style="padding: 12px 8px;">${p.full_name}</td>
        <td style="padding: 12px 8px; font-size: 0.875rem;">${p.email}</td>
        <td style="padding: 12px 8px;">${p.whatsapp_number}</td>
        <td style="padding: 12px 8px; text-align: center;">${new Date(p.registration_date).toLocaleDateString('fr-FR')}</td>
        <td style="padding: 12px 8px; text-align: center; font-weight: 600; color: #FF6B57;">${p.pre_test_score !== null ? `${p.pre_test_score}/10` : 'N/A'}</td>
        <td style="padding: 12px 8px; text-align: center;">
          <span style="padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; ${p.validated ? 'background: #dcfce7; color: #16a34a;' : 'background: #f3f4f6; color: #6b7280;'}">
            ${p.validated ? 'Validé' : 'En attente'}
          </span>
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Liste des participants - ${formatDate(session.session_date)}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              padding: 40px;
              color: #1f2937;
            }
            .header {
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #FF6B57;
            }
            .header h1 {
              font-size: 28px;
              color: #FF6B57;
              margin-bottom: 8px;
            }
            .header .subtitle {
              font-size: 18px;
              color: #6b7280;
              font-weight: 500;
            }
            .info-box {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .info-item {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .info-label {
              font-size: 0.875rem;
              color: #6b7280;
              font-weight: 500;
            }
            .info-value {
              font-size: 1.25rem;
              font-weight: 700;
              color: #1f2937;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            thead {
              background: linear-gradient(135deg, #FF6B57 0%, #FF8A7A 100%);
              color: white;
            }
            thead th {
              padding: 16px 8px;
              text-align: left;
              font-weight: 600;
              font-size: 0.875rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            tbody tr:nth-child(even) {
              background: #f9fafb;
            }
            tbody tr:hover {
              background: #f3f4f6;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 0.875rem;
            }
            @media print {
              body {
                padding: 20px;
              }
              .header h1 {
                font-size: 24px;
              }
              table {
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 Liste des Participants</h1>
            <div class="subtitle">Masterclass IA - ${formatDate(session.session_date)}</div>
          </div>
          
          <div class="info-box">
            <div class="info-item">
              <span class="info-label">Date de la session</span>
              <span class="info-value">${formatDate(session.session_date)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Horaires</span>
              <span class="info-value">9h00 - 15h00</span>
            </div>
            <div class="info-item">
              <span class="info-label">Participants</span>
              <span class="info-value">${session.current_participants}/${session.max_participants}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center; width: 50px;">#</th>
                <th style="width: 180px;">Nom Complet</th>
                <th style="width: 220px;">Email</th>
                <th style="width: 130px;">Téléphone</th>
                <th style="text-align: center; width: 120px;">Inscription</th>
                <th style="text-align: center; width: 100px;">Score PRE</th>
                <th style="text-align: center; width: 110px;">Statut</th>
              </tr>
            </thead>
            <tbody>
              ${participantsHTML}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>STUDIA CCPE</strong> - Masterclass Intelligence Artificielle 2025</p>
            <p style="margin-top: 8px;">Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedSessionData = sessions.find(s => s.id === selectedSession);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Inscrits par Session
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedSession === session.id
                    ? 'border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/10'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedSession(session.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        {formatDate(session.session_date)}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-2">
                    <Users className="h-4 w-4" />
                    {session.current_participants}/{session.max_participants} inscrits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={session.current_participants >= session.max_participants ? 'destructive' : 'default'}>
                      {session.current_participants >= session.max_participants ? 'Complet' : `${session.max_participants - session.current_participants} places`}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSessionCSV(session);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Session Details */}
          {selectedSessionData && (
            <Card className="border-2 border-primary">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {formatDate(selectedSessionData.session_date)}
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {selectedSessionData.current_participants} participant(s) inscrit(s)
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => printSessionList(selectedSessionData)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimer la liste
                    </Button>
                    <Button onClick={() => exportSessionCSV(selectedSessionData)}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {selectedSessionData.participants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun participant pour cette session
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedSessionData.participants.map((participant, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Nom</p>
                            <p className="font-semibold">{participant.full_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{participant.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Téléphone</p>
                            <p className="font-medium">{participant.whatsapp_number}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Inscription</p>
                            <p className="font-medium">
                              {new Date(participant.registration_date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Score PRE</p>
                            <p className="font-semibold text-primary">
                              {participant.pre_test_score !== null ? `${participant.pre_test_score}/10` : 'Non passé'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Statut</p>
                            <Badge variant={participant.validated ? 'default' : 'secondary'}>
                              {participant.validated ? 'Validé' : 'En attente'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
