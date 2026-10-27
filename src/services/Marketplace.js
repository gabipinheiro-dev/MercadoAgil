import { Cliente } from '../models/Cliente.js';
import { Vendedor } from '../models/Vendedor.js';
import { Produto } from '../models/Produto.js';
import { CupomDesconto } from '../models/CupomDesconto.js';
import { Estoque } from '../models/Estoque.js';
import { Pedido } from '../models/Pedido.js';
import { clienteSchema } from '../schemas/clienteSchema.js';
import { vendedorSchema } from '../schemas/vendedorSchema.js';
import { produtoSchema } from '../schemas/produtoSchema.js';
import { cupomSchema } from '../schemas/cupomSchema.js';
import { soDigitos, validar } from '../schemas/validacoes.js';
import { erro, ok } from './resposta.js';
import { gerarRelatorio } from './relatorios.js';

const termoDeBusca = (termo) => String(termo ?? '').trim();


export class Marketplace {
  #clientes = [];
  #vendedores = [];
  #produtos = [];
  #cupons = [];
  #pedidos = [];
  #estoque = new Estoque();
  #proximoIdProduto = 1;
  #proximoIdPedido = 1;

  

  cadastrarCliente(dados) {
    const valido = validar(clienteSchema, dados);
    if (!valido.ok) return valido;
    if (this.#clientes.some((c) => c.cpf === valido.dados.cpf)) {
      return erro('Já existe um cliente com este CPF.');
    }
    const cliente = new Cliente(valido.dados);
    this.#clientes = [...this.#clientes, cliente];
    return ok(cliente.paraExibicao());
  }

  listarClientes() {
    return ok(this.#clientes.map((c) => c.paraExibicao()));
  }

  buscarCliente(termo) {
    const t = termoDeBusca(termo);
    if (!t) return erro('Digite um CPF ou um nome para buscar.');
    const cpf = soDigitos(t);
    const achados = this.#clientes.filter(
      (c) => c.cpf === cpf || c.nome.toLowerCase().includes(t.toLowerCase()),
    );
    return achados.length
      ? ok(achados.map((c) => c.paraExibicao()))
      : erro('Nenhum cliente encontrado.');
  }

  excluirCliente(cpf) {
    const alvo = this.#clientes.find((c) => c.cpf === soDigitos(cpf));
    if (!alvo) return erro('Cliente não encontrado.');
    if (this.#pedidos.some((p) => p.estaAberto && p.cliente === alvo)) {
      return erro('Este cliente tem pedido aberto. Confirme ou cancele o pedido antes.');
    }
    this.#clientes = this.#clientes.filter((c) => c !== alvo);
    return ok({ removido: alvo.nome });
  }

  

  cadastrarVendedor(dados) {
    const valido = validar(vendedorSchema, dados);
    if (!valido.ok) return valido;
    if (this.#vendedores.some((v) => v.cnpj === valido.dados.cnpj)) {
      return erro('Já existe um vendedor com este CNPJ.');
    }
    const vendedor = new Vendedor(valido.dados);
    this.#vendedores = [...this.#vendedores, vendedor];
    return ok({ ...vendedor });
  }

  listarVendedores() {
    return ok(this.#vendedores.map((v) => ({ ...v })));
  }

  buscarVendedor(termo) {
    const t = termoDeBusca(termo);
    if (!t) return erro('Digite um CNPJ ou um nome para buscar.');
    const cnpj = soDigitos(t);
    const achados = this.#vendedores.filter(
      (v) => v.cnpj === cnpj || v.nomeLoja.toLowerCase().includes(t.toLowerCase()),
    );
    return achados.length
      ? ok(achados.map((v) => ({ ...v })))
      : erro('Nenhum vendedor encontrado.');
  }

  excluirVendedor(cnpj) {
    const alvo = this.#vendedores.find((v) => v.cnpj === soDigitos(cnpj));
    if (!alvo) return erro('Vendedor não encontrado.');
    if (this.#produtos.some((p) => p.vendedor === alvo)) {
      return erro('Este vendedor tem produtos cadastrados. Exclua os produtos antes.');
    }
    this.#vendedores = this.#vendedores.filter((v) => v !== alvo);
    return ok({ removido: alvo.nomeLoja });
  }

  

