'use client';

import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
          },
        }}
        richColors
      />
    </AuthProvider>
  );
}