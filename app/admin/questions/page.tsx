'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QuestionUpload } from '@/components/admin/QuestionUpload';
import { QuestionList } from '@/components/admin/QuestionList';

export default function AdminQuestionsPage() {
  const [masterclassId, setMasterclassId] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Fetch or create default masterclass
    const fetchMasterclass = async () => {
      try {
        const response = await fetch('/api/masterclass/default');
        const data = await response.json();
        if (data.masterclass) {
          setMasterclassId(data.masterclass.id);
        }
      } catch (error) {
        console.error('Error fetching masterclass:', error);
      }
    };

    fetchMasterclass();
  }, []);

  const handleUploadSuccess = () => {
    // Trigger refresh of question list
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!masterclassId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-semibold text-primary">Gestion des Questions</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Banque de Questions QCM</h2>
            <p className="text-muted-foreground">
              Générez automatiquement des questions depuis un PDF ou gérez-les manuellement
            </p>
          </div>

          {/* Upload Section */}
          <QuestionUpload masterclassId={masterclassId} onSuccess={handleUploadSuccess} />

          {/* Questions List */}
          <QuestionList masterclassId={masterclassId} refreshTrigger={refreshTrigger} />
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
