import { Metadata } from 'next';
import * as React from 'react';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Not Found',
};

export default function NotFound() {
  return (
    <main>
      <section className='bg-white'>
        <div className='flex min-h-screen flex-col items-center justify-center text-center text-black px-4'>
          <AlertTriangle size={60} className='text-red-500 mb-8' />
          <h1 className='text-4xl md:text-6xl mb-4'>Page Not Found</h1>
          <a href='/' className='text-blue-500 hover:text-blue-700 underline'>
            Back to home
          </a>
        </div>
      </section>
    </main>
  );
}
