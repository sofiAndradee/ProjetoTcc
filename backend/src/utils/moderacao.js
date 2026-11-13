// Filtro de palavras impróprias (pt-BR).
// Importante: a checagem de verdade é a do BACK-END; a do front só dá resposta rápida.
// Para ampliar o filtro, basta adicionar termos (sem acento, minúsculos) na lista abaixo.

const PALAVRAS_PROIBIDAS = [
  "porra", "caralho", "merda", "bosta", "puta", "puto", "putaria", "buceta",
  "boceta", "piroca", "foda", "foder", "fodido", "fodase", "fdp", "vsf", "vtnc",
  "cacete", "arrombado", "babaca", "cu", "cuzao", "viado", "vadia", "vagabunda",
  "vagabundo", "otario", "escroto", "punheta", "retardado", "mongoloide",
  "desgracado", "filho da puta", "pau no cu", "vai se foder", "toma no cu",
];

// minúsculas, sem acento e com "leetspeak" desfeito (p0rr@ -> porra)
function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/0/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/3/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/7/g, "t");
}

// "p.u.t.a", "p u t a", "p-u-t-a" -> "puta"
function juntarLetrasSeparadas(texto) {
  return texto.replace(/\b(?:[a-z][\s.\-_*]+){2,}[a-z]\b/g, (m) => m.replace(/[\s.\-_*]+/g, ""));
}

// "puuuta" -> "puta"
const colapsar = (t) => t.replace(/(.)\1+/g, "$1");

const LISTA = PALAVRAS_PROIBIDAS.map((p) => colapsar(normalizar(p)));

// Compara palavra inteira (evita bloquear "culpa" ou "computador" por conter "cu"/"puto").
function verificarTexto(texto = "") {
  const base = juntarLetrasSeparadas(normalizar(texto));
  const limpo = colapsar(base).replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  const cercado = ` ${limpo} `;
  const encontradas = LISTA.filter((p) => cercado.includes(` ${p} `));
  return { ok: encontradas.length === 0, encontradas };
}

// { campo: "texto" } -> { campo: "mensagem" } só dos campos reprovados
function verificarCampos(campos) {
  const erros = {};
  Object.entries(campos).forEach(([nome, valor]) => {
    if (!verificarTexto(valor).ok) {
      erros[nome] = "Este campo contém linguagem imprópria. Reescreva para publicar.";
    }
  });
  return erros;
}

module.exports = { verificarTexto, verificarCampos };
