import { z } from 'zod';

export const registrationSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Le nom complet doit contenir au moins 2 caractères')
    .max(100, 'Le nom complet ne peut pas dépasser 100 caractères'),
  
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Veuillez entrer une adresse email valide'),
  
  whatsapp_number: z
    .string()
    .min(1, 'Le numéro WhatsApp est requis')
    .regex(
      /^\+?[0-9]{8,15}$/,
      'Veuillez entrer un numéro WhatsApp valide (ex: +241XXXXXXXX)'
    ),
  
  consent: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Vous devez accepter la politique de confidentialité',
    }),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
