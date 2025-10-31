import { useState, useEffect } from 'react';
import { firebaseAuth } from '@/utils/firebase/firebase.config';
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import LoadingButton from './Buttons/LoadingButton';
import GoogleIcon from './icons/GoogleIcon';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { validatePassword } from '@/utils/security/passwordValidation';
import PasswordStrengthMeter from '@/components/ui/PasswordStrengthMeter';
import { useTranslations } from 'next-intl';
import { logUserLogin, logUserRegistration, logError } from '@/utils/analytics';

// Helper function to get user-friendly error messages
const getFirebaseErrorMessage = (error: any, t: any): string => {
  const errorCode = error?.code || '';

  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return t('errors.userNotFound');
    case 'auth/email-already-in-use':
      return t('errors.emailAlreadyInUse');
    case 'auth/weak-password':
      return t('errors.weakPassword');
    case 'auth/invalid-email':
      return t('errors.invalidEmailFormat');
    case 'auth/operation-not-allowed':
      return t('errors.operationNotAllowed');
    case 'auth/user-disabled':
      return t('errors.userDisabled');
    case 'auth/too-many-requests':
      return t('errors.tooManyRequests');
    case 'auth/network-request-failed':
      return t('errors.networkRequestFailed');
    case 'auth/popup-closed-by-user':
      return t('errors.popupClosedByUser');
    case 'auth/popup-blocked':
      return t('errors.popupBlocked');
    case 'auth/cancelled-popup-request':
      return t('errors.cancelledPopupRequest');
    case 'auth/internal-error':
      return t('errors.internalError');
    case 'auth/unauthorized-domain':
      return t('errors.unauthorizedDomain');
    default:
      if (errorCode.includes('cors') || error.message?.includes('Cross-Origin')) {
        return t('errors.corsError');
      }
      return error?.message || t('errors.unexpectedError');
  }
};

