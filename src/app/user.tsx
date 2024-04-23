
'use client';
import { Button } from '../components/ui/button';
import { cookies } from 'next/headers';
import { useRouter } from 'next/navigation';

export async function User() {
  const router = useRouter();

  function signOut(){
    router.replace('/login')
  }

  return (
    <div className="flex items-center gap-4">
        <Button onClick={() => { signOut(); }} variant="outline">Sign Out</Button>
    </div>
  );
}