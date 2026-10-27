import { Marketplace } from './src/services/Marketplace.js';
import { carregarSeed } from './src/data/seed.js';
import { iniciarMenu } from './src/cli/menu.js';

const marketplace = new Marketplace();

const errosDeCarga = carregarSeed(marketplace);
if (errosDeCarga.length) {
  console.warn('Avisos ao carregar os dados de exemplo:', errosDeCarga);
}

await iniciarMenu(marketplace);

