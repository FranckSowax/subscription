'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_choice: string;
}

interface QuestionEditDialogProps {
  question: Question;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuestionEditDialog({ question, onClose, onSuccess }: QuestionEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    question_text: question.question_text,
    choices: { ...question.choices },
    correct_choice: question.correct_choice,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la question</DialogTitle>
          <DialogDescription>
            Modifiez le texte de la question, les choix de réponse ou la réponse correcte
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question_text">Question</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              rows={3}
              required
            />
          </div>

          {/* Choices */}
          <div className="space-y-4">
            <Label>Choix de réponse</Label>
            
            <div className="space-y-2">
              <Label htmlFor="choice_a" className="text-sm font-normal">
                A)
              </Label>
              <Input
                id="choice_a"
                value={formData.choices.A}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    choices: { ...formData.choices, A: e.target.value },
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="choice_b" className="text-sm font-normal">
                B)
              </Label>
              <Input
                id="choice_b"
                value={formData.choices.B}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    choices: { ...formData.choices, B: e.target.value },
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="choice_c" className="text-sm font-normal">
                C)
              </Label>
              <Input
                id="choice_c"
                value={formData.choices.C}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    choices: { ...formData.choices, C: e.target.value },
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="choice_d" className="text-sm font-normal">
                D)
              </Label>
              <Input
                id="choice_d"
                value={formData.choices.D}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    choices: { ...formData.choices, D: e.target.value },
                  })
                }
                required
              />
            </div>
          </div>

          {/* Correct Answer */}
          <div className="space-y-2">
            <Label htmlFor="correct_choice">Réponse correcte</Label>
            <Select
              value={formData.correct_choice}
              onValueChange={(value) =>
                setFormData({ ...formData, correct_choice: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A) {formData.choices.A}</SelectItem>
                <SelectItem value="B">B) {formData.choices.B}</SelectItem>
                <SelectItem value="C">C) {formData.choices.C}</SelectItem>
                <SelectItem value="D">D) {formData.choices.D}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
