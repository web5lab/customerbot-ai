import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { BotProvider } from './contexts/BotContext';
import { useDispatch, useSelector } from 'react-redux';
import { Bots } from './pages/Bots';
import { Dashboard } from './pages/Dashboard';
import { Training } from './pages/Training';
import { Sessions } from './pages/Sessions';
import { Preview } from './pages/Preview';
import { ApiWorkflowBuilder } from './pages/Integration';
import { Billing } from './pages/Billing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Settings } from './pages/Settings';
import { Integrations } from './pages/Integrations';
import { BotSettings } from './pages/BotSettings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useEffect } from 'react';
import { logedInSelector } from './store/global.Selctor';
import { setLogedIn } from './store/global.Slice';
import { GetBots, GetUserData } from './store/global.Action';
import BotChat from './pages/BotChat';
import { HomePage } from './landing/pages/HomePage';
import { Chatbot } from './landing/components/Chatbot';
import { Footer } from './landing/components/Footer';
import { Navigation } from './landing/components/Navigation';
import ChatWidget from './pages/ChatBot';
import { ChatUI } from './components/ChatUi';
import { ShareChatUI } from './components/ShareChatUi';
import { Teams } from './pages/Teams';
import { Leads } from './pages/Leads';

const botRoutes = [
  { path: '/stats', element: <Dashboard /> },
  { path: '/training', element: <Training /> },
  { path: '/sessions', element: <Sessions /> },
  { path: '/botchat', element: <BotChat /> },
  { path: '/preview', element: <Preview /> },
  { path: '/integrations', element: <Integrations /> },
  { path: '/bot-settings', element: <BotSettings /> },
  { path: '/teams', element: <Teams /> },
  { path: '/leads', element: <Leads /> },
];

function AuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      dispatch(GetUserData(token));
      navigate('/dashboard');
    }
  }, [location, navigate, dispatch]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/chat' ||
    location.pathname === '/chatbot';

  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    // Render landing layout without Sidebar/Header
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navigation />
        <div className="mt-8 flex-grow">
          <HomePage />
        </div>
        <Footer />
        <Chatbot />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen custom-scrollbar2 overflow-hidden ${isAuthPage ? 'bg-blue-50' : 'bg-white'
        }`}
    >
      <div className="flex h-screen">
        {!isAuthPage && <Sidebar />}
        <div className="flex-1 overflow-auto h-full">
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/chatbot" element={<ChatWidget />} />
              <Route path='/chat' element={<ShareChatUI />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth-success" element={<AuthHandler />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div className="w-full mx-auto">
                      <Bots />
                    </div>
                  </ProtectedRoute>
                }
              />
              {botRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute>
                      <div className="w-full bg-white mx-auto">
                        {route.element}
                      </div>
                    </ProtectedRoute>
                  }
                />
              ))}
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <Settings />
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const logedIn = useSelector(logedInSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GetBots());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <BotProvider>
        <AppLayout />
      </BotProvider>
    </BrowserRouter>
  );
}