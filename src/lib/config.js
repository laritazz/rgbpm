// Configuración pública de RGBPM. Todo lo de aquí se puede ver en la web: nada secreto.
// En pruebas se cambia con variables VITE_* (archivo .env.local, que no se sube).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://qmsrldxqmtinuzzkjsgh.supabase.co'
export const SUPABASE_CLAVE = import.meta.env.VITE_SUPABASE_CLAVE ?? 'sb_publishable_J1Ke9kob4M5p1GUDYuMHbg_Mg2kB3KR' // publishable key (pública)
export const AUDIO_PRIVADO = import.meta.env.VITE_AUDIO_PRIVADO ?? 'https://creativezz.com/rgbpm-audio/'
