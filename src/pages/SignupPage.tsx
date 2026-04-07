import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, APP_NAME, VALIDATION_PATTERNS, STATUS_MESSAGES } from '../constants';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = STATUS_MESSAGES.VALIDATION_NAME_REQUIRED;
    } else if (!VALIDATION_PATTERNS.NAME.test(name.trim())) {
      newErrors.name = 'Name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes.';
    }

    if (!email.trim()) {
      newErrors.email = STATUS_MESSAGES.VALIDATION_EMAIL_REQUIRED;
    } else if (!VALIDATION_PATTERNS.EMAIL.test(email.trim())) {
      newErrors.email = STATUS_MESSAGES.VALIDATION_EMAIL_INVALID;
    }

    if (!password) {
      newErrors.password = STATUS_MESSAGES.VALIDATION_PASSWORD_REQUIRED;
    } else if (!VALIDATION_PATTERNS.PASSWORD.test(password)) {
      newErrors.password = STATUS_MESSAGES.VALIDATION_PASSWORD_WEAK;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, password, confirmPassword]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSuccessMessage('');
      setErrors({});

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await signup(email.trim(), password);

        if (result.success) {
          setSuccessMessage(STATUS_MESSAGES.SIGNUP_SUCCESS);
          setTimeout(() => {
            navigate(ROUTES.LOGIN, { replace: true });
          }, 1500);
        } else {
          const errorMessage = result.error || STATUS_MESSAGES.SIGNUP_ERROR;
          if (errorMessage.toLowerCase().includes('exists') || errorMessage.toLowerCase().includes('already')) {
            setErrors({ email: STATUS_MESSAGES.EMAIL_EXISTS });
          } else {
            setErrors({ general: errorMessage });
          }
        }
      } catch (_error) {
        setErrors({ general: STATUS_MESSAGES.SIGNUP_ERROR });
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, validateForm, signup, navigate],
  );

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setErrors((prev) => ({ ...prev, name: undefined, general: undefined }));
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: undefined, confirmPassword: undefined, general: undefined }));
  }, []);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setErrors((prev) => ({ ...prev, confirmPassword: undefined, general: undefined }));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-secondary-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-secondary-600">
            Sign up to start using {APP_NAME}
          </p>
        </div>

        <div className="rounded-lg bg-white px-6 py-8 shadow-lg sm:px-10">
          {successMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 rounded-md bg-success-50 p-4 text-sm text-success-700 border border-success-200"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-success-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {errors.general && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 rounded-md bg-error-50 p-4 text-sm text-error-700 border border-error-200"
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
                htmlFor="signup-name"
                className="block text-sm font-medium text-secondary-700"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={handleNameChange}
                  disabled={isSubmitting}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'signup-name-error' : undefined}
                  className={`block w-full rounded-md border px-3 py-2 text-secondary-900 shadow-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                    errors.name
                      ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                      : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
                  } disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p
                  id="signup-name-error"
                  role="alert"
                  className="mt-2 text-sm text-error-600"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-secondary-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isSubmitting}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'signup-email-error' : undefined}
                  className={`block w-full rounded-md border px-3 py-2 text-secondary-900 shadow-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                    errors.email
                      ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                      : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
                  } disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p
                  id="signup-email-error"
                  role="alert"
                  className="mt-2 text-sm text-error-600"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-secondary-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isSubmitting}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'signup-password-error' : 'signup-password-hint'}
                  className={`block w-full rounded-md border px-3 py-2 text-secondary-900 shadow-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                    errors.password
                      ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                      : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
                  } disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500`}
                  placeholder="Create a password"
                />
              </div>
              {errors.password ? (
                <p
                  id="signup-password-error"
                  role="alert"
                  className="mt-2 text-sm text-error-600"
                >
                  {errors.password}
                </p>
              ) : (
                <p
                  id="signup-password-hint"
                  className="mt-2 text-xs text-secondary-500"
                >
                  At least 8 characters with one uppercase, one lowercase, and one number.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-sm font-medium text-secondary-700"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={isSubmitting}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={errors.confirmPassword ? 'signup-confirm-password-error' : undefined}
                  className={`block w-full rounded-md border px-3 py-2 text-secondary-900 shadow-sm placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                    errors.confirmPassword
                      ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                      : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
                  } disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p
                  id="signup-confirm-password-error"
                  role="alert"
                  className="mt-2 text-sm text-error-600"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="flex w-full justify-center rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary-400"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
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
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              Already have an account?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="font-medium text-primary-600 transition-colors hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;