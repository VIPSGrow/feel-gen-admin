"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { EyeCloseIcon, EyeIcon } from '@/icons';
import serverCallFuction from '@/lib/constantFunction';
import { validatePhone } from '@/lib/validation';
import Link from 'next/link';
import { ChevronLeftIcon } from '@/icons';

const ResetPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [identifierType, setIdentifierType] = useState<'phone' | 'email' | null>(null);

  const phoneRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateIdentifier = () => {
    if (!identifier.trim()) return 'Please enter phone or email';

    if (phoneRegex.test(identifier)) {
      return null; // valid phone
    }

    if (emailRegex.test(identifier)) {
      return null; // valid email
    }

    return 'Enter valid phone (10 digits starting 6-9) or email';
  };

  const validateOtp = () => {
    // Corrected regex: /\d{6}/
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) return 'Enter 6-digit OTP';
    return null;
  };

  const validatePasswords = () => {
    if (newPassword.length < 8) return 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSendOtp = async () => {
    const valError = validateIdentifier();
    if (valError) {
      setError(valError);
      return;
    }

    setLoading(true);
    setError('');
    const type = phoneRegex.test(identifier) ? 'phone' : 'email';
    try {
      const res = await serverCallFuction('POST', 'api/users/send-otp', { identifier, type: identifierType! });
      if (res.success) {
        setIdentifierType(type);
        setStep(2);
      } else {
        setError(res.message || 'Failed to send OTP. User not found.');
      }
    } catch (err) {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const valError = validateOtp();
    if (valError) {
      setError(valError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await serverCallFuction('POST', 'api/users/verify-otp', { identifier, otp, type: identifierType! });
      if (res.success) {
        setStep(3);
      } else {
        setError(res.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const valError = validatePasswords();
    if (valError) {
      setError(valError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await serverCallFuction('POST', 'api/users/reset-password', { identifier, otp, newPassword });
      if (res.success) {
        alert('Password reset successful! Redirecting to sign in...');
        router.push('/signin');
      } else {
        setError(res.message || res.error || 'Reset failed');
      }
    } catch (err) {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => setStep(Math.max(1, step - 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="min-h-screen flex flex-col p-5">
        <div className="flex flex-1 justify-center items-center">
          <div className="w-full max-w-md">
            <Link href="/" className="inline-flex items-center mb-8 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Back to dashboard
            </Link>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Reset Password</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {step === 1 && 'Enter your phone or email to receive OTP'}
                  {step === 2 && 'Enter the OTP sent to your phone/email'}
                  {step === 3 && 'Create a new password'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="flex justify-between mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`flex-1 h-2 mx-1 rounded-full ${step >= s ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                ))}
              </div>

              {error && (
                <div className="p-4 mb-6 text-sm text-error-500 bg-error-50 border border-error-200 rounded-lg dark:bg-error-900/20 dark:border-error-800">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label>Phone or Email <span className="text-error-500">*</span></Label>
                    {/* <Input
                      placeholder="9999999999 or user@example.com"
                      defaultValue={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      type="text"
                    /> */}

                    <Input
                      placeholder="Enter Phone no. or Email"
                      value={identifier || ""} // Aap state key badal kar 'identifier' rakh sakte hain
                      onChange={(e) => {
                        let val = e.target.value;

                        // 1. Agar user number enter kar raha hai (starts with a digit)
                        if (/^\d/.test(val)) {
                          // Sirf numbers allow karo aur non-digits hatao
                          val = val.replace(/\D/g, "");

                          // Indian standard: Pehla digit sirf 6, 7, 8, ya 9 hona chahiye, aur length max 10
                          if (val !== "" && !/^[6-9]/.test(val)) {
                            return; // Agar 6-9 se start nahi ho raha toh update mat karo
                          }
                          if (val.length > 10) {
                            val = val.slice(0, 10); // Max 10 digits restriction
                          }
                        }
                        // 2. Agar user email ya alphabets likh raha hai
                        else {
                          // Email me spaces nahi hote, toh spaces prevent kar sakte hain (optional)
                          val = val.trim();
                        }

                        // Apne global state handler ko call karein
                        setIdentifier(val);
                      }}
                      // Note: inputMode="numeric" mat rakhna, warna text type karte waqt dikkat hogi
                      type="text"
                    // error={!!fieldErrors.identifier}
                    // hint={fieldErrors.identifier}
                    />

                  </div>
                  <Button onClick={handleSendOtp} className="w-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label>OTP <span className="text-error-500">*</span></Label>
                    <Input
                      placeholder="123456"
                      defaultValue={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\\D/g, ''))}
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={goBack} className="flex-1">Back</Button>
                    <Button onClick={handleVerifyOtp} className="flex-1" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label>New Password <span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type={'password'}
                        placeholder="At least 8 characters"
                        defaultValue={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />

                    </div>
                  </div>
                  <div>
                    <Label>Confirm Password <span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type={'password'}
                        placeholder="Confirm your new password"
                        defaultValue={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      {/* <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                      >
                        {showConfirmPass ? <EyeIcon className="w-5 h-5" /> : <EyeCloseIcon className="w-5 h-5" />}
                      </span> */}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={goBack} className="flex-1">Back</Button>
                    <Button onClick={handleResetPassword} className="flex-1" disabled={loading}>
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remember your password?{' '}
                <Link href="/signin" className="text-brand-500 hover:text-brand-600 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

