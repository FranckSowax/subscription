'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  email: string;
  date_of_birth: string;
  whatsapp_number: string;
  gender: string;
  field_of_study: string | null;
  education_level: string | null;
  masterclass: string;
  validated: boolean;
  registration_date: string;
  pre_test_score: string;
  pre_test_percentage: number;
  pre_test_date: string | null;
  post_test_score: string;
  post_test_percentage: number;
  post_test_date: string | null;
  improvement: number | null;
}

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/students');
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/students?format=csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `etudiants_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erreur lors de l\'export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const stats = {
    total: students.length,
    validated: students.filter((s) => s.validated).length,
    preTestCompleted: students.filter((s) => s.pre_test_percentage > 0).length,
    postTestCompleted: students.filter((s) => s.post_test_percentage > 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inscrits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Validés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.validated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pré-Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.preTestCompleted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Post-Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.postTestCompleted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des Étudiants ({students.length})</CardTitle>
            <Button onClick={handleExportCSV} disabled={isExporting || students.length === 0}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Export...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter CSV
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun étudiant inscrit pour le moment
            </div>
          ) : (
            <>
              {/* Desktop Table View - hidden on mobile */}
              <div className="hidden lg:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead>Filière</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Pré-Test</TableHead>
                      <TableHead>Post-Test</TableHead>
                      <TableHead>Progression</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.full_name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {student.email}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.whatsapp_number}
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.gender === 'Homme' ? 'default' : 'secondary'}>
                            {student.gender}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {student.field_of_study || <span className="text-muted-foreground">N/A</span>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {student.education_level || <span className="text-muted-foreground">N/A</span>}
                        </TableCell>
                        <TableCell>
                          {student.validated ? (
                            <Badge className="bg-accent text-accent-foreground">
                              Validé
                            </Badge>
                          ) : (
                            <Badge variant="secondary">En attente</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.pre_test_percentage > 0 ? (
                            <div className="space-y-1">
                              <div className="font-medium">{student.pre_test_score}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.pre_test_percentage}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Non passé</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.post_test_percentage > 0 ? (
                            <div className="space-y-1">
                              <div className="font-medium">{student.post_test_score}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.post_test_percentage}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Non passé</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.improvement !== null ? (
                            <div className="flex items-center gap-1">
                              {student.improvement > 0 ? (
                                <>
                                  <TrendingUp className="h-4 w-4 text-accent" />
                                  <span className="text-accent font-medium">
                                    +{student.improvement}%
                                  </span>
                                </>
                              ) : student.improvement < 0 ? (
                                <>
                                  <TrendingDown className="h-4 w-4 text-destructive" />
                                  <span className="text-destructive font-medium">
                                    {student.improvement}%
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Minus className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">0%</span>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View - hidden on desktop */}
              <div className="lg:hidden space-y-4">
                {students.map((student) => (
                  <Card key={student.id} className="border-2">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-lg">{student.full_name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                        {student.validated ? (
                          <Badge className="bg-accent text-accent-foreground">
                            Validé
                          </Badge>
                        ) : (
                          <Badge variant="secondary">En attente</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Téléphone</p>
                          <p className="font-mono">{student.whatsapp_number}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Genre</p>
                          <Badge variant={student.gender === 'Homme' ? 'default' : 'secondary'} className="mt-1">
                            {student.gender}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Pré-Test</p>
                          {student.pre_test_percentage > 0 ? (
                            <div>
                              <p className="font-medium">{student.pre_test_score}</p>
                              <p className="text-xs text-muted-foreground">{student.pre_test_percentage}%</p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">Non passé</p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground">Post-Test</p>
                          {student.post_test_percentage > 0 ? (
                            <div>
                              <p className="font-medium">{student.post_test_score}</p>
                              <p className="text-xs text-muted-foreground">{student.post_test_percentage}%</p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">Non passé</p>
                          )}
                        </div>
                      </div>

                      {student.improvement !== null && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <p className="text-sm text-muted-foreground">Progression:</p>
                          {student.improvement > 0 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-accent" />
                              <span className="text-accent font-medium">
                                +{student.improvement}%
                              </span>
                            </>
                          ) : student.improvement < 0 ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-destructive" />
                              <span className="text-destructive font-medium">
                                {student.improvement}%
                              </span>
                            </>
                          ) : (
                            <>
                              <Minus className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">0%</span>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
