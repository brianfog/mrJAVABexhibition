import { useState, useRef, useEffect, useMemo, useContext} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useProfile } from '../../hooks/useAuth';
import { useSendMessage, usePrompts } from '../../hooks/useChat';
import {
  getChatToken,
  getChatTokenFromUser,
  getToken,
  setChatToken,
} from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import './ChatInput.css';
import { answerModeOptions, questionTypeOptions } from './constants';
import AccountModal from '../AccountModal/AccountModal';
import doc_ico from './doc_ic.png';
import context_catch from '../../configureContext';

const pathToQuestionType = {
  '/': 'problem-solver',
  '/problem-solver': 'problem-solver',
  '/pdf-helper': 'pdf-helper',
  '/quiz-maker': 'quiz-maker',
  '/book-chat': 'book-chat',
  '/summarizer': 'summarizer',
};

const questionTypeToPath = {
  'problem-solver': '/problem-solver',
  'pdf-helper': '/pdf-helper',
  'quiz-maker': '/quiz-maker',
  'book-chat': '/book-chat',
  summarizer: '/summarizer',
};

const ChatInput = ({
  disabled = false,
  chatId = chatId,
  previousMsg,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useProfile();
  const sendMessageMutation = useSendMessage();
  const {
    data: prompts,
    isLoading: promptsLoading,
    isSuccess: promptsSuccess,
  } = usePrompts();
  const { showToast } = useToast();
  const [question, setQuestion] = useState('');
  const [answerMode, setAnswerMode] = useState('quick');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  useEffect(() => {
    const pendingOfferValue = localStorage.getItem('pendingOfferValue');
    if (pendingOfferValue) {
      setQuestion(pendingOfferValue);
      localStorage.removeItem('pendingOfferValue');
    }

    // Restore questionType from localStorage if exists
    const savedQuestionType = localStorage.getItem('selectedQuestionType');
    if (savedQuestionType) {
      setManualQuestionType(savedQuestionType);
    }

    const handleOfferSelected = (event) => {
      if (event.detail?.value) {
        setQuestion(event.detail.value);
      }
    };

    window.addEventListener('offerSelected', handleOfferSelected);

    return () => {
      window.removeEventListener('offerSelected', handleOfferSelected);
    };
  }, []);

  const pathBasedQuestionType = useMemo(() => {
    return pathToQuestionType[location.pathname] || 'problem-solver';
  }, [location.pathname]);

  const [manualQuestionType, setManualQuestionType] = useState(null);
  const questionType = manualQuestionType || pathBasedQuestionType;
  const getCurrentQuestionTypeLabel = () => {
    const option = questionTypeOptions.find(
      (opt) => opt.value === questionType
    );
    return option ? option.label : 'حل مسائل';
  };
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] =
    useState(false);
  const [showAnswerModeSelector, setShowAnswerModeSelector] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const problemBtnRef = useRef(null);
  const quickBtnRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.max(textarea.scrollHeight, 58);
      textarea.style.height = `${Math.min(newHeight, 120)}px`;
    }
  }, [question]);

  // Track container height and dispatch event for offers section adjustment
  useEffect(() => {
    const container = containerRef.current;
    const baseHeight = 154.8; // Base height when not expanded

    if (container && window.ResizeObserver) {
      const updateOffersPadding = () => {
        const containerHeight = container.offsetHeight;
        const heightDifference = Math.max(0, containerHeight - baseHeight);

        // Dispatch custom event with height difference
        window.dispatchEvent(
          new CustomEvent('chatInputHeightChange', {
            detail: { heightDifference },
          })
        );
      };

      // Initial call
      updateOffersPadding();

      const resizeObserver = new ResizeObserver(updateOffersPadding);
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [question, uploadedFiles]);

  useClickOutside({
    refs: [problemBtnRef, '.chat-input-question-type-dropdown'],
    handler: () => {
      if (showQuestionTypeSelector) {
        setShowQuestionTypeSelector(false);
      }
    },
    enabled: showQuestionTypeSelector,
  });

  useClickOutside({
    refs: [quickBtnRef, '.chat-input-answer-mode-dropdown'],
    handler: () => {
      if (showAnswerModeSelector) {
        setShowAnswerModeSelector(false);
      }
    },
    enabled: showAnswerModeSelector,
  });

  const MAX_FILE_SIZE =
    user?.type === 1
      ? 8 * 1024 * 1024
      : user?.type === 2
        ? 10 * 1024 * 1024
        : 6 * 1024 * 1024;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    const invalidFile = files.find(file => file.size > MAX_FILE_SIZE);

    if (invalidFile) {
      alert(
        `حجم فایل "${invalidFile.name}" نباید بیشتر از ${MAX_FILE_SIZE / (1024 * 1024)} مگابایت باشد.`
      );
      e.target.value = "";
      return;
    }

    setUploadedFiles(prev => [...prev, ...files]);
    e.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const isHTML = (str) => {
    if (!str || typeof str !== 'string') return false;
    const htmlRegex = /<\/?[a-z][\s\S]*>/i;
    return htmlRegex.test(str);
  };
  const canAccessLockedOptions = Number(user?.type) === 1 || Number(user?.type) === 2;

  const extractResponseText = (response) => {
    try {
      let text = '';

      // Support axios responses (response.data) and direct responses
      const data = response?.data ?? response;

      // Gemini candidates response
      if (data?.candidates?.length) {
        text = data.candidates[0]?.content?.parts
          ?.map(part => part?.text || '')
          .join('');
      }

      // Fallbacks
      if (!text && typeof data?.text === 'string') {
        text = data.text;
      }

      if (!text && typeof data?.content === 'string') {
        text = data.content;
      }

      // Ensure string
      text = String(text || '');

      return text;
    } catch (error) {
      console.error('Error extracting response text:', error);
      return '';
    }
  };

  const pendingSubmissionRef = useRef(null);
  const hasSentPendingRef = useRef(false);

  const resolveChatToken = () => {
    const chatToken = getChatToken() || getChatTokenFromUser(user);

    if (chatToken && !getChatToken()) {
      setChatToken(chatToken);
    }

    return chatToken;
  };

  useEffect(() => {
    const pendingSubmission = location.state?.pendingSubmission;
    if (pendingSubmission) {
      pendingSubmissionRef.current = pendingSubmission;
    }
  }, [location.state?.pendingSubmission]);

  useEffect(() => {
    const pendingSubmission = pendingSubmissionRef.current;
    const token = getToken();
    const isChatPage =
      location.pathname === '/chat' || location.pathname.startsWith('/chat/');

    // Wait for prompts to be loaded before sending the message
    const canSendMessage =
      pendingSubmission &&
      !user &&
      !token &&
      isChatPage &&
      !hasSentPendingRef.current &&
      !promptsLoading &&
      promptsSuccess &&
      prompts;

    if (canSendMessage) {
      hasSentPendingRef.current = true;

      const sendPendingMessage = async () => {
        try {
          const currentChatId = location.pathname.startsWith('/chat/')
            ? chatId
            : null;

          if (onSubmit) {
            onSubmit({
              text: pendingSubmission.text,
              files: pendingSubmission.files || [],
              sender: 'user',
            });
            onSubmit({
              isLoading: true,
            });
          }

          // Get questionType from pendingSubmission or restore from localStorage or use current
          const savedQuestionType = localStorage.getItem(
            'selectedQuestionType'
          );
          const finalQuestionType =
            pendingSubmission.questionType || savedQuestionType || questionType;

          // Restore manualQuestionType if it was saved and different from path-based
          if (
            finalQuestionType &&
            finalQuestionType !== pathBasedQuestionType
          ) {
            setManualQuestionType(finalQuestionType);
          }

          const chatToken = resolveChatToken();

          const response = await sendMessageMutation.mutateAsync({
            userText: pendingSubmission.text,
            questionType: finalQuestionType,
            answerMode: pendingSubmission.answerMode || 'quick',
            chatId: currentChatId,
            files: pendingSubmission.files || [],
            prompts: prompts,
            chatToken,
          });

          // Clear saved questionType after successful send
          if (savedQuestionType) {
            localStorage.removeItem('selectedQuestionType');
          }

          const responseText = extractResponseText(response);

          // Always call onSubmit to remove loading state
          if (onSubmit) {
            if (responseText) {
              onSubmit({
                text: responseText,
                sender: 'model',
                isHTML: isHTML(responseText),
              });
            } else {
              // Remove loading state by submitting a message that will trigger the else block in handleChatSubmit
              // This filters out loading messages even if responseText is empty
              onSubmit({
                text: 'پاسخ دریافت شد.',
                sender: 'model',
                isError: false,
              });
              console.warn(
                'Response received but no text extracted. Response structure:',
                response
              );
            }
          }

          pendingSubmissionRef.current = null;
          navigate(location.pathname, { replace: true, state: {} });
        } catch (error) {
          console.error('Error sending pending message:', error);

          if (error.status === 403) {
            const errorMessage =
              error.data?.message || error.message || 'خطا در ارسال پیام';
            showToast(errorMessage, 'error', 7000);
          } else {
            showToast(
              'خطا در ارسال پیام. لطفا دوباره تلاش کنید.',
              'error',
              5000
            );
          }

          if (onSubmit) {
            onSubmit({
              text:
                error.status === 403
                  ? error.data?.message || error.message || 'خطا در ارسال پیام'
                  : 'خطا در ارسال پیام. لطفا دوباره تلاش کنید.',
              sender: 'model',
              isError: true,
            });
          }

          pendingSubmissionRef.current = null;
          hasSentPendingRef.current = true;
          // If not on a specific chat (/chat/:id), go back to home instead of staying on /chat
          if (!chatId) {
            navigate('/', { replace: true });
          } else {
            navigate(location.pathname, { replace: true, state: {} });
          }
        }
      };

      sendPendingMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    location.pathname,
    chatId,
    prompts,
    promptsLoading,
    promptsSuccess,
    sendMessageMutation,
    onSubmit,
    navigate,
    showToast,
  ]);

  const handleSendMessage = async (formData) => {
    try {
      const currentChatId = location.pathname.startsWith('/chat/')
        ? chatId
        : null;

      if (onSubmit) {
        onSubmit({
          text: formData.text,
          files: formData.files || [],
          sender: 'user',
        });

        // Clear input immediately when user message is displayed
        setQuestion('');
        setUploadedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        onSubmit({
          isLoading: true,
        });
      }

      const chatToken = resolveChatToken();

      const response = await sendMessageMutation.mutateAsync({
        userText: formData.text,
        questionType: formData.questionType,
        answerMode: formData.answerMode,
        chatId: currentChatId,
        files: formData.files || [],
        prompts: prompts,
        chatToken,
        previousMessages : previousMsg
      });

      const responseText = extractResponseText(response);

      // Always call onSubmit to remove loading state
      if (onSubmit) {
        if (responseText) {
          onSubmit({
            text: responseText,
            sender: 'model',
            isHTML: isHTML(responseText),
          });
        } else {
          // Remove loading state by submitting a message that will trigger the else block in handleChatSubmit
          // This filters out loading messages even if responseText is empty
          onSubmit({
            text: 'پاسخ دریافت شد.',
            sender: 'model',
            isError: false,
          });
          console.warn(
            'Response received but no text extracted. Response structure:',
            response
          );
        }
      }

      // Only navigate to /chat if we're not already on a chat page
      // If we're on /chat/:chatId, stay there to continue the conversation
      if (!location.pathname.startsWith('/chat')) {
        navigate('/chat', { replace: true });
      }
    } catch (error) {
      console.error('Error sending message:', error);

      if (error.status === 403) {
        const errorMessage =
          error.data?.message || error.message || 'خطا در ارسال پیام';
        showToast(errorMessage, 'error', 7000);
      } else {
        showToast('خطا در ارسال پیام. لطفا دوباره تلاش کنید.', 'error', 5000);
      }

      if (onSubmit) {
        onSubmit({
          text:
            error.status === 403
              ? error.data?.message || error.message || 'خطا در ارسال پیام'
              : 'خطا در ارسال پیام. لطفا دوباره تلاش کنید.',
          sender: 'model',
          isError: true,
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    /*
    if (!question.trim() && uploadedFiles.length === 0) {
      return;
    }*/


    const messageText = question.trim();
    const token = getToken();

    /*if (!token || !user) {
      // Store form data in navigation state for after login
      const formData = {
        text: messageText,
        answerMode,
        questionType,
        files: uploadedFiles,
      };

      // Navigate to login with pending submission, redirect to general chat page after login
      navigate('/login', {
        state: {
          pendingSubmission: formData,
          returnPath: '/chat', // Always redirect to general chat page
        },
      });
      return;
    }

    // If user is logged in but not on chat page, redirect to chat page with the text
    if (!location.pathname.startsWith('/chat')) {
      const formData = {
        text: messageText,
        answerMode,
        questionType,
        files: uploadedFiles,
      };

      navigate('/chat', {
        state: {
          pendingSubmission: formData,
        },
      });
      return;
    }
    */
    const formData = {
      text: messageText,
      answerMode,
      questionType,
      files: uploadedFiles,
    };

    await handleSendMessage(formData);
  };

  const canSubmit = question.trim() || uploadedFiles.length > 0;

  const { setspace } = useContext(context_catch);

  return (
    <div ref={containerRef} className="chat-input-container">
      <div className="chat-input-inner">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="chat-input-selectors-section chat-input-mobile-selectors">
            <div className="chat-input-problem-btn-wrapper">
              <button
                ref={problemBtnRef}
                type="button"
                onClick={() =>
                  setShowQuestionTypeSelector(!showQuestionTypeSelector)
                }
                className="chat-input-problem-btn"
                disabled={disabled}
                aria-label="حل مسئله"
              >
                <span>{getCurrentQuestionTypeLabel()}</span>
                <img src="/icons/angle-left.svg" alt="" />
              </button>
              {showQuestionTypeSelector && (
                <div className="chat-input-question-type-dropdown">
                  {questionTypeOptions.map((option) => {
                    const handleOptionClick = () => {
                      if (option.locked && !canAccessLockedOptions) {
                        setIsAccountModalOpen(true);
                        navigate('/plans');

                        return;

                      }
                      setManualQuestionType(option.value);
                      setShowQuestionTypeSelector(false);

                      const route = questionTypeToPath[option.value];
                      if (route) {
                        navigate(route);
                      }

                    };

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={false}
                        onClick={() => handleOptionClick()}
                        className={`${questionType === option.value ? 'active' : ''} ${option.locked && !canAccessLockedOptions ? 'locked' : ''}`}
                      >
                        {option.label}
                        {option.locked && !canAccessLockedOptions && (
                          <img
                            src="/icons/lock.svg"
                            alt="قفل"
                            className="chat-input-dropdown-lock-icon"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="chat-input-quick-btn-wrapper">
              <button
                ref={quickBtnRef}
                type="button"
                onClick={() =>
                  setShowAnswerModeSelector(!showAnswerModeSelector)
                }
                className="chat-input-quick-btn"
                disabled={disabled}
                aria-label="پاسخگویی سریع"
              >
                <span>پاسخگویی سریع</span>
                <img src="/icons/angle-left.svg" alt="" />
              </button>

              {showAnswerModeSelector && (
                <div className="chat-input-answer-mode-dropdown">
                  {answerModeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (!option.locked || canAccessLockedOptions) {
                          setAnswerMode(option.value);
                          setShowAnswerModeSelector(false);
                        }
                      }}
                      className={`${answerMode === option.value ? 'active' : ''} ${option.locked && !canAccessLockedOptions ? 'locked' : ''}`}
                    >
                      <div className="chat-input-answer-mode-content">
                        <div className="chat-input-answer-mode-title">
                          {option.title}
                          {option.locked && !canAccessLockedOptions && (
                            <img
                              src="/icons/lock.svg"
                              alt="قفل"
                              className="chat-input-dropdown-lock-icon"
                            />
                          )}
                        </div>
                        <div className="chat-input-answer-mode-description">
                          {option.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="سوالتو بپرس ..."
            className="chat-input-textarea"
            rows="1"
            disabled={disabled}
            aria-label="متن سوال"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSubmit) {
                  handleSubmit(e);
                }
              }
            }}
          />

          {uploadedFiles.length == 0 && setspace(false)}

          {uploadedFiles.length > 0 && (
            <div className="chat-input-files-container">
              {uploadedFiles.map((file, index) => {

                const UEL = URL.createObjectURL(file);

                setspace(true);

                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="chat-input-file-info"
                  >

                    <button type='button' onClick={() => { window.open(UEL).focus() }} className='Preview-IFrame-btn'>
                      {"نمایش"}
                      <span> {file.type.startsWith("image/") ? "عکس" : "فایل"}</span>
                    </button>

                    <div className='chat-input-file-vis'>
                      {
                        (<img src={file.type.startsWith('image/') ? UEL : doc_ico} style={{background: file.type.startsWith('image/') ? `black` : `none`}}/>)
                      }
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="chat-input-file-remove"
                      aria-label="حذف فایل"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 4L4 12M4 4L12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="chat-input-buttons-section">
            <div className="chat-input-right-buttons chat-input-desktop-selectors">
              <div className="chat-input-problem-btn-wrapper">
                <button
                  ref={problemBtnRef}
                  type="button"
                  onClick={() =>
                    setShowQuestionTypeSelector(!showQuestionTypeSelector)
                  }
                  className="chat-input-problem-btn"
                  disabled={disabled}
                  aria-label="حل مسئله"
                >
                  <span>{getCurrentQuestionTypeLabel()}</span>
                  <img src="/icons/angle-left.svg" alt="" />
                </button>
                {showQuestionTypeSelector && (
                  <div className="chat-input-question-type-dropdown">
                    {questionTypeOptions.map((option) => {
                      const handleOptionClick = () => {
                        if (option.locked && !canAccessLockedOptions) {
                          setIsAccountModalOpen(true);
                          navigate('/plans')
                          return;

                        }
                        setManualQuestionType(option.value);
                        // Store questionType in localStorage to persist after login
                        localStorage.setItem(
                          'selectedQuestionType',
                          option.value
                        );
                        setShowQuestionTypeSelector(false);

                        const route = questionTypeToPath[option.value];
                        if (route) {
                          navigate(route);
                        }
                      };

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={handleOptionClick}
                          className={`${questionType === option.value ? 'active' : ''} ${option.locked && !canAccessLockedOptions ? 'locked' : ''}`}
                        >
                          {option.label}
                          {option.locked && !canAccessLockedOptions && (
                            <img
                              src="/icons/lock.svg"
                              alt="قفل"
                              className="chat-input-dropdown-lock-icon"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="chat-input-quick-btn-wrapper">
                <button
                  ref={quickBtnRef}
                  type="button"
                  onClick={() =>
                    setShowAnswerModeSelector(!showAnswerModeSelector)
                  }
                  className="chat-input-quick-btn"
                  disabled={disabled}
                  aria-label="پاسخگویی سریع"
                >
                  <span>پاسخگویی سریع</span>
                  <img src="/icons/angle-left.svg" alt="" />
                </button>

                {showAnswerModeSelector && (
                  <div className="chat-input-answer-mode-dropdown">
                    {answerModeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          if (!option.locked || canAccessLockedOptions) {
                            setAnswerMode(option.value);
                            setShowAnswerModeSelector(false);
                          }
                        }}
                        className={`${answerMode === option.value ? 'active' : ''} ${option.locked && !canAccessLockedOptions ? 'locked' : ''}`}
                      >
                        <div className="chat-input-answer-mode-content">
                          <div className="chat-input-answer-mode-title">
                            {option.title}
                            {option.locked && !canAccessLockedOptions && (
                              <img
                                src="/icons/lock.svg"
                                alt="قفل"
                                className="chat-input-dropdown-lock-icon"
                              />
                            )}
                          </div>
                          <div className="chat-input-answer-mode-description">
                            {option.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleUploadClick}
                className="chat-input-camera-btn"
                disabled={disabled}
                aria-label="آپلود تصویر"
              >
                <img src="/icons/camera.svg" alt="دوربین" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleUploadClick}
              className="chat-input-camera-btn chat-input-mobile-camera"
              disabled={disabled}
              aria-label="آپلود تصویر"
            >
              <img src="/icons/camera.svg" alt="دوربین" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileChange}
              className="chat-input-file-input"
              aria-label="انتخاب فایل"
            />

            <button
              type="button"
              onClick={handleSubmit}
              className="chat-input-arrow-btn"
              disabled={disabled || !canSubmit}
              aria-label="ارسال"
            >
              <img src="/icons/arrow-up-long.svg" alt="ارسال" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
