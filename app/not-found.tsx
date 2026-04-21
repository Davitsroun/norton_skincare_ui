import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navigation />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="relative mx-auto w-full max-w-lg">
          <Image
            src="/page_notfound.svg"
            alt=""
            width={900}
            height={700}
            priority
            className="h-auto w-full object-contain"
          />
        </div>

        <p className="mt-8 text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Oops!
        </p>
        <p className="mt-3 max-w-md text-center text-base text-gray-600 sm:text-lg">
          This page wandered off the trail. Let&apos;s get you back somewhere familiar.
        </p>

        <Button
          asChild
          size="lg"
          className="mt-8 rounded-xl bg-gray-900 px-8 text-white hover:bg-gray-800"
        >
          <Link href="/home">Back to Home</Link>
        </Button>
      </main>
    </div>
  );
}
