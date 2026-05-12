import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email('O e-mail está com formato errado!').min(1, 'Por favor, insira o seu e-mail.'),
  senha: z.string().min(1, 'Por favor, insira a sua senha.'),
});

export const RegisterSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório!'),
  email: z.email('O e-mail está com formato errado!').min(1, 'O e-mail é obrigatório!'),
  senha: z.string().min(1, 'A senha é obrigatória!').min(8, 'A senha deve ter no mínimo 8 dígitos!'),
  confirmarSenha: z.string().min(1, 'Confirme sua senha!'),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem!',
  path: ['confirmarSenha'],
});

export const ProfileEditSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório!'),
  email: z.email('O e-mail está com formato errado!').min(1, 'O e-mail é obrigatório!'),
  senha: z.string().min(1, 'A senha é obrigatória!').min(8, 'A senha deve ter no mínimo 8 dígitos!'),
  confirmarSenha: z.string().min(1, 'Confirme sua senha!'),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem!',
  path: ['confirmarSenha'],
});
