import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CircleDollarSign, Building2, LogIn, AlertCircle, Eye, EyeOff, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

const checkPasswordStrength = (password: string): { score: number; label: string; color: string; checks: { label: string; passed: boolean }[] } => {
  const checks = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'Contains uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', passed: /[a-z]/.test(password) },
    { label: 'Contains number', passed: /\d/.test(password) },
    { label: 'Contains special character', passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const score = checks.filter(c => c.passed).length;
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  return { score, label: labels[score] || '', color: colors[score] || '', checks };
};

const OTPInput: React.FC<{ value: string[]; onChange: (v: string[]) => void }> = ({ value, onChange }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newVal = [...value];
    newVal[index] = val.slice(-1);
    onChange(newVal);
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="text"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
        />
      ))}
    </div>
  );
};

export const EnhancedLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [otpValue, setOtpValue] = useState<string[]>(Array(6).fill(''));
  const [otpTimer, setOtpTimer] = useState(30);
  const [showStrength, setShowStrength] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const passwordStrength = checkPasswordStrength(password);

  useEffect(() => {
    if (step === '2fa' && otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer(s => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, otpTimer]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password, role);

      setStep('2fa');
      setOtpTimer(30);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpValue.join('');
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 1000));
    if (otp.length === 6) {
      navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
    } else {
      setError('Please enter the complete 6-digit code');
    }
    setIsLoading(false);
  };

  const fillDemoCredentials = (userRole: UserRole) => {
    if (userRole === 'entrepreneur') {
      setEmail('sarah@techwave.io');
      setPassword('Password@123');
    } else {
      setEmail('michael@vcinnovate.com');
      setPassword('Secure#Pass9');
    }
    setRole(userRole);
    setShowStrength(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield size={28} className="text-white" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-3xl font-extrabold text-gray-900">
          {step === 'credentials' ? 'Sign in to Business Nexus' : 'Two-Factor Authentication'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'credentials'
            ? 'Connect with investors and entrepreneurs'
            : 'Enter the 6-digit code sent to your email'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {step === 'credentials' ? (
            <form className="space-y-5" onSubmit={handleCredentialsSubmit}>
              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { r: 'entrepreneur', icon: <Building2 size={18} />, label: 'Entrepreneur' },
                    { r: 'investor', icon: <CircleDollarSign size={18} />, label: 'Investor' },
                  ] as const).map(({ r, icon, label }) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-3 px-4 border-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
                        role === r
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                      <span className="font-medium text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div className={`text-xs p-3 rounded-lg ${role === 'entrepreneur' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                {role === 'entrepreneur'
                  ? '🚀 You\'ll have access to the Entrepreneur Dashboard with investor discovery and pitch tools.'
                  : '💼 You\'ll have access to the Investor Dashboard with startup discovery and portfolio tools.'
                }
              </div>

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
                startAdornment={<User size={18} />}
              />

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setShowStrength(e.target.value.length > 0); }}
                    required
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {}
                {showStrength && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1.5 rounded-full transition-all ${
                            i < passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.label && (
                      <p className={`text-xs font-medium ${
                        passwordStrength.score >= 4 ? 'text-green-600' :
                        passwordStrength.score >= 3 ? 'text-yellow-600' : 'text-red-500'
                      }`}>
                        Password Strength: {passwordStrength.label}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-1">
                      {passwordStrength.checks.map((check, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          {check.passed
                            ? <CheckCircle size={11} className="text-green-500 flex-shrink-0" />
                            : <XCircle size={11} className="text-gray-300 flex-shrink-0" />
                          }
                          <span className={check.passed ? 'text-gray-700' : 'text-gray-400'}>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember" type="checkbox" className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-700">Remember me</label>
                </div>
                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">Forgot password?</a>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading} leftIcon={<LogIn size={18} />} size="lg">
                Sign in
              </Button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOTPSubmit}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
                  <Shield size={32} className="text-primary-600" />
                </div>
                <p className="text-sm text-gray-600">We sent a verification code to</p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>

              <OTPInput value={otpValue} onChange={setOtpValue} />

              <div className="text-center">
                {otpTimer > 0 ? (
                  <p className="text-sm text-gray-500">Resend code in <span className="font-medium text-gray-900">{otpTimer}s</span></p>
                ) : (
                  <button type="button" onClick={() => setOtpTimer(30)} className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                    Resend verification code
                  </button>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
                <p className="font-medium mb-1">Demo mode</p>
                <p>Enter any 6 digits to continue. In production, a real OTP would be sent.</p>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading} leftIcon={<Shield size={18} />} size="lg">
                Verify & Sign In
              </Button>

              <button type="button" onClick={() => setStep('credentials')} className="w-full text-sm text-gray-500 hover:text-gray-700">
                ← Back to login
              </button>
            </form>
          )}

          {step === 'credentials' && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" onClick={() => fillDemoCredentials('entrepreneur')} leftIcon={<Building2 size={14} />}>
                    Entrepreneur
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fillDemoCredentials('investor')} leftIcon={<CircleDollarSign size={14} />}>
                    Investor
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">Sign up</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};