  cadastrarProduto(dados) {
    const valido = validar(produtoSchema, dados);
    if (!valido.ok) return valido;

    const { estoque: quantidadeInicial, vendedorCnpj, ...dadosProduto } = valido.dados;
    const vendedor = this.#vendedores.find((v) => v.cnpj === vendedorCnpj);
    if (!vendedor) return erro('Vendedor não encontrado. Cadastre o vendedor antes do produto.');

    const produto = new Produto({ id: this.#proximoIdProduto++, ...dadosProduto, vendedor });
    this.#produtos = [...this.#produtos, produto];
    this.#estoque.cadastrar(produto.id, quantidadeInicial);
    return ok(this.#exibirProduto(produto));
  }

  listarProdutos() {
    return ok(this.#produtos.map((p) => this.#exibirProduto(p)));
  }

  buscarProduto(termo) {
    const t = termoDeBusca(termo).toLowerCase();
    if (!t) return erro('Digite um id ou um nome para buscar.');
    const achados = this.#produtos.filter(
      (p) => String(p.id) === t || p.nome.toLowerCase().includes(t),
    );
    return achados.length
      ? ok(achados.map((p) => this.#exibirProduto(p)))
      : erro('Nenhum produto encontrado.');
  }

  excluirProduto(id) {
    const alvo = this.#produtos.find((p) => p.id === Number(id));
    if (!alvo) return erro('Produto não encontrado.');
    if (this.#pedidos.some((p) => p.estaAberto && p.contemProduto(alvo.id))) {
      return erro('Este produto está em um pedido aberto. Remova-o do pedido antes.');
    }
    this.#produtos = this.#produtos.filter((p) => p !== alvo);
    this.#estoque.remover(alvo.id);
    return ok({ removido: alvo.nome });
  }

  reporEstoque(produtoId, quantidade) {
    const alvo = this.#produtos.find((p) => p.id === Number(produtoId));
    if (!alvo) return erro('Produto não encontrado.');
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return erro('A quantidade precisa ser um número inteiro maior que zero.');
    }
    this.#estoque.repor(alvo.id, quantidade);
    return ok(this.#exibirProduto(alvo));
  }

  #exibirProduto(produto) {
    return {
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      categoria: produto.categoria,
      vendedor: produto.vendedor.nomeLoja,
      estoque: this.#estoque.disponivel(produto.id),
    };
  }



  cadastrarCupom(dados) {
    const valido = validar(cupomSchema, dados);
    if (!valido.ok) return valido;
    if (this.#cupons.some((c) => c.codigo === valido.dados.codigo)) {
      return erro('Já existe um cupom com este código.');
    }
    const cupom = new CupomDesconto(valido.dados);
    this.#cupons = [...this.#cupons, cupom];
    return ok({ ...cupom });
  }

  listarCupons() {
    return ok(this.#cupons.map((c) => ({ ...c })));
  }

  buscarCupom(codigo) {
    const cupom = this.#cupom(codigo);
    return cupom ? ok({ ...cupom }) : erro('Cupom não encontrado.');
  }

  excluirCupom(codigo) {
    const cupom = this.#cupom(codigo);
    if (!cupom) return erro('Cupom não encontrado.');
    if (this.#pedidos.some((p) => p.estaAberto && p.contemCupom(cupom.codigo))) {
      return erro('Este cupom está em um pedido aberto. Remova-o do pedido antes.');
    }
    this.#cupons = this.#cupons.filter((c) => c !== cupom);
    return ok({ removido: cupom.codigo });
  }

  #cupom(codigo) {
    const alvo = termoDeBusca(codigo).toUpperCase();
    return this.#cupons.find((c) => c.codigo === alvo);
  }

 

  criarPedido(cpf) {
    const cliente = this.#clientes.find((c) => c.cpf === soDigitos(cpf));
    if (!cliente) return erro('Cliente não encontrado. Cadastre o cliente antes do pedido.');
    const pedido = new Pedido(this.#proximoIdPedido++, cliente);
    this.#pedidos = [...this.#pedidos, pedido];
    return ok(pedido.resumo());
  }

  listarPedidos() {
    return ok(
      this.#pedidos.map((p) => ({
        id: p.id,
        cliente: p.cliente.nome,
        status: p.status,
        itens: p.itensDetalhados().length,
        total: p.calcular().total,
      })),
    );
  }

  resumoPedido(pedidoId) {
    return this.#comPedido(pedidoId, (pedido) => ok(pedido.resumo()));
  }

  adicionarItem(pedidoId, produtoId, quantidade) {
    return this.#comPedido(pedidoId, (pedido) => {
      const produto = this.#produtos.find((p) => p.id === Number(produtoId));
      if (!produto) return erro('Produto não encontrado.');
      return this.#responder(pedido, pedido.adicionarItem(produto, Number(quantidade)));
    });
  }

  removerItem(pedidoId, produtoId) {
    return this.#comPedido(pedidoId, (pedido) =>
      this.#responder(pedido, pedido.removerItem(Number(produtoId))),
    );
  }

  aplicarCupom(pedidoId, codigo) {
    return this.#comPedido(pedidoId, (pedido) => {
      const cupom = this.#cupom(codigo);
      if (!cupom) return erro('Cupom não encontrado.');
      return this.#responder(pedido, pedido.aplicarCupom(cupom));
    });
  }

  removerCupom(pedidoId, codigo) {
    return this.#comPedido(pedidoId, (pedido) =>
      this.#responder(pedido, pedido.removerCupom(termoDeBusca(codigo).toUpperCase())),
    );
  }

  confirmarPedido(pedidoId) {
    return this.#comPedido(pedidoId, (pedido) =>
      this.#responder(pedido, pedido.confirmar(this.#estoque)),
    );
  }

  cancelarPedido(pedidoId) {
    return this.#comPedido(pedidoId, (pedido) =>
      this.#responder(pedido, pedido.cancelar(this.#estoque)),
    );
  }

  #comPedido(pedidoId, acao) {
    const pedido = this.#pedidos.find((p) => p.id === Number(pedidoId));
    return pedido ? acao(pedido) : erro('Pedido não encontrado.');
  }

  #responder(pedido, resultado) {
    return resultado.ok ? ok(pedido.resumo()) : resultado;
  }

 

  relatorioFinanceiro() {
    return ok(gerarRelatorio(this.#pedidos));
  }

  estoqueBaixo(limite = 2) {
    return ok(
      this.#produtos
        .filter((p) => this.#estoque.disponivel(p.id) <= limite)
        .map((p) => this.#exibirProduto(p)),
    );
  }
}