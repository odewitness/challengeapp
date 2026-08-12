-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run

create table if not exists challenges (
  id text primary key,
  nom text not null,
  description text,
  ordre_affichage int default 0
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
  texte text
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

-- Row Level Security : chacun ne voit/modifie que ses propres données de
-- progression et de favoris. Le contenu du challenge (challenges/exercises)
-- est lisible par tout utilisateur connecté.

alter table challenges enable row level security;
alter table exercises enable row level security;
alter table progress enable row level security;
alter table favorites enable row level security;

create policy "Lecture challenges pour tous les connectés"
  on challenges for select
  using (auth.role() = 'authenticated');

create policy "Lecture exercices pour tous les connectés"
  on exercises for select
  using (auth.role() = 'authenticated');

create policy "Chacun gère sa propre progression"
  on progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Chacun gère ses propres favoris"
  on favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
