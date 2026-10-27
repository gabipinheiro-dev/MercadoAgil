// Relatórios financeiros: faturamento, ticket médio, por categoria, repasse e top 3 (só pedidos confirmados).
export function gerarRelatorio(pedidos) {
  const resumos = pedidos
    .filter((pedido) => pedido.status === 'confirmado')
    .map((pedido) => pedido.resumo());

  const faturamento = arredondar(resumos.reduce((acc, r) => acc + r.valores.total, 0));
  const quantidade = resumos.length;
  const ticketMedio = quantidade ? arredondar(faturamento / quantidade) : 0;

  const itens = resumos.flatMap((r) => r.itens);

  const porCategoria = itens.reduce(
    (acc, item) => ({
      ...acc,
      [item.categoria]: arredondar((acc[item.categoria] ?? 0) + item.valorBruto),
    }),
    {},
  );

  const repassePorVendedor = Object.values(
    itens.reduce((acc, item) => {
      const atual = acc[item.vendedorCnpj] ?? {
        cnpj: item.vendedorCnpj,
        nome: item.vendedorNome,
        bruto: 0,
        comissao: 0,
        repasse: 0,
      };
      return {
        ...acc,
        [item.vendedorCnpj]: {
          ...atual,
          bruto: arredondar(atual.bruto + item.valorBruto),
          comissao: arredondar(atual.comissao + item.comissao),
          repasse: arredondar(atual.repasse + item.repasse),
        },
      };
    }, {}),
  );

  const top3 = Object.values(
    itens.reduce((acc, item) => {
      const atual = acc[item.produtoId] ?? { nome: item.nome, quantidade: 0 };
      return { ...acc, [item.produtoId]: { ...atual, quantidade: atual.quantidade + item.quantidade } };
    }, {}),
  )
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 3);

  const totais = resumos.reduce(
    (acc, r) => ({
      descontos: arredondar(acc.descontos + r.valores.descontos.total),
      tributos: arredondar(acc.tributos + r.valores.tributos),
      comissao: arredondar(acc.comissao + r.valores.comissao),
    }),
    { descontos: 0, tributos: 0, comissao: 0 },
  );

  return { faturamento, quantidade, ticketMedio, porCategoria, repassePorVendedor, top3, ...totais };
}
