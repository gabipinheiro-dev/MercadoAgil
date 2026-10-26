# MercadoÁgil · Serviço de Pedidos

Microsserviço de pedidos de um marketplace, em JavaScript puro com Node.js, rodando no terminal. Projeto final do Módulo 1 (Back-end com JavaScript e Node.js).

O menu no terminal faz o papel do app ou site que, no mundo real, chamaria este serviço. Quem decide as regras é a classe `Marketplace`.

## Como rodar

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm start
```

Para rodar os testes (inclui o pedido de exemplo do descritivo):

```bash
npm test
```

Os dados ficam em memória. Ao iniciar, o sistema carrega `src/data/seed.js` com 3 clientes, 3 vendedores, 8 produtos de 5 categorias e 3 cupons.

## Estrutura

```
mercadoagil/
├── src/
│   ├── models/     # uma classe por arquivo: Cliente, Pedido, Estoque...
│   ├── schemas/    # schemas do Zod e validação de CPF/CNPJ
│   ├── services/   # Marketplace.js (classe principal) e relatorios.js
│   ├── config/     # regras.js: frete, alíquotas, comissões, teto, UFs
│   ├── data/       # seed.js (dados de exemplo)
│   └── cli/        # menu.js (só lê do teclado e mostra na tela)
├── tests/          # pedido.test.js (node:test)
├── index.js
├── package.json
├── .gitignore
└── README.md
```

## Regras de negócio

**Estoque tudo ou nada.** Ao confirmar, o pedido confere todos os itens antes de dar baixa. Se faltar qualquer um, nada sai do estoque e a mensagem lista todos os itens em falta. Pedido confirmado e depois cancelado devolve os itens.

**Cupons.** São do marketplace e valem para o pedido inteiro. Tipos: `percentual`, `fixo` e `frete`. Um cupom vencido é recusado, inclusive na confirmação. O subtotal precisa atingir o valor mínimo do cupom. Um pedido aceita no máximo 2 cupons, sem repetição. Cupom não cumulativo só pode ser usado sozinho.

**Ordem de aplicação dos descontos:** primeiro os percentuais (sobre o subtotal), depois os fixos (limitados ao que sobrar), por último o de frete (zera o frete).

**Teto de desconto.** A soma de descontos percentuais e fixos nunca passa de 30% do subtotal, e o total nunca fica negativo. O cupom de frete não entra nesse teto, porque ele atua sobre o frete e não sobre o subtotal.

**Frete.** Taxa da região do cliente mais R$ 1,50 por unidade de produto. É um só por pedido. É grátis quando o valor já com descontos chega a R$ 300,00 ou mais, ou quando o pedido usa cupom de frete. A região é derivada da UF do cliente.

**Tributos.** São aproximados por categoria, calculados sobre o valor dos itens antes dos descontos. Aparecem no resumo, mas não somam no total.

**Comissão e repasse.** A comissão incide sobre o valor dos itens antes dos descontos. Cupom e frete não diminuem o repasse. O repasse ao vendedor é a soma dos itens dele menos a comissão desses itens, e só pedidos confirmados geram repasse.

## Pedido de exemplo

Cliente da Bahia (região Nordeste, cadastrada como Ana Souza no seed), 1 Mouse e 1 Livro de JavaScript, com os cupons BEMVINDO10 e PDA15:

| Linha | Valor |
|---|---|
| Subtotal | R$ 200,00 |
| BEMVINDO10 (10%) | - R$ 20,00 |
| PDA15 (fixo) | - R$ 15,00 |
| Frete (R$ 25,00 + 2 × R$ 1,50) | + R$ 28,00 |
| **Total** | **R$ 193,00** |
| Tributos (informativo) | R$ 14,40 |
| Repasse TechBahia (120,00 − 8%) | R$ 110,40 |
| Repasse Livraria Sol (80,00 − 15%) | R$ 68,00 |

Esses valores são verificados em `tests/pedido.test.js`.

## Decisões de design

**Resposta padronizada.** Os métodos públicos do `Marketplace` devolvem `{ ok: true, dados }` ou `{ ok: false, erros: [...] }`. Assim o serviço nunca quebra por causa de um dado ruim, e o menu só precisa mostrar o que recebeu.

**Encapsulamento.** Itens, cupons e status do pedido são campos privados (`#`). Só mudam por métodos como `adicionarItem`, `aplicarCupom`, `confirmar` e `cancelar`. Os getters devolvem cópias.

**Validação com Zod.** Cada cadastro passa por um schema com `safeParse`. Há três `.refine()` obrigatórios: CPF (dígitos verificadores), CNPJ (dígitos verificadores) e validade do cupom no futuro. As mensagens saem em português, campo a campo.

**LGPD.** O CPF fica guardado dentro de `Cliente`. Na exibição, `paraExibicao()` usa rest (`const { cpf, ...publico } = ...`) para tirá-lo antes de devolver os dados. O CPF não aparece em nenhuma listagem.

**Sem `for` nem `while` para processar dados.** As listas são processadas com `map`, `filter`, `find`, `findIndex`, `some` e `reduce`. O `while` aparece só no laço que mantém o menu aberto.

**Valores monetários exatos.** Todo valor passa por `arredondar` (duas casas decimais), o que evita erros como `14.399999`.

**Alíquotas e comissões em um só lugar.** Ficam em `src/config/regras.js`.

**Desvio do exemplo do descritivo.** O schema de cupom de exemplo usa `.toUpperCase()` direto, mas esse método não existe no Zod. O código faz a conversão com `.transform()`, que tem o mesmo efeito.

## Extras implementados

- Reposição de estoque e alerta de estoque baixo.
- Remoção de cupom do pedido.
- Bloqueio de exclusões que deixariam pedido aberto inconsistente (cliente, produto, cupom ou vendedor com produtos).

## Colaboradores

| Membro | Parte |
|---|---|
| Gabrielle | README e Regras |
| Daniel | Schemas Zod |
| Allen | Seed e validação |
| Pedro | Modelos básicos e Estoque |
| Paulo | Pedido base e Calculos |
| João | Marketplace |
| Sky | Relatórios, Menu e Index |
