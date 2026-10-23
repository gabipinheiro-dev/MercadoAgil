// Regras de negócio num só lugar: frete, alíquotas, comissões, teto de desconto e limite de cupons.
// Se uma taxa mudar, mexemos aqui e o resto do sistema se atualiza.

// "export" deixa a constante disponível para outros arquivos
// (quem precisar usa: import { TETO_DESCONTO } from '../config/regras.js').
// "const" = o valor não pode ser reatribuído.

export const FRETE_POR_REGIAO = {
  norte: 35,
  nordeste: 25,
  'centro-oeste': 30, 
  sudeste: 20,
  sul: 22,
};

// Valor somado ao frete por unidade de produto no pedido
export const FRETE_POR_UNIDADE = 1.5; 

// Frete grátis quando o valor (já com descontos) chega a este valor
export const FRETE_GRATIS_A_PARTIR_DE = 300;

// Tributos aproximados (só informativos, não somam no total).
export const ALIQUOTAS_TRIBUTOS = {
  eletronicos: 0.12,
  livros: 0,
  alimentos: 0.05,
  vestuario: 0.08,
  casa: 0.1,
};

// Comissão do marketplace por categoria (sobre o valor dos itens, antes dos descontos)
export const COMISSOES = {
  eletronicos: 0.08,
  livros: 0.15,
  alimentos: 0.1,
  vestuario: 0.12,
  casa: 0.1,
};

// Os descontos somados nunca passam de 30% do subtotal
export const TETO_DESCONTO = 0.3;

// Máximo de cupons por pedido
export const MAX_CUPONS = 2;