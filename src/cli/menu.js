import readline from 'node:readline/promises';
import { stdin as entrada, stdout as saida } from 'node:process';
import { CATEGORIAS } from '../config/regras.js';
import { formatarReal } from '../models/dinheiro.js';

const f = formatarReal;

const CAMPOS_EM_REAIS = ['preco', 'valorMinimo', 'total', 'subtotal', 'descontos', 'tributos',
  'comissao', 'faturamento', 'ticketMedio', 'bruto', 'repasse'];

const formatarLinha = (linha) =>
  Object.fromEntries(
    Object.entries(linha).map(([chave, valor]) => {
      if (CAMPOS_EM_REAIS.includes(chave) && typeof valor === 'number') return [chave, f(valor)];
      if (valor instanceof Date) return [chave, valor.toLocaleDateString('pt-BR')];
      return [chave, valor];
    }),
  );

function mostrar(resposta) {
  if (!resposta.ok) {
    resposta.erros.forEach((mensagem) => console.log(`  ✖ ${mensagem}`));
    return;
  }
  const { dados } = resposta;
  if (Array.isArray(dados)) {
    console.table(dados.map(formatarLinha));
  } else if ('valores' in dados) {
    imprimirResumo(dados);
  } else {
    console.log('  ✔ Feito!', formatarLinha(dados));
  }
}

function imprimirResumo(r) {
  const v = r.valores;
  console.log(`\nPedido #${r.id} · cliente: ${r.cliente} · status: ${r.status}`);
  if (r.itens.length) {
    console.table(
      r.itens.map((i) => ({
        item: i.nome,
        qtd: i.quantidade,
        'preço un.': f(i.precoUnitario),
        vendedor: i.vendedorNome,
        comissão: f(i.comissao),
        repasse: f(i.repasse),
      })),
    );
  } else {
    console.log('  (pedido sem itens)');
  }
  console.log(`  Subtotal:                    ${f(v.subtotal)}`);
  if (v.descontos.porCupom.length) {
    v.descontos.porCupom.forEach((d) =>
      console.log(`  Cupom ${d.codigo} (${d.tipo}):`.padEnd(40) + `- ${f(d.valor)}`),
    );
  } else {
    console.log('  Descontos:                   nenhum');
  }
  console.log(`  Total de descontos:          - ${f(v.descontos.total)}`);
  const extra = v.frete.gratis && v.frete.calculado > 0 ? ` (sem frete: era ${f(v.frete.calculado)})` : '';
  console.log(`  Frete (${v.frete.regiao}):             ${v.frete.gratis ? 'grátis' : f(v.frete.cobrado)}${extra}`);
  console.log(`  Tributos (só informativo):   ${f(v.tributos)}`);
  console.log(`  Comissão do marketplace:     ${f(v.comissao)}`);
  console.log(`  TOTAL:                       ${f(v.total)}`);
}

function imprimirRelatorio(rel) {
  console.log(`\nFaturamento: ${f(rel.faturamento)} · Pedidos confirmados: ${rel.quantidade} · Ticket médio: ${f(rel.ticketMedio)}`);
  console.log(`Descontos concedidos: ${f(rel.descontos)} · Tributos: ${f(rel.tributos)} · Comissão: ${f(rel.comissao)}`);
  console.log('\nFaturamento por categoria (antes dos descontos):');
  console.table(Object.entries(rel.porCategoria).map(([categoria, valor]) => ({ categoria, valor: f(valor) })));
  console.log('Repasse por vendedor:');
  console.table(
    rel.repassePorVendedor.map((v) => ({
      vendedor: v.nome,
      bruto: f(v.bruto),
      comissão: f(v.comissao),
      'a repassar': f(v.repasse),
    })),
  );
  console.log('Top 3 produtos mais vendidos:');
  console.table(rel.top3.map((p) => ({ produto: p.nome, quantidade: p.quantidade })));
}

