export class Produto {
  constructor({ id, nome, preco, categoria, vendedor }) {
    this.id = id;
    this.nome = nome;
    this.preco = preco;
    this.categoria = categoria;
    this.vendedor = vendedor; // instância de Vendedor
  }
}
