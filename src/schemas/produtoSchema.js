import { z } from 'zod';
import { CATEGORIAS } from '../config/regras.js';
import { arredondar } from '../models/dinheiro.js';
import { cnpjValido, soDigitos, texto } from './validacoes.js';

export const produtoSchema = z.object({
  nome: texto('o nome do produto').trim().min(2, 'O nome do produto precisa ter pelo menos 2 letras.'),
  preco: z.coerce
    .number({ invalid_type_error: 'O preço precisa ser um número, ex.: 120.50.' })
    .positive('O preço precisa ser maior que zero.')
    .transform(arredondar),
  categoria: z.enum(CATEGORIAS, {
    errorMap: () => ({ message: `Categoria inválida. Use: ${CATEGORIAS.join(', ')}.` }),
  }),
  vendedorCnpj: texto('o CNPJ do vendedor')
    .transform(soDigitos)
    .refine(cnpjValido, 'CNPJ do vendedor inválido.'),
  estoque: z.coerce
    .number({ invalid_type_error: 'O estoque precisa ser um número inteiro.' })
    .int('O estoque precisa ser um número inteiro.')
    .nonnegative('O estoque não pode ser negativo.'),
});// Schema Zod do Produto: valida nome, preço positivo e categoria permitida.
