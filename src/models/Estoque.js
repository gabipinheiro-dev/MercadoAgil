export class Estoque {
  #quantidades = new Map();

  cadastrar(produtoId, quantidade) {
    this.#quantidades.set(produtoId, quantidade);
  }

  remover(produtoId) {
    this.#quantidades.delete(produtoId);
  }

  repor(produtoId, quantidade) {
    this.#quantidades.set(produtoId, this.disponivel(produtoId) + quantidade);
  }

  disponivel(produtoId) {
    return this.#quantidades.get(produtoId) ?? 0;
  }

  verificar(itens) {
    return itens
      .map(({ produto, quantidade }) => ({
        produto,
        pedido: quantidade,
        disponivel: this.disponivel(produto.id),
      }))
      .filter(({ pedido, disponivel }) => pedido > disponivel);
  }

  darBaixa(itens) {
    itens.forEach(({ produto, quantidade }) =>
      this.#quantidades.set(produto.id, this.disponivel(produto.id) - quantidade),
    );
  }

  devolver(itens) {
    itens.forEach(({ produto, quantidade }) =>
      this.#quantidades.set(produto.id, this.disponivel(produto.id) + quantidade),
    );
  }
}
