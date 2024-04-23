'use client'
import Link from 'next/link';
import { CommonForm } from '../../components/form';
import { SubmitButton } from '../../components/submit-button';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null) // Clear previous errors when a new request starts
        const formData = new FormData(event.currentTarget);
        let email = formData.get('email') as string;
        let password = formData.get('password') as string;

        const response = await fetch(`http://localhost:3000/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const result = await response.json();
        if(result.statusCode!=201){
            setError( result.message );
        }else{
            setError( result.message );
            const token = result.data.access_token;
            document.cookie = `token=${token}; path=/`
            router.push('/dashboard');
        }
    }

return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Sign In</h3>
          <p className="text-sm text-gray-500">
            Use your email and password to sign in
          </p>
        </div>
        {error &&
            <div className="p-4 mb-4 text-sm text-center items-center text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                <span className="font-medium">Oops!</span> {error}
            </div>
        }
        <form onSubmit={onSubmit} method='post' className="flex flex-col space-y-4 bg-gray-50 px-4">
            <CommonForm />
            <SubmitButton>Sign In</SubmitButton>
            <p className="text-center text-sm text-gray-600">
                {'Dont have an account? click here to ' }
                <Link href="/register" className="font-semibold text-gray-800">
                Sign up
                </Link>
                {' your account.'}
            </p>
        </form>
      </div>
    </div>
  );
}