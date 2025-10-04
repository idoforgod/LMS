'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignup } from '@/features/onboarding/hooks/useSignup';
import {
  USER_ROLE,
  REDIRECT_PATH_BY_ROLE,
  type UserRole,
} from '@/features/onboarding/constants';
import type { SignupRequest } from '@/features/onboarding/lib/dto';

const defaultFormState: Omit<SignupRequest, 'termsAgreed'> & {
  termsAgreed: boolean;
} = {
  email: '',
  password: '',
  role: USER_ROLE.LEARNER,
  name: '',
  phone: '',
  termsAgreed: false,
};

export const SignupForm = () => {
  const router = useRouter();
  const { mutate: signup, isPending, error } = useSignup();
  const [formState, setFormState] = useState(defaultFormState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formState.termsAgreed) {
      alert('약관에 동의해야 가입할 수 있습니다.');
      return;
    }

    signup(formState as SignupRequest, {
      onSuccess: (data) => {
        const redirectPath =
          REDIRECT_PATH_BY_ROLE[data.user.role as UserRole];
        router.push(redirectPath);
      },
    });
  };

  const isSubmitDisabled =
    !formState.email.trim() ||
    !formState.password.trim() ||
    !formState.name.trim() ||
    !formState.phone.trim() ||
    !formState.termsAgreed;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        이메일
        <input
          type="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          required
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-700">
        비밀번호
        <input
          type="password"
          name="password"
          value={formState.password}
          onChange={handleChange}
          required
          minLength={6}
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-700">
        역할 선택
        <select
          name="role"
          value={formState.role}
          onChange={handleChange}
          required
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        >
          <option value={USER_ROLE.LEARNER}>학습자 (Learner)</option>
          <option value={USER_ROLE.INSTRUCTOR}>강사 (Instructor)</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-700">
        이름
        <input
          type="text"
          name="name"
          value={formState.name}
          onChange={handleChange}
          required
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-700">
        휴대폰번호
        <input
          type="tel"
          name="phone"
          value={formState.phone}
          onChange={handleChange}
          placeholder="010-1234-5678"
          required
          pattern="010-\d{4}-\d{4}"
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="termsAgreed"
          checked={formState.termsAgreed}
          onChange={handleChange}
          required
          className="h-4 w-4"
        />
        <span>약관에 동의합니다</span>
      </label>

      {error ? <p className="text-sm text-red-500">{error.message}</p> : null}

      <button
        type="submit"
        disabled={isPending || isSubmitDisabled}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isPending ? '처리 중...' : '회원가입'}
      </button>
    </form>
  );
};
