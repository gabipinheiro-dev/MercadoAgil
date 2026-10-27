import { z } from 'zod';
import { UFS } from '../config/regras.js';
import { cpfValido, soDigitos, texto } from './validacoes.js';

export const clienteSchema = z.object({
  nome: texto('o nome').trim().min(3, 'O nome precisa ter pelo menos 3 letras.'),
  email: texto('o e-mail').trim().email('E-mail inválido.'),
  cpf: texto('o CPF')
    .transform(soDigitos)
    .refine(cpfValido, 'CPF inválido: confira os 11 dígitos.'),
  uf: texto('a UF')
    .transform((uf) => uf.trim().toUpperCase())
    .refine((uf) => UFS.includes(uf), 'UF inválida. Use a sigla de um estado, ex.: BA.'),
});// Schema Zod do Cliente: valida os dados, com .refine() do formato do CPF.