export default function Login(props: { onClose: () => void }) {
  const t = useTranslations('auth');
  const toast = useToast();

  // State variables for the enhanced login component
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | React.ReactNode>('');
  const [loadingGoogleLogin, setLoadingGoogleLogin] = useState(false);
  const [loadingEmailLogin, setLoadingEmailLogin] = useState(false);
  const [loadingEmailRegister, setLoadingEmailRegister] = useState(false);

  // Clear error message when inputs change
  useEffect(() => {
    if (errorMessage) setErrorMessage('');
  }, [email, password, confirmPassword, activeTab, errorMessage]);

  // Sign in with Google
  const signInWithGoogleRedirect = async () => {
    setLoadingGoogleLogin(true);
    setErrorMessage('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      if (result) {
        // Log successful Google login
        logUserLogin('google');

        props.onClose();
        if (toast) {
          toast.showToast({
            type: 'success',
            title: t('modal.loginSuccessTitle'),
            message: t('modal.loginSuccessMessage'),
            duration: 4000,
          });
        }
      }
    } catch (error: unknown) {
      console.error('Google login error:', error);
      const errorMsg = getFirebaseErrorMessage(error, t);
      setErrorMessage(errorMsg);

      // Log failed Google login
      logError('Google login failed', (error as any)?.code, false);

      if (toast) {
        toast.showToast({
          type: 'error',
          title: t('modal.googleSignInFailed'),
          message: errorMsg,
          duration: 8000,
        });
      }
    } finally {
      setLoadingGoogleLogin(false);
    }
  }; // Sign in with email and password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage(t('errors.allFieldsRequired'));
      return;
    }

    setLoadingEmailLogin(true);
    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      if (result) {
        // Log successful email login
        logUserLogin('email');

        props.onClose();
        if (toast) {
          toast.showToast({
            type: 'success',
            title: t('modal.loginSuccessTitle'),
            message: t('modal.loginSuccessMessage'),
            duration: 4000,
          });
        }
      }
    } catch (error: any) {
      console.error('Email login error:', error);

      // Log failed email login
      logError('Email login failed', error?.code, false);

      // Check for any provider-related errors first
      if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/invalid-credential') {
        try {
          // Use fetchSignInMethodsForEmail to check which providers are linked to this email
          const signInMethods = await fetchSignInMethodsForEmail(firebaseAuth, email);

          if (signInMethods.includes('google.com')) {
            setErrorMessage(
              <span>
                {t('errors.registeredWithMethod', { method: 'Google' })}{' '}
                <button
                  type="button"
                  onClick={signInWithGoogleRedirect}
                  className="text-[color:var(--ai-primary)] underline hover:text-[color:var(--ai-secondary)]"
                >
                  {t('modal.signInWithGoogle').toLowerCase()}
                </button>
                {t('errors.useDifferentMethod')}
              </span>
            );
          } else if (signInMethods.length > 0) {
            setErrorMessage(t('errors.registeredWithMethod', { method: signInMethods.join(', ') }));
          } else if (error.code === 'auth/invalid-credential') {
            // This likely means the account exists but with a different authentication method
            // or the password is incorrect
            setErrorMessage(
              <span>
                {t('errors.userNotFound')}{' '}
                <button
                  type="button"
                  onClick={signInWithGoogleRedirect}
                  className="text-[color:var(--ai-primary)] underline hover:text-[color:var(--ai-secondary)]"
                >
                  {t('modal.signInWithGoogle').toLowerCase()}
                </button>
                {t('errors.useDifferentMethod')}
              </span>
            );
          } else {
            // Generic error for other cases
            setErrorMessage(t('errors.unableToSignIn'));
          }
        } catch (methodError) {
          console.error('Error checking sign-in methods:', methodError);
          setErrorMessage(getFirebaseErrorMessage(methodError, t));
        }
      } else if (error.code === 'auth/user-not-found') {
        // User doesn't exist, suggest registration
        setErrorMessage(
          <span>
            {t('errors.userNotFound')}{' '}
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="text-[color:var(--ai-primary)] underline hover:text-[color:var(--ai-secondary)]"
            >
              {t('modal.createAccount').toLowerCase()}
            </button>
            ?
          </span>
        );
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage(t('errors.userNotFound'));
      } else {
        setErrorMessage(getFirebaseErrorMessage(error, t));
      }
    } finally {
      setLoadingEmailLogin(false);
    }
  };

  // Register with email and password
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic input validation
    if (!email || !password || !confirmPassword) {
      setErrorMessage(t('errors.allFieldsRequired'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('errors.passwordMismatch'));
      return;
    }

    // Enhanced security: Use the new password validation utility
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setErrorMessage(
        <div className="space-y-2">
          <p className="font-medium">{t('errors.passwordRequirements')}</p>
          <ul className="list-disc pl-4 text-sm">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      );
      return;
    }

    setLoadingEmailRegister(true);
    setErrorMessage('');

    try {
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      if (result) {
        // Log successful registration
        logUserRegistration('email');

        props.onClose();
        if (toast) {
          toast.showToast({
            type: 'success',
            title: t('modal.registrationSuccessTitle'),
            message: t('modal.registrationSuccessMessage'),
            duration: 4000,
          });
        }
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMsg = getFirebaseErrorMessage(error, t);
      setErrorMessage(errorMsg);

      // Log failed registration
      logError('Registration failed', (error as any)?.code, false);

      if (toast) {
        toast.showToast({
          type: 'error',
          title: t('modal.registrationFailed'),
          message: errorMsg,
          duration: 8000,
        });
      }
    } finally {
      setLoadingEmailRegister(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Tabs for login and register
  const tabVariants = {
    inactive: { opacity: 0.7, y: 0 },
    active: {
      opacity: 1,
      y: 0,
      boxShadow: '0 2px 0 var(--ai-primary)',
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full p-8 overflow-hidden bg-[color:var(--ai-card-bg)]/95 rounded-2xl border border-[color:var(--ai-card-border)] shadow-2xl relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"></div>
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-[color:var(--ai-primary)]/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[color:var(--ai-secondary)]/10 rounded-full blur-xl"></div>

      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[color:var(--ai-foreground)]">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]">
            {activeTab === 'login' ? t('modal.welcomeBack') : t('modal.createAccount')}
          </span>
        </h1>
        <p className="text-[color:var(--ai-muted)] text-sm max-w-xs mx-auto">
          {activeTab === 'login' ? t('modal.loginSubtitle') : t('modal.registerSubtitle')}
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex w-full max-w-xs mb-6">
        <motion.button
          className={`flex-1 py-2 font-medium text-center transition-all ${activeTab === 'login' ? 'text-[color:var(--ai-primary)]' : 'text-[color:var(--ai-muted)]'}`}
          animate={activeTab === 'login' ? 'active' : 'inactive'}
          variants={tabVariants}
          onClick={() => setActiveTab('login')}
        >
          {t('modal.tabLogin')}
        </motion.button>
        <motion.button
          className={`flex-1 py-2 font-medium text-center transition-all ${activeTab === 'register' ? 'text-[color:var(--ai-primary)]' : 'text-[color:var(--ai-muted)]'}`}
          animate={activeTab === 'register' ? 'active' : 'inactive'}
          variants={tabVariants}
          onClick={() => setActiveTab('register')}
        >
          {t('modal.tabRegister')}
        </motion.button>
      </motion.div>

      {/* Error message */}
      {errorMessage && (
        <motion.div
          className="bg-[color:var(--ai-danger)]/10 text-[color:var(--ai-danger)] p-3 rounded-lg text-sm mb-4 w-full max-w-xs"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          {errorMessage}
        </motion.div>
      )}

      {/* Login Form */}
      {activeTab === 'login' && (
        <motion.form
          variants={itemVariants}
          className="w-full max-w-xs space-y-4"
          onSubmit={handleEmailLogin}
        >
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[color:var(--ai-foreground)]"
            >
              {t('modal.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--ai-primary)]/50 focus:border-[color:var(--ai-primary)] text-[color:var(--ai-foreground)]"
              placeholder={t('modal.emailPlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[color:var(--ai-foreground)]"
              >
                {t('modal.passwordLabel')}
              </label>
              <a href="#" className="text-xs text-[color:var(--ai-primary)] hover:underline">
                {t('modal.forgotPasswordLink')}
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--ai-primary)]/50 focus:border-[color:var(--ai-primary)] text-[color:var(--ai-foreground]"
              placeholder={t('modal.passwordPlaceholder')}
              required
            />
          </div>{' '}
          {loadingEmailLogin ? (
            <LoadingButton className="w-full py-2.5" loadingText={t('modal.signingIn')} />
          ) : (
            <button
              type="submit"
              disabled={loadingEmailLogin}
              className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {t('modal.signInButton')}
            </button>
          )}
        </motion.form>
      )}

      {/* Register Form */}
      {activeTab === 'register' && (
        <motion.form
          variants={itemVariants}
          className="w-full max-w-xs space-y-4"
          onSubmit={handleEmailRegister}
        >
          <div className="space-y-2">
            <label
              htmlFor="register-email"
              className="block text-sm font-medium text-[color:var(--ai-foreground)]"
            >
              {t('modal.emailLabel')}
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--ai-primary)]/50 focus:border-[color:var(--ai-primary)] text-[color:var(--ai-foreground)]"
              placeholder={t('modal.emailPlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="register-password"
              className="block text-sm font-medium text-[color:var(--ai-foreground)]"
            >
              {t('modal.passwordLabel')}
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--ai-primary)]/50 focus:border-[color:var(--ai-primary)] text-[color:var(--ai-foreground)]"
              placeholder={t('modal.passwordPlaceholder')}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-[color:var(--ai-foreground)]"
            >
              {t('modal.confirmPasswordLabel')}
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 bg-[color:var(--ai-background)] border border-[color:var(--ai-card-border)] rounded-lg focus:ring-2 focus:ring-[color:var(--ai-primary)]/50 focus:border-[color:var(--ai-primary)] text-[color:var(--ai-foreground)]"
              placeholder={t('modal.passwordPlaceholder')}
              required
            />
          </div>{' '}
          {loadingEmailRegister ? (
            <LoadingButton className="w-full py-2.5" loadingText={t('modal.creatingAccount')} />
          ) : (
            <button
              type="submit"
              disabled={loadingEmailRegister}
              className="w-full bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)] text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {t('modal.createAccountButton')}
            </button>
          )}{' '}
          {/* Password strength meter */}
          {activeTab === 'register' && password && (
            <div className="mb-4">
              <PasswordStrengthMeter password={password} showRequirements={true} />
            </div>
          )}
        </motion.form>
      )}

      {/* Divider */}
      <motion.div variants={itemVariants} className="flex items-center my-6 w-full max-w-xs">
        <div className="flex-1 h-px bg-[color:var(--ai-card-border)]"></div>
        <span className="px-4 text-sm text-[color:var(--ai-muted)]">
          {t('modal.orContinueWith')}
        </span>
        <div className="flex-1 h-px bg-[color:var(--ai-card-border)]"></div>
      </motion.div>

      {/* Social login */}
      <motion.div variants={itemVariants}>
        {loadingGoogleLogin ? (
          <LoadingButton />
        ) : (
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[color:var(--ai-card-bg)] dark:bg-[color:var(--ai-card-bg)] text-[color:var(--ai-foreground)] rounded-lg border border-[color:var(--ai-card-border)] hover:bg-[color:var(--ai-card-bg)]/80 font-medium text-sm shadow-sm transition-all duration-300 transform hover:-translate-y-1"
            onClick={signInWithGoogleRedirect}
          >
            <GoogleIcon />
            <span>{t('modal.signInWithGoogle')}</span>
          </button>
        )}
      </motion.div>

      {/* Terms */}
      <motion.div
        variants={itemVariants}
        className="mt-6 text-[color:var(--ai-muted)] text-xs text-center max-w-xs"
      >
        {t('modal.termsPrefix')}{' '}
        <a href="/terms-conditions" className="text-[color:var(--ai-primary)] hover:underline">
          {t('modal.termsLink')}
        </a>{' '}
        {t('modal.termsAnd')}{' '}
        <a href="/privacy-policy" className="text-[color:var(--ai-primary)] hover:underline">
          {t('modal.privacyLink')}
        </a>
        .
      </motion.div>
    </motion.div>
  );
}
