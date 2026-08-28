-- Migration : édition des challenges dans l'app.
-- À exécuter UNE FOIS dans Supabase (SQL Editor) sur une base déjà créée avec
-- l'ancien schema.sql. Idempotent — sans effet si déjà appliqué.

-- 1. Colonne propriétaire (NULL = contenu livré avec l'app, lecture seule)
alter table challenges add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table exercises  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

-- 1 bis. Source de la vidéo ('youtube' par défaut, 'instagram' possible)
alter table exercises add column if not exists source text not null default 'youtube';

-- 2. Lecture : contenu de l'app (owner_id NULL) + le sien
drop policy if exists "Lecture challenges pour tous les connectés" on challenges;
drop policy if exists "Lecture challenges (app + les miens)" on challenges;
create policy "Lecture challenges (app + les miens)"
  on challenges for select
  using (auth.role() = 'authenticated' and (owner_id is null or owner_id = auth.uid()));

drop policy if exists "Lecture exercices pour tous les connectés" on exercises;
drop policy if exists "Lecture exercices (app + les miens)" on exercises;
create policy "Lecture exercices (app + les miens)"
  on exercises for select
  using (auth.role() = 'authenticated' and (owner_id is null or owner_id = auth.uid()));

-- 3. Écriture réservée au propriétaire
drop policy if exists "Créer ses challenges" on challenges;
create policy "Créer ses challenges" on challenges for insert with check (owner_id = auth.uid());
drop policy if exists "Modifier ses challenges" on challenges;
create policy "Modifier ses challenges" on challenges for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "Supprimer ses challenges" on challenges;
create policy "Supprimer ses challenges" on challenges for delete using (owner_id = auth.uid());

drop policy if exists "Créer ses exercices" on exercises;
create policy "Créer ses exercices" on exercises for insert with check (owner_id = auth.uid());
drop policy if exists "Modifier ses exercices" on exercises;
create policy "Modifier ses exercices" on exercises for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "Supprimer ses exercices" on exercises;
create policy "Supprimer ses exercices" on exercises for delete using (owner_id = auth.uid());
