'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registrationSchema, type RegistrationFormData } from '@/lib/validations/registration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function RegistrationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Une erreur est survenue lors de l\'inscription');
      }

      // Redirect to session selection with inscription ID
      router.push(`/inscription/session/${result.data.inscription_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Inscription à la Masterclass IA</CardTitle>
        <CardDescription>
          Remplissez le formulaire ci-dessous pour vous inscrire. Vous choisirez ensuite votre date de masterclass.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Nom complet <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              type="text"
              placeholder="Ex: Laura Ndong"
              {...register('full_name')}
              disabled={isLoading}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Adresse email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">
              Numéro de téléphone
            </Label>
            <Input
              id="whatsapp_number"
              type="tel"
              placeholder="+237 6XX XX XX XX"
              {...register('whatsapp_number')}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Nous utiliserons ce numéro pour vous contacter si nécessaire
            </p>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start space-x-2">
            <input
              id="consent"
              type="checkbox"
              {...register('consent')}
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="consent" className="text-sm font-normal cursor-pointer">
              J&apos;accepte que mes données personnelles soient collectées et traitées conformément à la{' '}
              <a href="/privacy" className="text-primary hover:underline">
                politique de confidentialité
              </a>
              . <span className="text-destructive">*</span>
            </Label>
          </div>
          {errors.consent && (
            <p className="text-sm text-destructive">{errors.consent.message}</p>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inscription en cours...
              </>
            ) : (
              'Choisir la date de session'
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Après l&apos;inscription, vous choisirez votre date de masterclass.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
