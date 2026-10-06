// Qué temas entran en cada sitio según si suenan o no.
// Sugerencias y sets: solo los audibles (un set con temas mudos no sirve en cabina).
// Juegos: suenan siempre, con tu audio o con ritmo y acorde sintetizados (features/juego/useSonido).

/** Con menos temas con audio, los juegos tiran de toda la biblioteca para tener rondas variadas. */
export const MINIMO_PARA_JUGAR = 12

export const temasParaJugar = (audibles, temas) => (audibles.length >= MINIMO_PARA_JUGAR ? audibles : temas)
