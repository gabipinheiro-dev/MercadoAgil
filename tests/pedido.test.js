import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Marketplace } from '../src/services/Marketplace.js';
import { carregarSeed } from '../src/data/seed.js';

const montar = () => {
  const mp = new Marketplace();
  assert.deepEqual(carregarSeed(mp), []);
  return mp;
};

const idDe = (mp, nome) => mp.buscarProduto(nome).dados[0].id;

test('pedido de exemplo do descritivo bate com os valores esperados', () => {
  const mp = montar();
  const { dados: pedido } = mp.criarPedido('529.982.247-25'); 
  mp.adicionarItem(pedido.id, idDe(mp, 'Mouse'), 1);
  mp.adicionarItem(pedido.id, idDe(mp, 'Livro de JavaScript'), 1);
  assert.equal(mp.aplicarCupom(pedido.id, 'BEMVINDO10').ok, true);
  const aplicado = mp.aplicarCupom(pedido.id, 'PDA15');
  assert.equal(aplicado.ok, true);

  const v = aplicado.dados.valores;
  assert.equal(v.subtotal, 200);
  assert.equal(v.descontos.total, 35);
    assert.deepEqual(
    v.descontos.porCupom.map(({ codigo, valor }) => ({ codigo, valor })),
    [
      { codigo: 'BEMVINDO10', valor: 20 },
      { codigo: 'PDA15', valor: 15 },
    ],
  );
  assert.equal(v.frete.cobrado, 28);
  assert.equal(v.total, 193);
  assert.equal(v.tributos, 14.4);
  assert.equal(v.comissao, 21.6);

  assert.equal(mp.confirmarPedido(pedido.id).ok, true);
  assert.equal(mp.buscarProduto('Mouse').dados[0].estoque, 4);

  const relatorio = mp.relatorioFinanceiro().dados;
  assert.equal(relatorio.faturamento, 193);
  assert.equal(relatorio.quantidade, 1);
  const techBahia = relatorio.repassePorVendedor.find((v) => v.nome === 'TechBahia');
  const livrariaSol = relatorio.repassePorVendedor.find((v) => v.nome === 'Livraria Sol');
  assert.equal(techBahia.repasse, 110.4);
  assert.equal(livrariaSol.repasse, 68);
});

test('estoque é tudo ou nada: nenhum item sai se algum faltar', () => {
  const mp = montar();
  const { dados: pedido } = mp.criarPedido('111.444.777-35');
  mp.adicionarItem(pedido.id, idDe(mp, 'Livro de JavaScript'), 1);
  mp.adicionarItem(pedido.id, idDe(mp, 'Mouse'), 10);

  const resultado = mp.confirmarPedido(pedido.id);
  assert.equal(resultado.ok, false);
  assert.deepEqual(resultado.erros, ['Estoque insuficiente: Mouse (pedido 10, disponível 5)']);
  assert.equal(mp.buscarProduto('Livro de JavaScript').dados[0].estoque, 10);
  assert.equal(mp.buscarProduto('Mouse').dados[0].estoque, 5);
});
