import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('O e-mail está com formato errado!').min(1, 'Por favor, insira o seu e-mail.'),
  senha: z.string().min(1, 'Por favor, insira a sua senha.'),
});

export const RegisterSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório!'),
  email: z.string().email('O e-mail está com formato errado!').min(1, 'O e-mail é obrigatório!'),
  senha: z.string().min(1, 'A senha é obrigatória!').min(8, 'A senha deve ter no mínimo 8 dígitos!'),
  confirmarSenha: z.string().min(1, 'Confirme sua senha!'),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem!',
  path: ['confirmarSenha'],
});

export const ProfileEditSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório!'),
  email: z.string().email('O e-mail está com formato errado!').min(1, 'O e-mail é obrigatório!'),
  senha: z.string().min(1, 'A senha é obrigatória!').min(8, 'A senha deve ter no mínimo 8 dígitos!'),
  confirmarSenha: z.string().min(1, 'Confirme sua senha!'),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem!',
  path: ['confirmarSenha'],
});

// Helpers de validação customizados para o Pet
const regexData = /^\d{2}\/\d{2}\/\d{4}$/;

const parseDataValida = (dataStr: string): Date | null => {
  if (!regexData.test(dataStr)) return null;
  const [dia, mes, ano] = dataStr.split('/').map(Number);
  const date = new Date(ano, mes - 1, dia);
  
  // Impede dias inválidos como 31/02
  if (date.getFullYear() !== ano || date.getMonth() !== mes - 1 || date.getDate() !== dia) {
    return null;
  }
  return date;
};

const validarDataNaoFutura = (val: string | undefined) => {
  if (!val || !val.trim()) return true;
  const data = parseDataValida(val.trim());
  if (!data) return false;
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  return data <= hoje;
};

const validarCastrado = (val: string | undefined) => {
  if (!val || !val.trim()) return true;
  const low = val.trim().toLowerCase();
  return ['sim', 's', 'yes', 'y', 'não', 'nao', 'n', 'no'].includes(low);
};

const validarSexo = (val: string | undefined) => {
  if (!val || !val.trim()) return true;
  const low = val.trim().toLowerCase();
  return ['macho', 'm', 'male', 'fêmea', 'femea', 'f', 'female'].includes(low);
};

const validarTelefoneVet = (val: string | undefined) => {
  if (!val || !val.trim()) return true;
  const apenasNumeros = val.replace(/\D/g, '');
  if (apenasNumeros.length === 0) return true; // Aceita somente texto sem telefone

  let numeroSemDDI = apenasNumeros;
  if (apenasNumeros.startsWith('55') && apenasNumeros.length > 11) {
    numeroSemDDI = apenasNumeros.substring(2);
  }

  const totalDigitos = numeroSemDDI.length;
  return totalDigitos === 10 || totalDigitos === 11;
};

// Schema de validação do Pet com Zod
export const PetSchema = z.object({
  avatarId: z.string(),
  nome: z.string().trim().min(1, 'O nome do pet é obrigatório!'),
  raca: z.string().trim().min(1, 'A raça do pet é obrigatória!'),
  idade: z.string().trim().min(1, 'A idade do pet é obrigatória!'),
  peso: z.string().trim().min(1, 'O peso do pet é obrigatório!'),
  sexo: z.string().trim().min(1, 'O sexo do pet é obrigatório!').refine(validarSexo, { message: 'O campo Sexo deve ser "Macho" ou "Fêmea".' }),
  castrado: z.string().trim().min(1, 'O status de castração é obrigatório!').refine(validarCastrado, { message: 'O campo Castrado deve ser "Sim" ou "Não".' }),
  ultimaVacina: z.string().trim().min(1, 'A data da última vacina é obrigatória!').refine(validarDataNaoFutura, { message: 'A data da última vacina deve estar no formato DD/MM/AAAA e não pode ser no futuro.' }),
  ultimaConsulta: z.string().trim().min(1, 'A data da última consulta é obrigatória!').refine(validarDataNaoFutura, { message: 'A data da última consulta deve estar no formato DD/MM/AAAA e não pode ser no futuro.' }),
  veterinario: z.string().trim().min(1, 'O telefone do veterinário é obrigatório!').refine(validarTelefoneVet, { message: 'O telefone no campo Veterinário deve conter o DDD e ter 10 dígitos (fixo) ou 11 dígitos (celular).' }),
  alergias: z.string().trim().min(1, 'O campo Alergias é obrigatório! (Se não houver, digite "Nenhuma")'),
  medicamentos: z.string().trim().min(1, 'O campo Medicamentos Contínuos é obrigatório! (Se não houver, digite "Nenhum")'),
});