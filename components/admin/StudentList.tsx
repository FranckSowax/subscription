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
import { Download, Loader2, TrendingUp, TrendingDown, Minus, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtres
  const [searchName, setSearchName] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterField, setFilterField] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterValidated, setFilterValidated] = useState<string>('all');
  const [filterScore, setFilterScore] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('registration_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Fonction de filtrage et tri
  const getFilteredAndSortedStudents = () => {
    let filtered = [...students];

    // Filtre par nom
    if (searchName) {
      filtered = filtered.filter((s) =>
        s.full_name.toLowerCase().includes(searchName.toLowerCase()) ||
        s.email.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filtre par genre
    if (filterGender !== 'all') {
      filtered = filtered.filter((s) => s.gender === filterGender);
    }

    // Filtre par filière
    if (filterField !== 'all') {
      filtered = filtered.filter((s) => s.field_of_study === filterField);
    }

    // Filtre par niveau
    if (filterLevel !== 'all') {
      filtered = filtered.filter((s) => s.education_level === filterLevel);
    }

    // Filtre par statut de validation
    if (filterValidated !== 'all') {
      filtered = filtered.filter((s) => 
        filterValidated === 'validated' ? s.validated : !s.validated
      );
    }

    // Filtre par score
    if (filterScore !== 'all') {
      filtered = filtered.filter((s) => {
        const score = s.pre_test_percentage;
        switch (filterScore) {
          case 'low': return score > 0 && score < 50;
          case 'medium': return score >= 50 && score < 75;
          case 'high': return score >= 75;
          case 'not_taken': return score === 0;
          default: return true;
        }
      });
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortBy) {
        case 'name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'pre_score':
          aValue = a.pre_test_percentage;
          bValue = b.pre_test_percentage;
          break;
        case 'post_score':
          aValue = a.post_test_percentage;
          bValue = b.post_test_percentage;
          break;
        case 'improvement':
          aValue = a.improvement || -999;
          bValue = b.improvement || -999;
          break;
        case 'registration_date':
          aValue = new Date(a.registration_date).getTime();
          bValue = new Date(b.registration_date).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredStudents = getFilteredAndSortedStudents();

  // Extraire les valeurs uniques pour les filtres
  const uniqueFields = Array.from(new Set(students.map(s => s.field_of_study).filter(Boolean)));
  const uniqueLevels = Array.from(new Set(students.map(s => s.education_level).filter(Boolean)));

  const resetFilters = () => {
    setSearchName('');
    setFilterGender('all');
    setFilterField('all');
    setFilterLevel('all');
    setFilterValidated('all');
    setFilterScore('all');
    setSortBy('registration_date');
    setSortOrder('desc');
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
    filtered: filteredStudents.length,
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres et Tri
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <X className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
                {showFilters ? 'Masquer' : 'Afficher'}
              </Button>
              {(searchName || filterGender !== 'all' || filterField !== 'all' || filterLevel !== 'all' || filterValidated !== 'all' || filterScore !== 'all' || sortBy !== 'registration_date') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Recherche par nom */}
              <div className="space-y-2">
                <Label htmlFor="search">Recherche</Label>
                <Input
                  id="search"
                  placeholder="Nom ou email..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              {/* Filtre Genre */}
              <div className="space-y-2">
                <Label htmlFor="gender">Genre</Label>
                <select
                  id="gender"
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
              </div>

              {/* Filtre Filière */}
              <div className="space-y-2">
                <Label htmlFor="field">Filière</Label>
                <select
                  id="field"
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Toutes</option>
                  {uniqueFields.map((field) => (
                    <option key={field} value={field!}>{field}</option>
                  ))}
                </select>
              </div>

              {/* Filtre Niveau */}
              <div className="space-y-2">
                <Label htmlFor="level">Niveau</Label>
                <select
                  id="level"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Tous</option>
                  {uniqueLevels.map((level) => (
                    <option key={level} value={level!}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Filtre Statut */}
              <div className="space-y-2">
                <Label htmlFor="validated">Statut</Label>
                <select
                  id="validated"
                  value={filterValidated}
                  onChange={(e) => setFilterValidated(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="validated">Validés</option>
                  <option value="pending">En attente</option>
                </select>
              </div>

              {/* Filtre Score */}
              <div className="space-y-2">
                <Label htmlFor="score">Score PRÉ-Test</Label>
                <select
                  id="score"
                  value={filterScore}
                  onChange={(e) => setFilterScore(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="not_taken">Non passé</option>
                  <option value="low">&lt; 50% (Faible)</option>
                  <option value="medium">50-74% (Moyen)</option>
                  <option value="high">≥ 75% (Excellent)</option>
                </select>
              </div>

              {/* Tri */}
              <div className="space-y-2">
                <Label htmlFor="sort">Trier par</Label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="registration_date">Date d'inscription</option>
                  <option value="name">Nom</option>
                  <option value="pre_score">Score Pré-Test</option>
                  <option value="post_score">Score Post-Test</option>
                  <option value="improvement">Progression</option>
                </select>
              </div>

              {/* Ordre de tri */}
              <div className="space-y-2">
                <Label htmlFor="order">Ordre</Label>
                <select
                  id="order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="desc">Décroissant</option>
                  <option value="asc">Croissant</option>
                </select>
              </div>
            </div>

            {/* Résultats du filtre */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <span className="font-medium">
                {stats.filtered} résultat{stats.filtered > 1 ? 's' : ''} sur {stats.total} étudiant{stats.total > 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Liste des Étudiants ({stats.filtered}{stats.filtered !== stats.total && ` / ${stats.total}`})
            </CardTitle>
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
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun résultat ne correspond à vos critères de recherche
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
                    {filteredStudents.map((student) => (
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
                {filteredStudents.map((student) => (
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
