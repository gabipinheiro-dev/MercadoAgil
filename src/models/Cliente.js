import { REGIAO_POR_UF } from '../config/regras.js';

export class Cliente {
  #dados;

  constructor({ nome, email, cpf, uf }) {
    this.#dados = { nome, email, cpf, uf };
  }

  get nome() {
    return this.#dados.nome;
  }

  get cpf() {
    return this.#dados.cpf;
  }

  get uf() {
    return this.#dados.uf;
  }

  get regiao() {
    return REGIAO_POR_UF[this.#dados.uf];
  }

  paraExibicao() {
    const { cpf, ...publico } = this.#dados;
    return { ...publico, regiao: this.regiao };
  }
}
