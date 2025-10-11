'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, UserCheck, UserX, Award, TrendingUp, Loader2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalStudents: number;
  maleCount: number;
  femaleCount: number;
  malePercentage: number;
  femalePercentage: number;
  validatedInscriptions: number;
  pendingInscriptions: number;
  totalPreTests: number;
  totalPostTests: number;
  avgPreScore: number;
  avgPostScore: number;
}

interface Student {
  id: string;
  full_name: string;
  whatsapp_number: string;
  gender: string;
  registration_date: string;
  validated: boolean;
  pre_test_score: number | null;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<string>('all');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (genderFilter === 'all') {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(s => s.gender === genderFilter));
    }
  }, [genderFilter, students]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
        setStudents(data.studentsByGender);
        setFilteredStudents(data.studentsByGender);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Nom', 'Téléphone', 'Genre', 'Date inscription', 'Score PRE', 'Validé'];
    const rows = filteredStudents.map(s => [
      s.full_name,
      s.whatsapp_number,
      s.gender || 'N/A',
      new Date(s.registration_date).toLocaleDateString('fr-FR'),
      s.pre_test_score?.toString() || 'N/A',
      s.validated ? 'Oui' : 'Non'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistiques_${genderFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              Statistiques
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Students */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalStudents}</div>
              </CardContent>
            </Card>

            {/* Male Students */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Hommes</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.maleCount}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.malePercentage}% du total
                </p>
              </CardContent>
            </Card>

            {/* Female Students */}
            <Card className="bg-gradient-to-br from-pink-50 to-pink-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Femmes</CardTitle>
                <Users className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.femaleCount}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.femalePercentage}% du total
                </p>
              </CardContent>
            </Card>

            {/* Validated */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Validés</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.validatedInscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.pendingInscriptions} en attente
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Test Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Tests PRE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total passés:</span>
                    <span className="font-semibold">{stats?.totalPreTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score moyen:</span>
                    <span className="font-semibold text-primary">{stats?.avgPreScore}/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Tests POST
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total passés:</span>
                    <span className="font-semibold">{stats?.totalPostTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score moyen:</span>
                    <span className="font-semibold text-accent">{stats?.avgPostScore}/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students Table with Gender Filter */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Liste des Étudiants par Genre</CardTitle>
                  <CardDescription>
                    {filteredStudents.length} étudiant(s) affiché(s)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">Tous</option>
                    <option value="Homme">Hommes</option>
                    <option value="Femme">Femmes</option>
                  </select>
                  <Button onClick={exportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun étudiant trouvé
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 rounded-lg border bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Nom</p>
                          <p className="font-semibold">{student.full_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Genre</p>
                          <Badge variant={student.gender === 'Homme' ? 'default' : 'secondary'}>
                            {student.gender || 'N/A'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Téléphone</p>
                          <p className="font-medium">{student.whatsapp_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Score PRE</p>
                          <p className="font-semibold text-primary">
                            {student.pre_test_score !== null ? `${student.pre_test_score}/10` : 'Non passé'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Statut</p>
                          <Badge variant={student.validated ? 'default' : 'secondary'}>
                            {student.validated ? 'Validé' : 'En attente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
