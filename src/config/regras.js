export const TAXA_FRETE_POR_REGIAO = {
  Norte: 35,
  Nordeste: 25,
  'Centro-Oeste': 30,
  Sudeste: 20,
  Sul: 22,
};
export const VALOR_POR_UNIDADE_FRETE = 1.5;
export const FRETE_GRATIS_ACIMA = 300;

export const TETO_DESCONTO_PERCENTUAL = 0.3; 
export const MAX_CUPONS_POR_PEDIDO = 2;

export const ALIQUOTA_TRIBUTOS = {
  eletronicos: 0.12,
  livros: 0,
  alimentos: 0.05,
  vestuario: 0.08,
  casa: 0.1,
};
export const COMISSAO = {
  eletronicos: 0.08,
  livros: 0.15,
  alimentos: 0.1,
  vestuario: 0.12,
  casa: 0.1,
};
export const CATEGORIAS = Object.keys(ALIQUOTA_TRIBUTOS);

const UFS_POR_REGIAO = {
  Norte: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
  Nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
  Sudeste: ['ES', 'MG', 'RJ', 'SP'],
  Sul: ['PR', 'RS', 'SC'],
};
export const REGIAO_POR_UF = Object.fromEntries(
  Object.entries(UFS_POR_REGIAO).flatMap(([regiao, ufs]) => ufs.map((uf) => [uf, regiao])),
);
export const UFS = Object.keys(REGIAO_POR_UF);