export async function iniciarMenu(marketplace) {
  const rl = readline.createInterface({ input: entrada, output: saida });
  rl.on('close', () => process.exit(0));

  const perguntar = async (texto) => (await rl.question(texto)).trim();
  const campo = (texto) => perguntar(`  ${texto}: `);
  const numero = async (texto) => (await campo(texto)).replace(',', '.');

  async function submenu(titulo, opcoes, rotuloVoltar = 'Voltar') {
    while (true) {
      console.log(`\n== ${titulo} ==`);
      opcoes.forEach((opcao, i) => console.log(`  ${i + 1}. ${opcao.rotulo}`));
      console.log(`  0. ${rotuloVoltar}`);
      const escolha = await perguntar('> ');
      if (escolha === '0') return;
      const opcao = opcoes[Number(escolha) - 1];
      if (!opcao) {
        console.log('  Opção inválida. Digite um número da lista.');
        continue;
      }
      try {
        await opcao.acao();
      } catch (erroInesperado) {
        console.log(`  ✖ Erro inesperado: ${erroInesperado.message}`);
      }
    }
  }

  const menuClientes = () =>
    submenu('Clientes', [
      {
        rotulo: 'Cadastrar',
        acao: async () =>
          mostrar(
            marketplace.cadastrarCliente({
              nome: await campo('Nome'),
              email: await campo('E-mail'),
              cpf: await campo('CPF'),
              uf: await campo('UF (ex.: BA)'),
            }),
          ),
      },
      { rotulo: 'Listar', acao: () => mostrar(marketplace.listarClientes()) },
      {
        rotulo: 'Buscar (CPF ou nome)',
        acao: async () => mostrar(marketplace.buscarCliente(await campo('CPF ou nome'))),
      },
      {
        rotulo: 'Excluir (CPF)',
        acao: async () => mostrar(marketplace.excluirCliente(await campo('CPF'))),
      },
    ]);

  const menuVendedores = () =>
    submenu('Vendedores', [
      {
        rotulo: 'Cadastrar',
        acao: async () =>
          mostrar(
            marketplace.cadastrarVendedor({
              nomeLoja: await campo('Nome da loja'),
              cnpj: await campo('CNPJ'),
              email: await campo('E-mail'),
            }),
          ),
      },
      { rotulo: 'Listar', acao: () => mostrar(marketplace.listarVendedores()) },
      {
        rotulo: 'Buscar (CNPJ ou nome)',
        acao: async () => mostrar(marketplace.buscarVendedor(await campo('CNPJ ou nome'))),
      },
      {
        rotulo: 'Excluir (CNPJ)',
        acao: async () => mostrar(marketplace.excluirVendedor(await campo('CNPJ'))),
      },
    ]);

  const menuProdutos = () =>
    submenu('Produtos', [
      {
        rotulo: 'Cadastrar',
        acao: async () =>
          mostrar(
            marketplace.cadastrarProduto({
              nome: await campo('Nome'),
              preco: await numero('Preço (ex.: 120,50)'),
              categoria: await campo(`Categoria (${CATEGORIAS.join(', ')})`),
              vendedorCnpj: await campo('CNPJ do vendedor'),
              estoque: await campo('Estoque inicial'),
            }),
          ),
      },
      { rotulo: 'Listar', acao: () => mostrar(marketplace.listarProdutos()) },
      {
        rotulo: 'Buscar (id ou nome)',
        acao: async () => mostrar(marketplace.buscarProduto(await campo('Id ou nome'))),
      },
      {
        rotulo: 'Excluir (id)',
        acao: async () => mostrar(marketplace.excluirProduto(await campo('Id'))),
      },
      {
        rotulo: 'Repor estoque',
        acao: async () =>
          mostrar(
            marketplace.reporEstoque(
              await campo('Id do produto'),
              Number(await campo('Quantidade a acrescentar')),
            ),
          ),
      },
    ]);

  const menuCupons = () =>
    submenu('Cupons', [
      {
        rotulo: 'Cadastrar',
        acao: async () =>
          mostrar(
            marketplace.cadastrarCupom({
              codigo: await campo('Código'),
              tipo: await campo('Tipo (percentual, fixo, frete)'),
              valor: await numero('Valor (% ou R$; zero para frete)'),
              validade: await campo('Validade (AAAA-MM-DD)'),
              valorMinimo: await numero('Subtotal mínimo em R$ (0 se não houver)'),
              cumulativo: (await campo('Cumulativo? (s/n)')).toLowerCase() === 's',
            }),
          ),
      },
      { rotulo: 'Listar', acao: () => mostrar(marketplace.listarCupons()) },
      {
        rotulo: 'Excluir (código)',
        acao: async () => mostrar(marketplace.excluirCupom(await campo('Código'))),
      },
    ]);

  const menuPedidos = () =>
    submenu('Pedidos', [
      {
        rotulo: 'Criar pedido',
        acao: async () => mostrar(marketplace.criarPedido(await campo('CPF do cliente'))),
      },
      { rotulo: 'Listar pedidos', acao: () => mostrar(marketplace.listarPedidos()) },
      {
        rotulo: 'Adicionar item',
        acao: async () =>
          mostrar(
            marketplace.adicionarItem(
              await campo('Nº do pedido'),
              await campo('Id do produto'),
              await campo('Quantidade'),
            ),
          ),
      },
      {
        rotulo: 'Remover item',
        acao: async () =>
          mostrar(marketplace.removerItem(await campo('Nº do pedido'), await campo('Id do produto'))),
      },
      {
        rotulo: 'Aplicar cupom',
        acao: async () =>
          mostrar(marketplace.aplicarCupom(await campo('Nº do pedido'), await campo('Código do cupom'))),
      },
      {
        rotulo: 'Remover cupom',
        acao: async () =>
          mostrar(marketplace.removerCupom(await campo('Nº do pedido'), await campo('Código do cupom'))),
      },
      {
        rotulo: 'Ver resumo',
        acao: async () => mostrar(marketplace.resumoPedido(await campo('Nº do pedido'))),
      },
      {
        rotulo: 'Confirmar pedido',
        acao: async () => mostrar(marketplace.confirmarPedido(await campo('Nº do pedido'))),
      },
      {
        rotulo: 'Cancelar pedido',
        acao: async () => mostrar(marketplace.cancelarPedido(await campo('Nº do pedido'))),
      },
    ]);

  const menuRelatorios = () =>
    submenu('Relatórios', [
      {
        rotulo: 'Financeiro (só pedidos confirmados)',
        acao: () => {
          const relatorio = marketplace.relatorioFinanceiro();
          if (relatorio.ok) imprimirRelatorio(relatorio.dados);
          else mostrar(relatorio);
        },
      },
      {
        rotulo: 'Produtos com estoque baixo (até 2 unidades)',
        acao: () => mostrar(marketplace.estoqueBaixo()),
      },
    ]);

  console.log('\n🛒 MercadoÁgil · serviço de pedidos');
  try {
    await submenu(
      'Menu principal',
      [
        { rotulo: 'Clientes', acao: menuClientes },
        { rotulo: 'Vendedores', acao: menuVendedores },
        { rotulo: 'Produtos', acao: menuProdutos },
        { rotulo: 'Cupons', acao: menuCupons },
        { rotulo: 'Pedidos', acao: menuPedidos },
        { rotulo: 'Relatórios', acao: menuRelatorios },
      ],
      'Sair',
    );
  } finally {
    rl.close();
  }
  console.log('Até logo!');
}
