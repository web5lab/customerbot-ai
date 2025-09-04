import { Link, useLocation } from 'react-router-dom';
import { useBot } from '../contexts/BotContext';
import {
  Grid,
  LayoutDashboard,
  Brain,
  MessageSquare,
  Settings,
  Plug,
  CreditCard,
  Bot,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Check,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';
import logo from "../assets/logo.png"
import { logedInSelector, userSelector, botsSelector, activeBotSelector } from '../store/global.Selctor';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { setLogout, setBotsActive } from '../store/global.Slice';

const baseNavigation = [
  { name: 'My Bots', href: '/dashboard', icon: Grid }
];

const botNavigation = [
  { name: 'Analytics', href: '/stats', icon: LayoutDashboard },
  { name: 'Chat', href: '/botchat', icon: MessageSquare },
  { name: 'Customize', href: '/preview', icon: Settings },
  { name: 'Training', href: '/training', icon: Brain },
  { name: 'Sessions', href: '/sessions', icon: MessageSquare },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Bot Settings', href: '/bot-settings', icon: Settings },
];

const settingsNavigation = [
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const logedIn = useSelector(logedInSelector);
  const user = useSelector(userSelector);
  const bots = useSelector(botsSelector);
  const activeBot = useSelector(activeBotSelector);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBotSelector, setShowBotSelector] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isSidebarOpen && !event.target.closest('.sidebar-container') && !event.target.closest('.sidebar-toggle')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  if (!logedIn) return null;

  const handleLogout = () => {
    dispatch(setLogout());
  };

  const handleBotChange = (bot) => {
    dispatch(setBotsActive(bot));
    setShowBotSelector(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const NavItem = ({ item, isActive }) => (
    <Link
      to={item.href}
      onClick={() => isMobile && setIsSidebarOpen(false)}
      className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
        ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-md'
        }`}
    >
      <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${isActive
        ? 'bg-white/20 shadow-inner'
        : 'bg-gray-200 group-hover:bg-gray-300'
        }`}>
        <item.icon className="h-4 w-4" />
      </div>
      <span className="font-medium">{item.name}</span>
      {isActive && (
        <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-75"></div>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="sidebar-toggle fixed top-4 left-4 z-50 lg:hidden p-3 bg-white/90 backdrop-blur-md border border-gray-300 rounded-xl shadow-xl hover:bg-gray-50 transition-all duration-200"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-gray-700" />
          ) : (
            <Menu className="w-5 h-5 text-gray-700" />
          )}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
      )}

      {/* Sidebar */}
      <div className={`sidebar-container fixed lg:static inset-y-0 left-0 z-40 w-80 flex flex-col transition-transform duration-300 ease-out ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        } lg:translate-x-0`}>
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 backdrop-blur-xl pt-6 pb-4 overflow-y-auto h-full relative shadow-xl">
          {/* Logo */}
          <div className="flex items-center px-6 mb-8 relative z-10">
            <div className="relative">
              <img src={logo} className="w-10 h-10 mr-4" alt="CustomerBot" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                CustomerBot
              </span>
            </div>
          </div>

          {/* Bot Selector */}
          {bots.length > 0 && (
            <div className="px-6 mb-8 relative z-50">
              <div className="relative">
                <button
                  onClick={() => setShowBotSelector(!showBotSelector)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-gray-300"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-gray-500/10 to-gray-500/10 border border-gray-300 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    {activeBot?.icon ? (
                      <img
                        src={activeBot.icon}
                        alt={activeBot.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Bot className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h2 className="text-base font-bold text-gray-900 truncate">
                      {activeBot?.name || 'Select Bot'}
                    </h2>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      {activeBot ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Active bot</span>
                        </>
                      ) : (
                        <span>Choose a bot</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showBotSelector ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showBotSelector && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                    <div className="p-3">
                      {bots.map((bot) => (
                        <button
                          key={bot._id}
                          onClick={() => handleBotChange(bot)}
                          className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${activeBot?._id === bot._id
                            ? 'bg-gradient-to-r from-gray-500/10 to-gray-500/10 border border-gray-500/30 text-gray-900'
                            : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-transparent'
                            }`}
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0">
                            {bot.icon ? (
                              <img
                                src={bot.icon}
                                alt={bot.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <Bot className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <h3 className="text-sm font-semibold truncate">{bot.name}</h3>
                            <p className="text-xs text-gray-500 truncate">
                              {bot.description || 'AI Assistant'}
                            </p>
                          </div>
                          {activeBot?._id === bot._id && (
                            <Check className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Profile Section */}
          <div className="px-6 mb-8 relative z-10">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200 backdrop-blur-sm shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-gray-500/10 to-gray-500/10 border border-gray-300 backdrop-blur-sm">
                  <img
                    src={user?.user?.profilePicture || logo}
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {user?.user?.name || 'User'}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 font-medium">
                    <Crown className="w-4 h-4" />
                    Premium Member
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Credits</span>
                  <span className="text-lg font-bold text-gray-900 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-gray-600" />
                    {user?.platform?.[0]?.remainingCredits || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-400 to-gray-500 h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-6 relative z-10">
            {/* Base Navigation */}
            <div>
              <h4 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-gray-500 to-gray-500 rounded-full"></div>
                Dashboard
              </h4>
              <div className="space-y-2">
                {baseNavigation.map((item) => (
                  <NavItem
                    key={item.name}
                    item={item}
                    isActive={location.pathname === item.href}
                  />
                ))}
              </div>
            </div>

            {/* Bot Navigation */}
            {activeBot && (
              <div>
                <h4 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-gray-500 to-gray-500 rounded-full"></div>
                  Bot Management
                </h4>
                <div className="space-y-2">
                  {botNavigation.map((item) => (
                    <NavItem
                      key={item.name}
                      item={item}
                      isActive={location.pathname === item.href}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Settings Navigation */}
            <div>
              <h4 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-gray-500 to-gray-500 rounded-full"></div>
                Account
              </h4>
              <div className="space-y-2">
                {settingsNavigation.map((item) => (
                  <NavItem
                    key={item.name}
                    item={item}
                    isActive={location.pathname === item.href}
                  />
                ))}
              </div>
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="px-4 py-6 mt-2 border-t border-gray-200 relative z-10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg mr-3 bg-gray-200 group-hover:bg-gray-300 transition-all duration-200">
                <LogOut className="h-4 w-4" />
              </div>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}