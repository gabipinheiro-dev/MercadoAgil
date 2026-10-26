const CNPJ_TECHBAHIA = '11.222.333/0001-81';
const CNPJ_LIVRARIA_SOL = '11.444.777/0001-61';
const CNPJ_EMPORIO = '06.990.590/0001-23';

export const vendedoresSeed = [
  { nomeLoja: 'TechBahia', cnpj: CNPJ_TECHBAHIA, email: 'contato@techbahia.com.br' },
  { nomeLoja: 'Livraria Sol', cnpj: CNPJ_LIVRARIA_SOL, email: 'vendas@livrariasol.com.br' },
  { nomeLoja: 'Empório Nordestino', cnpj: CNPJ_EMPORIO, email: 'oi@emporionordestino.com.br' },
];

export const clientesSeed = [
  { nome: 'Ana Souza', email: 'ana.souza@exemplo.com', cpf: '529.982.247-25', uf: 'BA' },
  { nome: 'Bruno Lima', email: 'bruno.lima@exemplo.com', cpf: '111.444.777-35', uf: 'SP' },
  { nome: 'Carla Mendes', email: 'carla.mendes@exemplo.com', cpf: '123.456.789-09', uf: 'RS' },
];

export const produtosSeed = [
  { nome: 'Mouse', preco: 120, categoria: 'eletronicos', vendedorCnpj: CNPJ_TECHBAHIA, estoque: 5 },
  { nome: 'Teclado Mecânico', preco: 250, categoria: 'eletronicos', vendedorCnpj: CNPJ_TECHBAHIA, estoque: 3 },
  { nome: 'Fone Bluetooth', preco: 180, categoria: 'eletronicos', vendedorCnpj: CNPJ_TECHBAHIA, estoque: 8 },
  { nome: 'Livro de JavaScript', preco: 80, categoria: 'livros', vendedorCnpj: CNPJ_LIVRARIA_SOL, estoque: 10 },
  { nome: 'Livro de Node.js', preco: 95, categoria: 'livros', vendedorCnpj: CNPJ_LIVRARIA_SOL, estoque: 6 },
  { nome: 'Café Torrado 500g', preco: 24.9, categoria: 'alimentos', vendedorCnpj: CNPJ_EMPORIO, estoque: 20 },
  { nome: 'Camiseta Básica', preco: 59.9, categoria: 'vestuario', vendedorCnpj: CNPJ_EMPORIO, estoque: 15 },
  { nome: 'Jarra Térmica', preco: 89.9, categoria: 'casa', vendedorCnpj: CNPJ_EMPORIO, estoque: 4 },
];

export const cuponsSeed = [
  { codigo: 'BEMVINDO10', tipo: 'percentual', valor: 10, validade: '2027-06-30', valorMinimo: 50, cumulativo: true },
  { codigo: 'PDA15', tipo: 'fixo', valor: 15, validade: '2027-06-30', valorMinimo: 100, cumulativo: true },
  { codigo: 'FRETEZERO', tipo: 'frete', valor: 0, validade: '2027-06-30', valorMinimo: 150, cumulativo: false },
];

// Retorna a lista de erros de carga (vazia quando tudo entrou)
export function carregarSeed(marketplace) {
  const resultados = [
    ...vendedoresSeed.map((dados) => marketplace.cadastrarVendedor(dados)),
    ...clientesSeed.map((dados) => marketplace.cadastrarCliente(dados)),
    ...produtosSeed.map((dados) => marketplace.cadastrarProduto(dados)),
    ...cuponsSeed.map((dados) => marketplace.cadastrarCupom(dados)),
  ];
  return resultados.filter((r) => !r.ok).flatMap((r) => r.erros);
}