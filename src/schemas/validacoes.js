import { z } from 'zod';
import { erro, ok } from '../services/resposta.js';

export const soDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

// Mensagem padrão para campo ausente ou com tipo errado
export const texto = (campo) =>
  z.string({
    required_error: `Informe ${campo}.`,
    invalid_type_error: `Valor inválido para ${campo}.`,
  });

const todosIguais = (numero) => /^(\d)\1+$/.test(numero);

// CPF: dois dígitos verificadores (pesos 10..2 e 11..2)
const digitoCpf = (base) => {
  const soma = [...base].reduce((acc, d, i) => acc + Number(d) * (base.length + 1 - i), 0);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
};

export function cpfValido(valor) {
  const cpf = soDigitos(valor);
  if (cpf.length !== 11 || todosIguais(cpf)) return false;
  return digitoCpf(cpf.slice(0, 9)) === Number(cpf[9]) && digitoCpf(cpf.slice(0, 10)) === Number(cpf[10]);
}

// CNPJ: dois dígitos verificadores com pesos fixos
const PESOS_CNPJ_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_CNPJ_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

const digitoCnpj = (base, pesos) => {
  const soma = [...base].reduce((acc, d, i) => acc + Number(d) * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
};

export function cnpjValido(valor) {
  const cnpj = soDigitos(valor);
  if (cnpj.length !== 14 || todosIguais(cnpj)) return false;
  return (
    digitoCnpj(cnpj.slice(0, 12), PESOS_CNPJ_1) === Number(cnpj[12]) &&
    digitoCnpj(cnpj.slice(0, 13), PESOS_CNPJ_2) === Number(cnpj[13])
  );
}

// Usa safeParse e devolve no formato { ok, dados } ou { ok, erros }. Nunca lança exceção.
export function validar(schema, dados) {
  const resultado = schema.safeParse(dados);
  return resultado.success
    ? ok(resultado.data)
    : erro(resultado.error.issues.map((issue) => issue.message));
}
