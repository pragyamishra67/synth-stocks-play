import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import Signup from './Signup';

const Index = () => {
  const { user } = useUser();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Signup />;
};

export default Index;
