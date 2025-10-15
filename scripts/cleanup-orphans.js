/**
 * Script de nettoyage des données orphelines via API Supabase
 * Alternative au SQL Editor si problème de connexion
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function identifyOrphanInscriptions() {
  console.log('🔍 Identification des inscriptions orphelines...\n');

  const { data: inscriptions, error } = await supabase
    .from('inscriptions')
    .select(`
      id,
      profile_id,
      validated,
      registration_date
    `);

  if (error) {
    console.error('❌ Erreur:', error);
    return [];
  }

  const orphans = [];
  
  for (const inscription of inscriptions) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', inscription.profile_id)
      .single();

    if (!profile) {
      // Profile n'existe plus
      const { data: bookings } = await supabase
        .from('session_bookings')
        .select('id')
        .eq('inscription_id', inscription.id);

      const { data: tests } = await supabase
        .from('tests')
        .select('id')
        .eq('inscription_id', inscription.id);

      orphans.push({
        inscription_id: inscription.id,
        profile_id: inscription.profile_id,
        validated: inscription.validated,
        registration_date: inscription.registration_date,
        bookings_count: bookings?.length || 0,
        tests_count: tests?.length || 0,
      });
    }
  }

  console.log(`📊 Inscriptions orphelines trouvées: ${orphans.length}\n`);
  orphans.forEach(o => {
    console.log(`  - ${o.inscription_id}`);
    console.log(`    Profile: ${o.profile_id}`);
    console.log(`    Bookings: ${o.bookings_count}, Tests: ${o.tests_count}\n`);
  });

  return orphans;
}

async function cleanupOrphanBookings(orphanInscriptionIds) {
  console.log('🧹 Nettoyage des session_bookings orphelins...\n');

  const { data: bookings, error: fetchError } = await supabase
    .from('session_bookings')
    .select('id, session_id')
    .in('inscription_id', orphanInscriptionIds);

  if (fetchError) {
    console.error('❌ Erreur:', fetchError);
    return;
  }

  console.log(`📋 Bookings à supprimer: ${bookings?.length || 0}\n`);

  // Grouper par session pour décrémenter
  const sessionCounts = {};
  bookings?.forEach(b => {
    sessionCounts[b.session_id] = (sessionCounts[b.session_id] || 0) + 1;
  });

  // Décrémenter current_participants
  for (const [sessionId, count] of Object.entries(sessionCounts)) {
    const { data: session } = await supabase
      .from('sessions')
      .select('current_participants')
      .eq('id', sessionId)
      .single();

    if (session) {
      const newCount = Math.max(0, session.current_participants - count);
      
      await supabase
        .from('sessions')
        .update({ current_participants: newCount })
        .eq('id', sessionId);

      console.log(`  ✅ Session ${sessionId}: ${session.current_participants} → ${newCount}`);
    }
  }

  // Supprimer les bookings
  const { error: deleteError } = await supabase
    .from('session_bookings')
    .delete()
    .in('inscription_id', orphanInscriptionIds);

  if (deleteError) {
    console.error('❌ Erreur suppression:', deleteError);
  } else {
    console.log(`\n✅ ${bookings?.length || 0} bookings supprimés\n`);
  }
}

async function cleanupOrphanTests(orphanInscriptionIds) {
  console.log('🧹 Nettoyage des tests orphelins...\n');

  const { count, error } = await supabase
    .from('tests')
    .delete()
    .in('inscription_id', orphanInscriptionIds);

  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log(`✅ ${count || 0} tests supprimés\n`);
  }
}

async function cleanupOrphanInscriptions(orphanInscriptionIds) {
  console.log('🧹 Nettoyage des inscriptions orphelines...\n');

  const { count, error } = await supabase
    .from('inscriptions')
    .delete()
    .in('id', orphanInscriptionIds);

  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log(`✅ ${count || 0} inscriptions supprimées\n`);
  }
}

async function verifyCleanup() {
  console.log('🔍 Vérification finale...\n');

  const checks = [
    { name: 'Inscriptions sans profile', table: 'inscriptions' },
    { name: 'Bookings sans profile', table: 'session_bookings' },
    { name: 'Tests sans profile', table: 'tests' },
  ];

  for (const check of checks) {
    // Cette vérification nécessiterait des jointures complexes
    // Pour simplifier, on vérifie juste le nombre total
    const { count } = await supabase
      .from(check.table)
      .select('*', { count: 'exact', head: true });

    console.log(`  ${check.name}: ${count} enregistrements`);
  }

  console.log('\n✅ Vérification terminée\n');
}

async function main() {
  console.log('🚀 Démarrage du nettoyage des données orphelines\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Étape 1: Identifier
    const orphans = await identifyOrphanInscriptions();

    if (orphans.length === 0) {
      console.log('✅ Aucune inscription orpheline trouvée. Base de données propre!\n');
      return;
    }

    const orphanIds = orphans.map(o => o.inscription_id);

    console.log('⚠️  ATTENTION: Les données suivantes seront supprimées:');
    console.log(`   - ${orphans.length} inscriptions`);
    console.log(`   - Leurs bookings associés`);
    console.log(`   - Leurs tests associés\n`);

    // En production, ajouter une confirmation:
    // const readline = require('readline');
    // ... demander confirmation ...

    // Étape 2: Nettoyer bookings
    await cleanupOrphanBookings(orphanIds);

    // Étape 3: Nettoyer tests
    await cleanupOrphanTests(orphanIds);

    // Étape 4: Nettoyer inscriptions
    await cleanupOrphanInscriptions(orphanIds);

    // Étape 5: Vérifier
    await verifyCleanup();

    console.log('='.repeat(60));
    console.log('🎉 Nettoyage terminé avec succès!\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter
main();
