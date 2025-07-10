'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';

import Button from '@/components/atoms/buttons/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <section className='bg-white'>
        <div className='flex min-h-screen flex-col items-center justify-center text-center text-black px-4'>
          <AlertTriangle size={60} className='text-red-500 mb-8' />
          <h1 className='text-4xl md:text-6xl mb-4'>
            Oops, something went wrong!
          </h1>
          <Button onClick={reset} className='mt-4'>
            Try again
          </Button>
        </div>
      </section>
    </main>
  );
}
