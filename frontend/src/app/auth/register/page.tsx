'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus, Zap } from 'lucide-react';
import axios from 'axios';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const passwordValue = watch('password', '');
  const checks = [
    { label: '8+ characters', ok: passwordValue.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(passwordValue) },
    { label: 'Lowercase', ok: /[a-z]/.test(passwordValue) },
    { label: 'Number', ok: /[0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created successfully!');
      router.replace('/login');
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message || 'Registration failed' : 'Registration failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) return null;

  const inputCls = 'w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm';

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-8 justify-center">
        <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>TaskFlow</span>
      </div>

      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Create account</h1>
        <p className="text-slate-400 text-sm mb-7">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
            <input {...register('name')} placeholder="Jane Smith" className={inputCls} />
            {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input {...register('email')} type="email" placeholder="you@example.com" className={inputCls} />
            {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={`${inputCls} pr-11`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordValue.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {checks.map((c) => (
                  <span key={c.label} className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${c.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                    {c.ok ? '✓' : '○'} {c.label}
                  </span>
                ))}
              </div>
            )}
            {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
            <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={inputCls} />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/25 mt-2">
            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}