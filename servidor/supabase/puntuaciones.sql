-- RGBPM · récords de los juegos en Supabase
-- Pégalo en Supabase → SQL Editor → New query → Run. Se puede ejecutar dos veces sin romper nada.
--
-- Cada partida es una fila. Solo puedes leer y apuntar las tuyas (RLS); nadie puede cambiarlas ni borrarlas
-- desde la web. El récord de cada juego es la fila con más puntos.

create table if not exists public.puntuaciones (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  juego text not null check (juego ~ '^[a-z]{2,20}$'),           -- bpm, pega, cae, corre, cuadra… (sin tocar la tabla para juegos nuevos)
  puntos integer not null check (puntos >= 0),
  maximo integer not null check (maximo > 0 and puntos <= maximo),
  detalle jsonb not null default '{}'::jsonb check (pg_column_size(detalle) < 8000),
  creado timestamptz not null default now()
);

-- Para sacar «mi mejor partida de cada juego» sin recorrer toda la tabla
create index if not exists puntuaciones_usuario_juego on public.puntuaciones (user_id, juego, puntos desc);

alter table public.puntuaciones enable row level security;

drop policy if exists "leo mis puntuaciones" on public.puntuaciones;
create policy "leo mis puntuaciones" on public.puntuaciones
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "apunto mis puntuaciones" on public.puntuaciones;
create policy "apunto mis puntuaciones" on public.puntuaciones
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Sin políticas de update ni delete: una partida apuntada no se toca.
