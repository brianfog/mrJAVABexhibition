import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useContext } from 'react';
import { useProfile, useLogout } from '../../hooks/useAuth';
import { useChatList } from '../../hooks/useChat';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import AccountModal from '../AccountModal/AccountModal';
import './Sidebar.css';
import context_catch from '../../configureContext';
import IsWrongModal from '../IsWrongModal/ISWrong';

const Sidebar = ({
  isCollapsed,
  onToggle,
  isMobile = false,
  isMobileOpen = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useProfile();
  const logoutMutation = useLogout();
  const { scrollToTop } = useScrollToTop();
  const { isAccountModalOpen, setIsAccountModalOpen, setModalVIP, ModalVIP ,ISWrongModalOPen, SetISWrongOpen } = useContext(context_catch);
  const isNavigatingToPlansRef = useRef(false);

  const { data: chatList } = useChatList();

  const chatListItems = chatList?.chats?.map((chat) => ({
    icon: 'icons/sparkle.svg',
    text: chat.title,
    path: `/chat/${chat.id}`,
    chatId: chat.id,
    active:
      location.pathname === `/chat/${chat.id}` || location.pathname === '/chat',
  }));

  const VIPScores = {
    'مسابقه': Number(user?.vipcredit?.challenge),
    'آموزش تصویری': Number(user?.vipcredit?.visual),
  };

  const LockedFeatures = ['مسابقه'];

  const VIPFeatures = ['مسابقه', 'آموزش تصویری'];

  const navItems = {
    'منو اصلی': [
      {
        icon: 'icons/problem-solver.svg',
        text: 'حل مسائل',
        path: '/problem-solver',
        active:
          location.pathname === '/problem-solver' || location.pathname === '/',
      },
      {
        icon: 'icons/pdf-helper.svg',
        text: 'همیار مقاله / PDF',
        path: '/pdf-helper',
        active: location.pathname === '/pdf-helper',
      },
      {
        icon: 'icons/quiz-maker.svg',
        text: 'طراحی نمونه سوال',
        path: '/quiz-maker',
        active: location.pathname === '/quiz-maker',
      },
      {
        icon: 'icons/book-chat.svg',
        text: 'چت با کتاب',
        path: '/book-chat',
        active: location.pathname === '/book-chat',
      },
      {
        icon: 'icons/summarizer.svg',
        text: 'خلاصه سازی',
        path: '/summarizer',
        active: location.pathname === '/summarizer',
      },
      {
        icon: 'icons/Vis-learning.svg',
        text: 'آموزش تصویری',
        path: '/visual-learning',
        active: location.pathname === '/visual-learning',
      },
      {
        icon: 'icons/timer.svg',
        text: 'مسابقه',
        path: '/challenge',
        active: location.pathname === '/challenge'
      }
    ],
    گفتگوها: chatListItems,
  };

  const handleBuyCredit = (VIP) => {
    scrollToTop();
    VIP ? navigate('/vip') : navigate('/plans');
    if (isMobile) {
      onToggle();
    }
  };

  return (
    <>
      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile-sidebar' : ''
          } ${isMobile && isMobileOpen ? 'mobile-sidebar-open' : ''}`}
      >
        <div className="sidebar-header">
          <div
            className="logo-container"
            onClick={() => {
              scrollToTop();
              navigate('/');
            }}
          >
            <img
              src="/images/logo.svg"
              alt="MRJAVAB Logo"
              className="logo-img"
            />
            <h2 className="logo-text">MRJAVAB</h2>
          </div>
          <button
            className="sidebar-toggle"
            id="sidebarToggle"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            <img
              src="/icons/arrow-square-left.svg"
              alt="Toggle sidebar"
              className="toggle-icon"
            />
          </button>
        </div>
        <nav className="sidebar-nav">
          {Object.entries(navItems).map(([category, items]) => (
            <div
              key={category}
              className={`nav-category ${category === 'گفتگوها' ? 'chats-category' : ''}`}
            >
              <span className="category-title">{category}</span>
              <div
                className={`nav-items-group ${category === 'گفتگوها' ? 'chats-items-group' : ''}`}
              >
                {items?.map((item, index) => {
                  const handleItemClick = (e) => {
                    const canAccessLockedOptions = Number(user?.type) === 1 || Number(user?.type) === 2;
                    const canAccessVIPOptions = {
                      'مسابقه': Number(user?.vipcredit?.challenge) > 0,
                      'آموزش تصویری': Number(user?.vipcredit?.visual) > 0,
                    };



                    if ((item.text === 'همیار مقاله / PDF') && !canAccessLockedOptions) {
                      e.preventDefault();
                      setIsAccountModalOpen(true);
                      if (isMobile) {
                        onToggle();
                      }
                      return;
                    }

                    if (!canAccessVIPOptions[item.text] && VIPFeatures.includes(item.text)) {
                      e.preventDefault();
                      setIsAccountModalOpen(true);
                      setModalVIP(true);
                      if (isMobile) {
                        onToggle();
                      }
                      return;
                    }

                    scrollToTop();

                    // Store questionType in localStorage when navigating from sidebar
                    const pathToQuestionTypeMap = {
                      '/': 'problem-solver',
                      '/problem-solver': 'problem-solver',
                      '/pdf-helper': 'pdf-helper',
                      '/quiz-maker': 'quiz-maker',
                      '/book-chat': 'book-chat',
                      '/summarizer': 'summarizer',
                      '/visual-learning': 'visual-learning',
                      '/challenge': 'challenge',
                    };
                    const questionTypeForPath =
                      pathToQuestionTypeMap[item.path];
                    if (questionTypeForPath) {
                      localStorage.setItem(
                        'selectedQuestionType',
                        questionTypeForPath
                      );
                    }

                    if (category === 'گفتگوها' && item.chatId) {
                      e.preventDefault();
                      navigate(`/chat/${item.chatId}`);
                    }
                    if (isMobile) {
                      onToggle();
                    }
                  };

                  return (
                    <Link
                      key={index}
                      to={item.path}
                      className={`nav-item ${item.active ? 'active' : ''}`}
                      onClick={handleItemClick}
                    >
                      <img
                        src={`/${item.icon}`}
                        alt={item.text}
                        className="nav-icon"
                      />
                      <span className="nav-text">{item.text}</span>
                      {VIPFeatures.includes(item.text) && (<span style={{position:'absolute',left: '20px'}}>{VIPScores[item.text] || 0}</span>)}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <img
              src="/icons/user.svg"
              alt="User Avatar"
              className="user-avatar"
            />
            <div className="user-details">
              {user ? (
                <>
                  <p className="user-name">{user.name}</p>
                  <p className="user-email">{user.email}</p>
                  <p
                    className="user-email logout-text"
                    onClick={(e) => {
                      e.stopPropagation();
                      logoutMutation.mutate();
                    }}
                  >
                    خروج
                  </p>
                </>
              ) : (
                <div
                  onClick={() => {
                    scrollToTop();
                    navigate('/login');
                  }}
                >
                  <p className="user-name">ورود | ثبت نام</p>
                </div>
              )}
            </div>
          </div>
          <div className='credit-box-container'>
            <div className="buy-credit-container" onClick={() => handleBuyCredit(false)}>
              <div className="credit-number">{user?.credit ?? ''}</div>
              <span className="credit-text">اعتبار</span>
              <img
                src="/icons/angle-left.svg"
                alt="arrow"
                className="credit-arrow"
              />
            </div>
            <div className="buy-credit-container" onClick={() => handleBuyCredit(true)}>
              <div className="credit-number">{(user?.vipcredit?.visual + user?.vipcredit?.challenge) || ''}</div>
              <span className="credit-text">VIP</span>
              <img
                src="/icons/angle-left.svg"
                alt="arrow"
                className="credit-arrow"
              />
            </div>
          </div>
        </div>
      </aside>

      {isAccountModalOpen ? (
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => {
            setIsAccountModalOpen(false);
            setModalVIP(false);
            // Don't navigate to homepage if we're navigating to plans or already on plans page
            if (
              !isNavigatingToPlansRef.current &&
              (location.pathname !== '/plans' || '/vip')
            ) {
              scrollToTop();
              navigate('/');
            }
            // Reset the flag after a short delay
            setTimeout(() => {
              isNavigatingToPlansRef.current = false;
            }, 100);
          }}
          onNavigateToPlans={() => {
            isNavigatingToPlansRef.current = true;
          }}
          VIPModal={ModalVIP}
        />
      ) : null}
      <IsWrongModal isOPen={ISWrongModalOPen} onClose={() => SetISWrongOpen(false)}/>
    </>
  );
};

export default Sidebar;
