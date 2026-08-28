-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run
-- (Pour une base déjà en place créée avec une version précédente, exécute
--  plutôt supabase/migration_challenge_editor.sql.)

create table if not exists challenges (
  id text primary key,
  nom text not null,
  description text,
  ordre_affichage int default 0,
  -- NULL = challenge livré avec l'app (lecture seule, visible par tous).
  -- Sinon = challenge créé par un utilisateur, modifiable par lui seul.
  owner_id uuid references auth.users(id) on delete cascade
);

create table if not exists exercises (
  id text primary key,
  challenge_id text references challenges(id) on delete cascade,
  semaine int not null,
  jour int not null,
  ordre int not null,
  titre text not null,
  video_id text not null,
  duree_min int,
  categorie text,
  materiel text,
  texte text,
  owner_id uuid references auth.users(id) on delete cascade
);

create table if not exists progress (
  user_id uuid references auth.users(id) on delete cascade,
  exercise_id text references exercises(id) on delete cascade,
  date_completed date not null default current_date,
  primary key (user_id, exercise_id)
);

create table if not exists favorites (
  user_id uuid references auth.users(id) on delete cascade,
  exercise_id text references exercises(id) on delete cascade,
  primary key (user_id, exercise_id)
);

create table if not exists active_challenges (
  user_id uuid references auth.users(id) on delete cascade,
  challenge_id text references challenges(id) on delete cascade,
  primary key (user_id, challenge_id)
);

-- Row Level Security : chacun ne voit/modifie que ses propres données de
-- progression, favoris et challenges suivis. Le contenu livré avec l'app
-- (challenges/exercises avec owner_id NULL) est lisible par tout utilisateur
-- connecté ; le contenu créé par un utilisateur n'est visible et modifiable
-- que par lui.

alter table challenges enable row level security;
alter table exercises enable row level security;
alter table progress enable row level security;
alter table favorites enable row level security;
alter table active_challenges enable row level security;

-- Challenges --------------------------------------------------------------

drop policy if exists "Lecture challenges pour tous les connectés" on challenges;
create policy "Lecture challenges (app + les miens)"
  on challenges for select
  using (
    auth.role() = 'authenticated'
    and (owner_id is null or owner_id = auth.uid())
  );

create policy "Créer ses challenges"
  on challenges for insert
  with check (owner_id = auth.uid());

create policy "Modifier ses challenges"
  on challenges for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Supprimer ses challenges"
  on challenges for delete
  using (owner_id = auth.uid());

-- Exercises ---------------------------------------------------------------

drop policy if exists "Lecture exercices pour tous les connectés" on exercises;
create policy "Lecture exercices (app + les miens)"
  on exercises for select
  using (
    auth.role() = 'authenticated'
    and (owner_id is null or owner_id = auth.uid())
  );

create policy "Créer ses exercices"
  on exercises for insert
  with check (owner_id = auth.uid());

create policy "Modifier ses exercices"
  on exercises for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Supprimer ses exercices"
  on exercises for delete
  using (owner_id = auth.uid());

-- Données personnelles --------------------------------------------------------

create policy "Chacun gère sa propre progression"
  on progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Chacun gère ses propres favoris"
  on favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Chacun gère ses propres challenges suivis"
  on active_challenges for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
