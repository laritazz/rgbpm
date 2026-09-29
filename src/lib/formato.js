/** 3:07 a partir de segundos. */
export const reloj = (s) => (Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00')

/** 1 h 12 min a partir de segundos (para duraciones largas, como un set). */
export const duracionLarga = (s) => {
  const min = Math.round((s ?? 0) / 60)
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`
}
