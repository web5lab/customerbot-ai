import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useBot } from '../contexts/BotContext';
import { useSelector } from 'react-redux';
import { logedInSelector, userSelector, activeBotSelector } from '../store/global.Selctor';

export function ProtectedRoute({ children, requiresBot = false }) {
  const logedIn = useSelector(logedInSelector);
  const user = useSelector(userSelector);
  const activeBot = useSelector(activeBotSelector);
  const location = useLocation();

  if (!logedIn || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiresBot && !activeBot) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}