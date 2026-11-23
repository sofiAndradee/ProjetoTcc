// Utilitários da busca global (menu -> /Busca?q=...)

// Minúsculas e sem acento, para "futebol" achar "Futebol" e "volei" achar "Vôlei".
// "Lutas marciais" (filtro do site) e "Artes marciais" (banco) são a mesma coisa.
export function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/lutas marciais/g, "artes marciais")
    .replace(/\s+/g, " ")
    .trim();
}

// Devolve só os itens que contêm TODAS as palavras digitadas (em qualquer ordem),
// ordenados por relevância: acerto no título vale mais que acerto no resto.
//   campos = { titulo: [...], outros: [...] }  (funções que recebem o item)
export function buscar(itens, termo, { titulo, outros }) {
  const palavras = normalizar(termo).split(" ").filter(Boolean);
  if (palavras.length === 0) return [];

  const resultado = [];
  itens.forEach((item, ordem) => {
    const tit = normalizar(titulo(item));
    const resto = normalizar(outros(item).filter(Boolean).join(" "));
    const tudo = `${tit} ${resto}`;

    if (!palavras.every((p) => tudo.includes(p))) return;

    let pontos = 0;
    for (const p of palavras) {
      if (tit.includes(p)) pontos += 3;
      if (tit.startsWith(p)) pontos += 1;
      if (resto.includes(p)) pontos += 1;
    }
    resultado.push({ item, pontos, ordem });
  });

  return resultado
    .sort((a, b) => b.pontos - a.pontos || a.ordem - b.ordem)
    .map((r) => r.item);
}
