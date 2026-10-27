import { z } from 'zod';
import { cnpjValido, soDigitos, texto } from './validacoes.js';

export const vendedorSchema = z.object({
  nomeLoja: texto('o nome da loja').trim().min(2, 'O nome da loja precisa ter pelo menos 2 letras.'),
  cnpj: texto('o CNPJ')
    .transform(soDigitos)
    .refine(cnpjValido, 'CNPJ inválido: confira os 14 dígitos.'),
  email: texto('o e-mail').trim().email('E-mail inválido.'),
});
