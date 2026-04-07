import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, APP_NAME, VALIDATION_PATTERNS, STATUS_MESSAGES } from '../constants';

interface FormErrors {
  username: string | null;
  password: string | null;
  general: string | null;
}

export function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({
    username: null,
    password: null,
    general: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const errorAnnouncerRef = useRef<HTMLDivElement>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.DASHBOARD;

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {
      username: null,
      password: null,
      general: null,
    };

    if (!username.trim()) {
      newErrors.username = STATUS_MESSAGES.VALIDATION_EMAIL_REQUIRED;
    } else if (!VALIDATION_PATTERNS.EMAIL.test(username.trim())) {
      newErrors.username = STATUS_MESSAGES.VALIDATION_EMAIL_INVALID;
    }

    if (!password) {
      newErrors.password = STATUS_MESSAGES.VALIDATION_PASSWORD_REQUIRED;
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((e) => e !== null);
    return !hasErrors;
  }, [username, password]);

  const announceError = useCallback((message: string) => {
    if (errorAnnouncerRef.current) {
      errorAnnouncerRef.current.textContent = '';
      requestAnimationFrame(() => {
        if (errorAnnouncerRef.current) {
          errorAnnouncerRef.current.textContent = message;
        }
      });
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!validateForm()) {
        const firstError = errors.username || errors.password;
        if (firstError) {
          announceError(firstError);
        }
        return;
      }

      setSubmitting(true);
      setErrors({ username: null, password: null, general: null });

      try {
        const result = await login(username.trim(), password);

        if (result.success) {
          navigate(from, { replace: true });
        } else {
          const errorMessage = result.error || STATUS_MESSAGES.LOGIN_ERROR;
          setErrors((prev) => ({ ...prev, general: errorMessage }));
          announceError(errorMessage);
        }
      } catch (_err) {
        const errorMessage = STATUS_MESSAGES.LOGIN_ERROR;
        setErrors((prev) => ({ ...prev, general: errorMessage }));
        announceError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
    [username, password, validateForm, login, navigate, from, announceError, errors.username, errors.password],
  );

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setErrors((prev) => ({ ...prev, username: null, general: null }));
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: null, general: null }));
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary-50">
        <div className="text-secondary-500" role="status" aria-label="Loading">
          <svg
            className="h-8 w-8 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 px-4 py-12 sm:px-6 lg:px-8">
      <div
        ref={errorAnnouncerRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-secondary-900">
            {APP_NAME}
          </h1>
          <h2 className="mt-2 text-lg text-secondary-600">
            Sign in to your account
          </h2>
        </div>

        <div className="rounded-xl bg-white px-6 py-8 shadow-lg sm:px-10">
          {errors.general && (
            <div
              className="mb-6 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-error-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label
                htmlFor="login-username"
                className="block text-sm font-medium text-secondary-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  ref={usernameRef}
                  id="login-username"
                  name="username"
                  type="email"
                  autoComplete="email"
                  required
                  value={username}
                  onChange={handleUsernameChange}
                  disabled={submitting}
                  aria-invalid={errors.username ? 'true' : 'false'}
                  aria-describedby={errors.username ? 'login-username-error' : undefined}
                  className={`block w-full rounded-lg border px-3 py-2 text-secondary-900 shadow-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                    errors.username
                      ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                      : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
                  } disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.username && (
                <p
                  id="login-username-error"
                  className="mt-1.5 text-sm text-error-600"
                  role="alert"
                >
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-secondary-700"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={submitting}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  className={`block w-full rounded-lg border px-3 py-2 pr-10 text-secondary-900 shadow-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                    errors.password
                      ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                      : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
                  } disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  disabled={submitting}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600 focus:outline-none focus:text-secondary-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z"
                        clipRule="evenodd"
                      />
                      <path d="M10.748 13.93l2.523 2.523A9.987 9.987 0 0110 17c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.838-4.826L6.29 8.17a4 4 0 004.458 5.76z" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path
                        fillRule="evenodd"
                        d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="login-password-error"
                  className="mt-1.5 text-sm text-error-600"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary-400"
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-secondary-600">
          Don&apos;t have an account?{' '}
          <Link
            to={ROUTES.SIGNUP}
            className="font-semibold text-primary-600 hover:text-primary-700 transition-colors focus:outline-none focus:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;