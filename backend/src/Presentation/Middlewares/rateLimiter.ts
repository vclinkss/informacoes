import rateLimit from "express-rate-limit";

// Limita tentativas de login por IP, pra dificultar ataque de força bruta de senha.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login. Aguarde alguns minutos e tente de novo." },
});

// Limita cadastros por IP, pra dificultar criação em massa de contas falsas.
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitos cadastros a partir deste endereço. Aguarde um pouco e tente de novo." },
});
