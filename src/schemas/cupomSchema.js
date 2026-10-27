import { z } from 'zod';
import { texto } from './validacoes.js';

export const cupomSchema = z
  .object({
    codigo: texto('o código')
      .trim()
      .min(3, 'O código precisa ter pelo menos 3 letras.')
      .transform((codigo) => codigo.toUpperCase()),
    tipo: z.enum(['percentual', 'fixo', 'frete'], {
      errorMap: () => ({ message: 'Tipo inválido. Use percentual, fixo ou frete.' }),
    }),
    valor: z.coerce
      .number({ invalid_type_error: 'O valor do cupom precisa ser um número.' })
      .nonnegative('O valor do cupom não pode ser negativo.'),
    validade: z.coerce
      .date({ invalid_type_error: 'Validade inválida. Use o formato AAAA-MM-DD.' })
      .refine((data) => data > new Date(), {
        message: 'A validade do cupom precisa ser uma data futura.',
      }),
    valorMinimo: z.coerce
      .number({ invalid_type_error: 'O valor mínimo precisa ser um número.' })
      .nonnegative('O valor mínimo não pode ser negativo.')
      .default(0),
    cumulativo: z.boolean().default(false),
  })
  .refine((cupom) => cupom.tipo !== 'percentual' || cupom.valor <= 100, {
    message: 'Cupom percentual não pode passar de 100%.',
    path: ['valor'],
  });// Schema Zod do Cupom: valida tipo, valor e validade futura (.refine()).
