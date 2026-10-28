export const ok = (dados) => ({ ok: true, dados });

export const erro = (...erros) => ({ ok: false, erros: erros.flat() });
