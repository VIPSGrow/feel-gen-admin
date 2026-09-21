"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Checkbox from '@/components/form/input/Checkbox';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '@/icons';
import Link from 'next/link';
import React, { useState, useTransition } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import { User } from '@/lib/auth';
import Badge from '../ui/badge/Badge';
import { validatePhone } from '@/lib/validation'
export default function SignInForm() {

  const [isChecked, setIsChecked] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();


  const [otpViewEnable, setOtpViewEnable] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ✅ Phone validation
    if (!validatePhone(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }


    setLoading(true);

    startTransition(async () => {
      try {
        const res = await serverCallFuction(
          'POST',
          'api/auth/login',
          { phone, password, identifier: 'phone', otp }
        );
        if (!res.status) {
          // if(res.message === "KYC not completed"){
          //   localStorage.setItem('temp_user', JSON.stringify(res.user));
          // }
          if (res.message == "Account locked. OTP required to unlock.") {
            setOtpViewEnable(true)
          }
          setError(res.message || 'Login failed');
          return;
        }

        if (res.user.role !== "Super Admin" && res.user.kyc_status === false) {
          localStorage.setItem('temp_user', JSON.stringify(res.user));
        }


        login({ token: res.token!, user: res.user as User });

        // router.replace('/');
        setTimeout(() => {
          // router.replace('/');
          window.location.replace('/');
        }, 100);

      } catch (err) {
        console.log("err in login - ", err);

        setError('Network error. Try again.');
      } finally {
        setLoading(false);

      }
    });
  };


  const handleSendOtp = async () => {
    try {
      const res = await serverCallFuction('POST', 'api/auth/send-login-otp', { identifier: phone });
      if (res.success) {
        setError(res.message)
      }

    } catch (error) {
      console.log("err in login - ", error);
      setError('Network error. Try again.');
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <img src="/images/logo/logo.png" alt='logo' className='mx-auto mb-4 ' />
            <h1 className="mt-5 mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your phone number and password to sign in!
            </p>
          </div>
          <div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Phone <span className="text-error-500">*</span>
                  </Label>
                  {/* <Input
                    defaultValue={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="99999 99999"
                    type="phone"
                    // required
                  /> */}
                  <Input
                    defaultValue={phone}
                    onChange={(e) => {
                      // allow only digits
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                    }}
                    placeholder="9999999999"
                    type="tel"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      defaultValue={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={'password'}
                      placeholder="password"
                    // required
                    />

                  </div>
                </div>


                {/* {otpViewEnable && <div>
                  <Label>
                    OTP <span className="text-error-500">*</span>
                  </Label>
                  <div className="">
                    <Input
                      defaultValue={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      // type={showPassword ? 'text' : 'password'}
                      placeholder="Enter 6 digit OTP"
                    // required
                    />
                  </div>
                   <span
                      
                      className="cursor-pointer font-size-sm"
                    >
                      Send OTP
                    </span>
                </div>} */}
                {otpViewEnable && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>
                        OTP <span className="text-error-500">*</span>
                      </Label>
                      <button
                        type="button"
                        onClick={handleSendOtp} // Make sure to define this function
                        className="text-xs font-medium text-brand-500 hover:text-brand-600 cursor-pointer transition-colors"
                      >
                        Resend OTP?
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        defaultValue={otp} // Use 'value' for controlled components
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6 digit OTP"
                        max={"6"}
                        className="tracking-[0.5em] text-center font-bold" // Optional: makes OTP look better
                      />
                    </div>

                    <p className="text-xs text-gray-500">
                      Check your registered email or phone for the code.
                    </p>
                  </div>
                )}




                {error && (
                  <>
                    <div className="p-3 text-sm text-error-500 bg-error-50 border border-error-200 rounded-md dark:bg-error-900/20 dark:border-error-800">
                      {error} {error === "KYC not completed" && <Badge color='primary' onClick={() => {
                        navigation.navigate('/kyc')
                      }}>Complete KYC</Badge>}
                    </div>
                    {/* {error === "KYC not completed" && <Link href="/kyc" className="text- ">Complete KYC</Link>} */}
                  </>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link href="/reset-password" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                    Forgot password?
                  </Link>
                </div>
                <Button className="w-full" size="sm" type="submit" disabled={loading || isPending}>
                  {loading || isPending ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Do not have an account?{' '}
                <Link href="/signup" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
