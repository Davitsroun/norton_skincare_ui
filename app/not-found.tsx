import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navigation />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16 mx-auto ">
        <div className="relative mx-auto w-full max-w-lg">
          <Image
            src="/page_notfound.svg"
            alt=""
            width={800}
            height={700}
            priority
            className="h-auto w-full object-contain"
          />
        </div>

        <p className="mt-8 text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Oops! Page not found
        </p>

        <Button
          asChild
          size="lg"
          className="mt-8 rounded-xl bg-primary px-8 text-white hover:bg-blue-800"
        >
          <Link href="/home">Back to Home</Link>
        </Button>
      </main>
    </div>
  );
}
