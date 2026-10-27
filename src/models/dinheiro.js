export const arredondar = (valor) => Math.round((Number(valor) + Number.EPSILON) * 100) / 100;

export const formatarReal = (valor) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });