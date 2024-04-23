import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export const useAuth = () => {
  const router = useRouter();

  const getToken = () => Cookies.get('token');

  const logout = () => {
    Cookies.remove('token');
    router.push('/login');
  };

  return { getToken, logout };
};
