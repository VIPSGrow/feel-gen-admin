import SignUpStepForm from '@/components/auth/SignUpStepForm';
import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="min-h-screen flex flex-col p-5">
        <div className="flex flex-1">
          <Suspense fallback={<div>Loading signup form...</div>}>
            <SignUpStepForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

