import {
  ALIQUOTA_TRIBUTOS,
  COMISSAO,
  FRETE_GRATIS_ACIMA,
  MAX_CUPONS_POR_PEDIDO,
  TAXA_FRETE_POR_REGIAO,
  TETO_DESCONTO_PERCENTUAL,
  VALOR_POR_UNIDADE_FRETE,
} from '../config/regras.js';
import { erro, ok } from '../services/resposta.js';
import { arredondar, formatarReal } from './dinheiro.js';

const soma = (valores) => arredondar(valores.reduce((acc, valor) => acc + valor, 0));


export class Pedido {
  #itens = [];
  #cupons = [];
  #status = 'aberto'; 

  constructor(id, cliente) {
    this.id = id;
    this.cliente = cliente;
  }

  get status() {
    return this.#status;
  }

  get estaAberto() {
    return this.#status === 'aberto';
  }

 
  get itens() {
    return this.#itens.map((item) => ({ ...item }));
  }

  get cupons() {
    return [...this.#cupons];
  }

  contemProduto(produtoId) {
    return this.#itens.some(({ produto }) => produto.id === produtoId);
  }

  contemCupom(codigo) {
    return this.#cupons.some((cupom) => cupom.codigo === codigo);
  }

  #fechado() {
    return erro(`O pedido ${this.id} está ${this.#status} e não aceita mudanças.`);
  }

