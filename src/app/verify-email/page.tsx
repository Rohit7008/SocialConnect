"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');

    if (!token || !user) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token, user);
  }, [searchParams]);

  const verifyEmail = async (token: string, userId: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } else {
        setStatus('error');
        setMessage(data.detail || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-[var(--surface)] border border-muted rounded-lg p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-start)] mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                Verifying your email...
              </h1>
              <p className="text-[var(--muted-foreground)]">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                Email Verified!
              </h1>
              <p className="text-[var(--muted-foreground)] mb-6">
                {message}
              </p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary-start)] hover:bg-[var(--color-primary-end)] transition-colors"
              >
                Continue to Login
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                Verification Failed
              </h1>
              <p className="text-[var(--muted-foreground)] mb-6">
                {message}
              </p>
              <div className="space-y-2">
                <a
                  href="/register"
                  className="block w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary-start)] hover:bg-[var(--color-primary-end)] transition-colors"
                >
                  Try Registering Again
                </a>
                <a
                  href="/"
                  className="block w-full px-4 py-2 border border-[var(--color-primary-start)] text-sm font-medium rounded-md text-[var(--color-primary-start)] bg-transparent hover:bg-[var(--color-primary-start)] hover:text-white transition-colors"
                >
                  Back to Login
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
