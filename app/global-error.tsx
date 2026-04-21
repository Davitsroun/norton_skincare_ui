'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Providers } from '@/components/providers';
import { Navigation } from '@/components/navigation';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {

  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans antialiased">
        <Providers>
          <div className="min-h-screen bg-white">
            <Navigation />
            <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-10 text-center">
              <div className="w-full max-w-xl">
                <Image
                  src="/500%20Internal%20Server%20Error-pana.svg"
                  alt="Internal server error illustration"
                  width={900}
                  height={700}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>

              <h1 className="mt-6 text-3xl font-bold text-gray-900 sm:text-4xl">Application error</h1>
              <p className="mt-3 max-w-lg text-sm text-gray-600 sm:text-base">
                A critical error occurred while rendering this page.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild variant="outline" className="rounded-xl px-6 bg-primary text-white hover:bg-primary/90">
                  <Link href="/home">Go Home</Link>
                </Button>
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
