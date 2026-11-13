// Endereço da API. Em produção (Docker) o nginx repassa /api para o Node,
// então o caminho relativo funciona sem mudar nada. Em desenvolvimento, o proxy do
// vite.config.js manda /api para http://localhost:3000.
// Se precisar apontar para outro servidor, defina VITE_API_URL no .env do front.
export const API = import.meta.env.VITE_API_URL || "/api";
