import { useState, useEffect, use} from 'react';
import context_catch from './configureContext';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { chatKeys } from './hooks/useChat';
import { chatService } from './services/chatService';
import { getToken } from './services/api';
import { useScrollToTop } from './hooks/useScrollToTop';
import './styles/index.css';

// Global Components
import Sidebar from './components/Sidebar/Sidebar';
import MobileHeader from './components/Header/MobileHeader';
import Footer from './components/Footer/Footer';

// Pages
import Home from './pages/Home';
import Plans from './pages/Plans';
import PdfHelper from './pages/PdfHelper';
import QuizMaker from './pages/QuizMaker';
import BookChat from './pages/BookChat';
import Summarizer from './pages/Summarizer';
import FunctionsList from './pages/FunctionsList';
import Login from './pages/Login';
import Chat from './pages/Chat';
import PaymentResult from './pages/PaymentResult';
import Learning from './pages/Learning';
import VIPlans from './pages/VIPlans';
import Challenge from './pages/Challenge';

function AppContent() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const isLoginPage = location.pathname === '/login';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useScrollToTop();

  // Prefetch prompts and offers on app load if user is authenticated
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Prefetch prompts
      queryClient.prefetchQuery({
        queryKey: chatKeys.prompts(),
        queryFn: () => chatService.getPrompts(),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      // Prefetch offers
    }

    queryClient.prefetchQuery({
      queryKey: chatKeys.offers(),
      queryFn: () => chatService.getOffers(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Close mobile sidebar when resizing to desktop
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isDesktop && isMobileSidebarOpen) {
        const sidebar = document.querySelector('.sidebar');
        const hamburgerMenu = document.getElementById('hamburgerMenu');

        if (
          sidebar &&
          !sidebar.contains(event.target) &&
          hamburgerMenu &&
          !hamburgerMenu.contains(event.target)
        ) {
          setIsMobileSidebarOpen(false);
        }
      }
    };

    if (isMobileSidebarOpen && !isDesktop) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMobileSidebarOpen, isDesktop]);

  // Handle sidebar collapse and main content margin
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent && isDesktop) {
      if (isSidebarCollapsed) {
        mainContent.style.marginRight = '60px';
      } else {
        mainContent.style.marginRight = '280px';
      }
    } else if (mainContent) {
      mainContent.style.marginRight = '0';
    }
  }, [isSidebarCollapsed, isDesktop]);

  return (
    <div className="App" dir="rtl" lang="fa">
      {/* Global Header - Mobile only */}
      {!isDesktop && !isLoginPage && (
        <MobileHeader
          onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
      )}

      {/* Mobile Overlay */}
      {!isDesktop && !isLoginPage && (
        <div
          className={`mobile-sidebar-overlay ${isMobileSidebarOpen ? 'overlay-visible' : ''
            }`}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Global Sidebar - Desktop and Mobile */}
      {!isLoginPage && (
        <Sidebar
          isCollapsed={isDesktop ? isSidebarCollapsed : false}
          onToggle={
            isDesktop
              ? () => setIsSidebarCollapsed(!isSidebarCollapsed)
              : () => setIsMobileSidebarOpen(false)
          }
          isMobile={!isDesktop}
          isMobileOpen={isMobileSidebarOpen}
        />
      )}

      {/* Main Content */}
      <main className={`main-content ${isLoginPage ? 'login-page-main' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/vip" element={<VIPlans/>} />
          <Route path="/problem-solver" element={<Home />} />
          <Route path="/pdf-helper" element={<PdfHelper />} />
          <Route path="/quiz-maker" element={<QuizMaker />} />
          <Route path="/book-chat" element={<BookChat />} />
          <Route path="/summarizer" element={<Summarizer />} />
          <Route path="/visual-learning" element={<Learning/>}/>
          <Route path='/challenge' element={<Challenge/>}/>
          <Route path="/functions-list" element={<FunctionsList />} />
          <Route path="/payment/:status" element={<PaymentResult />} />
          <Route path="/payment/callback" element={<PaymentResult />} />
        </Routes>

        {/* Global Footer */}
        {!isLoginPage && <Footer />}
      </main>
    </div>
  );
}


function App() {


  

  const [spacediv, setspace] = useState(false);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const [ModalVIP , setModalVIP] = useState(false);

  const [ISWrongModalOPen,SetISWrongOpen] = useState(false);

  const [WrongAnswer,SetWrongAnswer] = useState(null);

  const [Global_ChatID, SetGlobalChatID] = useState(null);

  const [Global_UserScore,SetGlobal_UserScore] = useState(0);

  return (

    <context_catch.Provider 
    value={{ Global_ChatID,SetGlobalChatID,spacediv, setspace,
    isAccountModalOpen, setIsAccountModalOpen, ModalVIP,
    setModalVIP,ISWrongModalOPen,SetISWrongOpen
    ,SetWrongAnswer,WrongAnswer,
    Global_UserScore,SetGlobal_UserScore }}
    >
      <Router>
        <AppContent />
      </Router>
    </context_catch.Provider>

  );
}

export default App;
