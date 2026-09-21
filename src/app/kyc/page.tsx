"use client";
import React, { useState, useEffect, useTransition, useCallback, useRef, useCallback as useCallback2 } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/form/input/InputField';
import Checkbox from '@/components/form/input/Checkbox';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import Progress from '@/components/ui/progress/Progress';
import serverCallFuction from '@/lib/constantFunction';
import { User } from '@/lib/auth';
import Link from 'next/link';
import { ChevronLeftIcon, TrashBinIcon } from '@/icons';
import { usePreloader } from '@/context/PreloaderContext';

const KYCPage = () => {
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>({});
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'upload' | 'submit'>('upload');
  const [files, setFiles] = useState({
    aadhaarFront: null as File | null,
    aadhaarBack: null as File | null,
    pan: null as File | null,
    bankPassbook: null as File | null,
    profileImage: null as File | null,
    gstin: null as File | null,
  });
  const [uploadedFiles, setUploadedFiles] = useState<{ type: string, url: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'complete' | 'error'>('idle');
  // Removed aadhaarMethod state as not needed for upload
  const fileInputRefs = useRef({
    aadhaarFront: useRef<HTMLInputElement>(null),
    aadhaarBack: useRef<HTMLInputElement>(null),
    pan: useRef<HTMLInputElement>(null),
    bankPassbook: useRef<HTMLInputElement>(null),
    profileImage: useRef<HTMLInputElement>(null),
    gstin: useRef<HTMLInputElement>(null),
  }).current;
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const router = useRouter();
  const { updateUserProfile, user, logout } = useAuth();
  const [isPending, startTransition] = useTransition();
  const { showLoader, hideLoader } = usePreloader()


  // fetched kyc status
  useEffect(() => {
    const fetchKYCStatus = async (userId: number) => {
      try {
        showLoader()
        const res = await serverCallFuction('GET', `api/users/kyc-status?id=${userId}`);
        if (res.status && res.data) {
          const { status, uploaded_files } = res.data;
          if (status == "under_review") {
            setAlreadySubmitted(true)
            // updateUserProfile({ is_kyc_completed: true } as Partial<User>);
            // localStorage.removeItem('temp_user');
            // router.push('/');
          } else if (status === "approved") {
            updateUserProfile({ kyc_status: true } as Partial<User>)
            setAlreadySubmitted(false)
            logout()
            router.push('/');
          } else {
            setAlreadySubmitted(false)
          }
        }
      } catch (err) {

        console.error('Error fetching KYC status:', err);
      } finally {
        hideLoader()
      }
    };
    if (user) {
      fetchKYCStatus(Number(user.id));

    }
  }, [router, user]);



  // Load temp_user on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tempUserData = localStorage.getItem('temp_user');
      if (tempUserData) {
        const parsed = JSON.parse(tempUserData);
        setTempUser(parsed);
        setFormData(parsed);
      } else {
        // No temp_user, redirect to login
        router.push('/signin');
      }
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (fileName: keyof typeof files, file: File) => {
    setFiles(prev => ({ ...prev, [fileName]: file }));
    setError('');
    // Reset upload state when new file selected
    setUploadProgress(0);
    setUploadStatus('idle');
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
  };

  const triggerFileInput = (fileName: keyof typeof files) => {
    fileInputRefs[fileName]?.current?.click();
  };

  const uploadDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!tempUser) return;

      setLoading(true);

      const uploadedCount = Object.values(files).filter(Boolean).length;
      if (uploadedCount < 4) {

        setError(`Please upload at least 4 documents (got ${uploadedCount}/5)`);
        return;
      }

      setError('');
      setUploadStatus('uploading');
      setUploadProgress(0);

      const formDataToSend = new FormData();
      formDataToSend.append('id', tempUser.id.toString());

      if (files.pan) formDataToSend.append('PAN', files.pan);
      if (files.aadhaarFront) formDataToSend.append('Aadhaar_Front', files.aadhaarFront);
      if (files.aadhaarBack) formDataToSend.append('Aadhaar_Back', files.aadhaarBack);
      if (files.bankPassbook) formDataToSend.append('passbook', files.bankPassbook);
      if (files.profileImage) formDataToSend.append('profile', files.profileImage);
      if (files.gstin) formDataToSend.append('gstin', files.gstin);

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total!) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (!res.status) {
              setError(res.message || res.error || 'Upload failed');
              setUploadStatus('error');
              return;
            }
            setUploadedFiles(res.files || []);
            setUploadStatus('complete');
            setStep('submit');
            setLoading(false);

          } catch (err) {
            setError('Invalid response from server');
            setUploadStatus('error');
          }
        } else {
          setError(`Upload failed: ${xhr.status} ${xhr.statusText}`);
          setUploadStatus('error');
        }
        xhrRef.current = null;
      });

      xhr.addEventListener('error', () => {
        setError('Network error during upload');
        setUploadStatus('error');
        xhrRef.current = null;
      });

      xhr.addEventListener('abort', () => {
        setUploadStatus('idle');
        xhrRef.current = null;
      });

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/api/users/kyc/upload`);
      // xhr.open('POST', 'https://backend.feelsafeco.in/api/users/kyc/upload');

      xhr.send(formDataToSend);
    } catch (err: unknown) {
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
      // startTransition(() => {
      //   setLoading(false);
      // });
      // do not override loading state here; wait for xhr events
    }

  };

  const submitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser) return;

    setLoading(true);
    setError('');

    startTransition(async () => {
      try {
        const res = await serverCallFuction('POST', 'api/users/kyc/submit', {
          id: tempUser.id
        });
        if (!res.status) {
          setError(res.message || res.error || 'Submit failed');
          return;
        }

        updateUserProfile({ is_kyc_completed: true } as Partial<User>);
        localStorage.removeItem('temp_user');
        setSuccess(true);
        setTimeout(() => router.push('/'), 5000);
      } catch (err: unknown) {
        console.error('KYC submit error:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }

    });
  };

  const handleSubmit = step === 'upload' ? uploadDocuments : submitKYC;

  if (!tempUser) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  console.log("alread - ", alreadySubmitted);

  if (alreadySubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">KYC Under Review</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
            Your KYC application request has already been submitted. Please wait patiently while our compliance team verifies your documents.
          </p>
          <div className="space-y-3">
            <Link href="#" onClick={logout} className="block w-full text-center px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl text-sm transition-colors shadow-sm">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/signin" className="inline-flex items-center text-sm text-gray-500 mb-8 hover:text-gray-700">
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back to Sign In
        </Link>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Complete KYC Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Please provide your KYC details to continue
            </p>
            <p className="text-sm text-brand-600 font-medium">
              User: {tempUser.full_name || tempUser.username} ({tempUser.phone})
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl text-success-700 text-sm">
              <div>KYC submitted successfully!</div>
              {uploadedFiles.length > 0 && (
                <details className="mt-2 p-2 bg-white rounded text-xs">
                  <summary>Uploaded files:</summary>
                  <ul className="mt-1 space-y-1">
                    {uploadedFiles.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="font-mono text-xs">{f.type}:</span>
                        <a href={f.url} target="_blank" rel="noopener" className="text-brand-600 hover:underline text-xs truncate max-w-[200px]">{f.url}</a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <div>Redirecting to dashboard in 5 seconds...</div>
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'upload'
                ? 'bg-brand-500 text-white'
                : 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 border border-brand-200 dark:border-brand-800'
                }`}>
                1
              </div>
              <div className="w-12 h-1 bg-brand-200 dark:bg-brand-800" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'submit'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Aadhaar Method */}
            {/* Aadhaar Method section removed as backend is pure upload */}





            {step === 'upload' ?
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {[
                  { key: 'aadhaarFront' as const, label: 'Aadhaar Front Side', required: true },
                  { key: 'aadhaarBack' as const, label: 'Aadhaar Back Side', required: true },
                  { key: 'pan' as const, label: 'PAN Card', required: true },
                  { key: 'bankPassbook' as const, label: 'Bank Passbook / Cheque', required: true },
                  { key: 'profileImage' as const, label: 'Profile Photo', required: false },
                  { key: 'gstin' as const, label: 'GST Certificate', required: false }
                ].map(({ key, label, required }) => {

                  if (key === 'gstin' && (tempUser.gstin === null || tempUser.gstin === undefined || tempUser.gstin === '')) {
                    return null; // Skip GSTIN if not provided
                  }

                  return <div key={key} className="space-y-2">
                    <Label>{label} {required && <span className="text-error-500">*</span>}</Label>
                    <div className="relative">
                      <input
                        ref={fileInputRefs[key]}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const sizeKB = (file.size / 1024).toFixed(0);
                            if (file.size < 100 * 1024 || file.size > 500 * 1024) {
                              setError(`File size must be 100KB - 500KB. Current: ${sizeKB}KB`);
                              return;
                            }

                            handleFileChange(key, file);
                          }

                        }}
                        className="hidden"
                        required={required}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-sm h-11"
                        onClick={() => triggerFileInput(key)}
                      >
                        {files[key]?.name || `Choose ${label.toLowerCase()}`}
                      </Button>
                    </div>
                    {files[key] && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                        <img
                          src={files[key] ? URL.createObjectURL(files[key]) : ''}
                          alt={label}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{files[key]?.name}</p>
                          <p className="text-xs text-gray-500">{(files[key]?.size! / 1024).toFixed(0)} KB</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-0"
                          onClick={() => setFiles(prev => ({ ...prev, [key]: null }))}
                        >
                          <TrashBinIcon style={{ color: 'red' }} />
                        </Button>
                      </div>
                    )}
                  </div>
                }

                )}
              </div>
              : <>
                <p>Your document has been uploaded. Please submit for review</p>
              </>}
            {step === 'submit' ? <Button
              type="submit"
              className="w-full"
              size="md"
              disabled={loading || isPending}
            >
              {loading || isPending ? 'Submitting...' : 'Submit KYC for Verification'}
            </Button> :
              <Button
                type="submit"
                className="w-full"
                size="md"
                disabled={loading || isPending}
              >
                {loading || isPending ? 'Uploading KYC Documents...' : 'Upload KYC Documents'}
              </Button>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default KYCPage;


