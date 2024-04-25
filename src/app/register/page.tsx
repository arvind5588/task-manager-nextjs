'use client';
import Link from 'next/link';
import { CommonForm } from '../../components/form';
import { SubmitButton } from '../../components/submit-button';
import { useRouter } from 'next/navigation';
import React, { useState, FormEvent } from 'react'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
export default function Register() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const handleSuccess = (obj : any) => {
      toast.success(obj.msg, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
      });
    };
    async function register(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null) // Clear previous errors when a new request starts
        const formData = new FormData(event.currentTarget);
        let email = formData.get('email') as string;
        let password = formData.get('password') as string;

        const response = await fetch(`${baseUrl}/auth/register`, {
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
            setError(null);
            handleSuccess({msg : "Congratulations! your account has been registered successfully."});
            setTimeout(() => {
              router.push('/login');
            }, 2000);
        }
    }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Sign Up</h3>
          <p className="text-sm text-gray-500">
            Create an account with your email and password
          </p>
        </div>
        <ToastContainer />
        {error &&
            <div className="p-4 mb-4 text-sm text-center items-center text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                <span className="font-medium">{error}</span> 
            </div>
        }
        <form onSubmit={register} method='post' className="flex flex-col space-y-4 bg-gray-50 px-4">
            <CommonForm />
            <SubmitButton>Sign Up</SubmitButton>
            <p className="text-center text-sm text-gray-600">
                {'Already have an account? '}
                <Link href="/login" className="font-semibold text-gray-800">
                  Sign in
                </Link>
                {' instead.'}
              </p>
        </form>
      </div>
    </div>
  );
}