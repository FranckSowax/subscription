'use client';

import Link from 'next/link';
import { ArrowLeft, Users, FileQuestion, BarChart3, Calendar } from 'lucide-react';
import { StudentList } from '@/components/admin/StudentList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
            <h1 className="text-2xl font-semibold text-primary">Dashboard Admin</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Tableau de Bord</h2>
            <p className="text-muted-foreground">
              Gérez les étudiants, les questions et visualisez les statistiques
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/admin/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Étudiants</CardTitle>
                      <CardDescription>Gérer les inscriptions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Voir la liste complète, exporter les données
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/sessions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-accent">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle>Sessions</CardTitle>
                      <CardDescription>Inscrits par jour</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Voir les participants par session
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/questions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <FileQuestion className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle>Questions</CardTitle>
                      <CardDescription>Banque de questions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Générer, modifier, supprimer des questions
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/stats">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-secondary rounded-lg">
                      <BarChart3 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle>Statistiques</CardTitle>
                      <CardDescription>Analyses détaillées</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Genre, inscriptions, tests
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Student List */}
          <StudentList />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Masterclass IA. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