  adicionarItem(produto, quantidade) {
    if (!this.estaAberto) return this.#fechado();
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return erro('A quantidade precisa ser um número inteiro maior que zero.');
    }
    this.#itens = this.contemProduto(produto.id)
      ? this.#itens.map((item) =>
          item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + quantidade } : item,
        )
      : [...this.#itens, { produto, quantidade }];
    return ok({ itens: this.#itens.length });
  }

  removerItem(produtoId) {
    if (!this.estaAberto) return this.#fechado();
    if (!this.contemProduto(produtoId)) return erro('Este produto não está no pedido.');
    this.#itens = this.#itens.filter(({ produto }) => produto.id !== produtoId);
    return ok({ itens: this.#itens.length });
  }

  aplicarCupom(cupom, agora = new Date()) {
    if (!this.estaAberto) return this.#fechado();
    if (this.contemCupom(cupom.codigo)) return erro(`O cupom ${cupom.codigo} já está no pedido.`);
    const candidatos = [...this.#cupons, cupom];
    const problemas = this.#validarCupons(candidatos, agora);
    if (problemas.length) return erro(problemas);
    this.#cupons = candidatos;
    return ok({ cupons: this.#cupons.map((c) => c.codigo) });
  }

  removerCupom(codigo) {
    if (!this.estaAberto) return this.#fechado();
    if (!this.contemCupom(codigo)) return erro(`O cupom ${codigo} não está no pedido.`);
    this.#cupons = this.#cupons.filter((cupom) => cupom.codigo !== codigo);
    return ok({ cupons: this.#cupons.map((c) => c.codigo) });
  }

  #validarCupons(cupons, agora) {
    const subtotal = this.#subtotal();
    const excesso =
      cupons.length > MAX_CUPONS_POR_PEDIDO
        ? [`No máximo ${MAX_CUPONS_POR_PEDIDO} cupons por pedido.`]
        : [];
    const vencidos = cupons
      .filter((cupom) => !cupom.estaValido(agora))
      .map((cupom) => `O cupom ${cupom.codigo} está vencido.`);
    const abaixoDoMinimo = cupons
      .filter((cupom) => subtotal < cupom.valorMinimo)
      .map((cupom) => `O cupom ${cupom.codigo} exige subtotal mínimo de ${formatarReal(cupom.valorMinimo)}.`);
    const naoCumulativos = cupons.length > 1
      ? cupons
          .filter((cupom) => !cupom.cumulativo)
          .map((cupom) => `O cupom ${cupom.codigo} não é cumulativo e só pode ser usado sozinho.`)
      : [];
    return [...excesso, ...vencidos, ...abaixoDoMinimo, ...naoCumulativos];
  }

  #subtotal() {
    return soma(this.#itens.map(({ produto, quantidade }) => produto.preco * quantidade));
  }

  itensDetalhados() {
    return this.#itens.map(({ produto, quantidade }) => {
      const valorBruto = arredondar(produto.preco * quantidade);
      const comissao = arredondar(valorBruto * COMISSAO[produto.categoria]);
      return {
        produtoId: produto.id,
        nome: produto.nome,
        categoria: produto.categoria,
        quantidade,
        precoUnitario: produto.preco,
        vendedorCnpj: produto.vendedor.cnpj,
        vendedorNome: produto.vendedor.nomeLoja,
        valorBruto,
        tributos: arredondar(valorBruto * ALIQUOTA_TRIBUTOS[produto.categoria]),
        comissao,
        repasse: arredondar(valorBruto - comissao),
      };
    });
  }

  calcular() {
    const subtotal = this.#subtotal();

    const teto = arredondar(subtotal * TETO_DESCONTO_PERCENTUAL);
    const aplicar = (lista, valorDe, jaDescontado) =>
      lista.reduce(
        (acc, cupom) => {
          const folga = arredondar(Math.min(teto, subtotal) - acc.total);
          const valor = arredondar(Math.max(0, Math.min(valorDe(cupom), folga)));
          return {
            total: arredondar(acc.total + valor),
            porCupom: [...acc.porCupom, { codigo: cupom.codigo, tipo: cupom.tipo, valor }],
          };
        },
        { total: jaDescontado, porCupom: [] },
      );

    const percentual = aplicar(
      this.#cupons.filter((c) => c.tipo === 'percentual'),
      (c) => (subtotal * c.valor) / 100,
      0,
    );
    const fixo = aplicar(
      this.#cupons.filter((c) => c.tipo === 'fixo'),
      (c) => c.valor,
      percentual.total,
    );
    const porCupom = [...percentual.porCupom, ...fixo.porCupom];
    const descontoPercentual = percentual.total;
    const descontoFixo = arredondar(fixo.total - percentual.total);
    const descontos = fixo.total;

    const subtotalComDescontos = arredondar(subtotal - descontos);

    const detalhes = this.itensDetalhados();
    const unidades = detalhes.reduce((acc, item) => acc + item.quantidade, 0);
    const regiao = this.cliente.regiao;
    const taxa = TAXA_FRETE_POR_REGIAO[regiao];
    const freteCalculado = unidades ? arredondar(taxa + unidades * VALOR_POR_UNIDADE_FRETE) : 0;
    const freteGratis =
      this.#cupons.some((c) => c.tipo === 'frete') || subtotalComDescontos >= FRETE_GRATIS_ACIMA;
    const frete = freteGratis ? 0 : freteCalculado;

    return {
      subtotal,
      descontos: { percentual: descontoPercentual, fixo: descontoFixo, total: descontos, porCupom },
      frete: {
        regiao,
        taxa,
        unidades,
        valorPorUnidade: VALOR_POR_UNIDADE_FRETE,
        calculado: freteCalculado,
        cobrado: frete,
        gratis: freteGratis && freteCalculado > 0,
      },
      tributos: soma(detalhes.map((item) => item.tributos)),
      comissao: soma(detalhes.map((item) => item.comissao)),
      total: arredondar(subtotalComDescontos + frete),
    };
  }

  confirmar(estoque, agora = new Date()) {
    if (!this.estaAberto) return erro(`O pedido ${this.id} já está ${this.#status}.`);
    if (!this.#itens.length) return erro('Não é possível confirmar um pedido vazio.');

    const problemasCupom = this.#validarCupons(this.#cupons, agora);
    if (problemasCupom.length) return erro(problemasCupom);

    const faltas = estoque.verificar(this.#itens);
    if (faltas.length) {
      return erro(
        faltas.map(
          ({ produto, pedido, disponivel }) =>
            `Estoque insuficiente: ${produto.nome} (pedido ${pedido}, disponível ${disponivel})`,
        ),
      );
    }

    estoque.darBaixa(this.#itens);
    this.#status = 'confirmado';
    return ok(this.resumo());
  }

  cancelar(estoque) {
    if (this.#status === 'cancelado') return erro('Este pedido já está cancelado.');
    if (this.#status === 'confirmado') estoque.devolver(this.#itens);
    this.#status = 'cancelado';
    return ok({ id: this.id, status: this.#status });
  }

  resumo() {
    return {
      id: this.id,
      status: this.#status,
      cliente: this.cliente.nome,
      itens: this.itensDetalhados(),
      cupons: this.#cupons.map((c) => c.codigo),
      valores: this.calcular(),
    };
  }
}// Pedido: orquestra as regras do pedido (itens, cupons, frete, tributos, total, comissão e status).
