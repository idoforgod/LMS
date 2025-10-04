import { z } from 'zod';

export const SignupRequestSchema = z.object({
  email: z.string().email({ message: '유효한 이메일 주소를 입력하세요.' }),
  password: z
    .string()
    .min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' }),
  role: z.enum(['learner', 'instructor'], {
    errorMap: () => ({ message: '역할을 선택하세요.' }),
  }),
  name: z.string().min(1, { message: '이름을 입력하세요.' }).trim(),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, {
    message: '올바른 휴대폰번호 형식을 입력하세요. (예: 010-1234-5678)',
  }),
  termsAgreed: z.literal(true, {
    errorMap: () => ({ message: '약관에 동의해야 가입할 수 있습니다.' }),
  }),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const SignupResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(['learner', 'instructor']),
    name: z.string(),
    phone: z.string(),
  }),
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;

export const ProfileRowSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['learner', 'instructor', 'operator']),
  name: z.string(),
  phone: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProfileRow = z.infer<typeof ProfileRowSchema>;
