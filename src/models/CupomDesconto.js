export class CupomDesconto {
  constructor({ codigo, tipo, valor, validade, valorMinimo = 0, cumulativo = false }) {
    this.codigo = codigo;
    this.tipo = tipo; // 'percentual' | 'fixo' | 'frete'
    this.valor = valor;
    this.validade = validade;
    this.valorMinimo = valorMinimo;
    this.cumulativo = cumulativo;
  }

  // Cupom vencido é recusado, mesmo que tenha sido válido quando foi cadastrado
  estaValido(agora = new Date()) {
    return this.validade > agora;
  }
}
