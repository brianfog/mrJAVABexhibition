import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo, useCallback, useContext } from 'react';
import Hero from '../components/Hero/Hero';
import ChatInput from '../components/ChatInput/ChatInput';
import ChatActions from '../components/ChatActions/ChatActions';
import ChatLoading from '../components/ChatLoading/ChatLoading';
import ChartRenderer from '../components/Chart/ChartRenderer';
import { useReadChat } from '../hooks/useChat';
import './Chat.css';

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import context_catch from '../configureContext';
const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { data: chatData, isLoading, error } = useReadChat(chatId || null);
  const {SetGlobalChatID} = useContext(context_catch);
  const [messages, setMessages] = useState(() => {
    // Don't initialize with pendingSubmission here - let ChatInput handle it via onSubmit
    // This ensures loading state can be properly added without interference
    const initialMessage = location.state?.message;
    const initialFiles = location.state?.files || [];
    return initialMessage || initialFiles.length > 0
      ? [{ text: initialMessage || '', files: initialFiles, sender: 'user' }]
      : [];
  });

  // Helper function to check if content is HTML
  const isHTML = useCallback((str) => {
    if (!str || typeof str !== 'string') return false;
    const htmlRegex = /<\/?[a-z][\s\S]*>/i;
    return htmlRegex.test(str);
  }, []);

  // Helper function to extract plain text from HTML
  const extractPlainText = useCallback((html) => {
    if (!html || typeof html !== 'string') return '';

    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Get text content (this removes all HTML tags and gets plain text)
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    // Clean up extra whitespace and newlines
    return plainText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }, []);

  // Handle pending submission after login - let ChatInput handle the API call
  // Note: We don't set messages here anymore to avoid interfering with loading state
  // ChatInput will handle adding user message and loading state via onSubmit

  // Redirect to homepage on page reload (when there's no chatId and no pending submission)
  useEffect(() => {
    // Only redirect if we're on /chat (not /chat/:chatId) and it's a fresh page load
    const isReload =
      !location.state?.pendingSubmission &&
      !location.state?.message &&
      !chatId &&
      location.pathname === '/chat' &&
      messages.length === 0 &&
      !isLoading;

    if (isReload) {
      navigate('/', { replace: true });
    }
  
    if(chatId) {
      
      SetGlobalChatID(chatId);

    }

  }, [
    location.pathname,
    location.state,
    chatId,
    messages.length,
    isLoading,
    navigate,
    SetGlobalChatID
  ]);

  // Helper function to remove markdown code block markers and clean HTML
  const removeMarkdownCodeBlocks = useCallback((text) => {
    if (!text || typeof text !== 'string') return text;

    // Remove ```json ... ``` blocks (multi-line safe)
    let cleaned = text.replace(/```json[\s\S]*?```/gi, '');

    // Extract HTML content from ```html ... ``` block if present
    const htmlBlockMatch = cleaned.match(/```html\s*([\s\S]*?)\s*```/i);
    if (htmlBlockMatch) {
      cleaned = htmlBlockMatch[1];
    } else {
      // No html wrapper — strip any leftover ``` markers
      cleaned = cleaned.replace(/^```\w*\s*/i, '');
      cleaned = cleaned.replace(/\s*```$/g, '');
    }

    // Remove Tailwind CDN script tag from HTML content (we load it globally)
    cleaned = cleaned.replace(
      /<script\s+src=["']https:\/\/cdn\.tailwindcss\.com[^>]*><\/script>/gi,
      ''
    );

    // Remove any other script tags for security
    cleaned = cleaned.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    );

    return cleaned.trim();
    
  }, []);

  const removeLatex = (text) => {
    if (!text || typeof text !== 'string') return '';

    let result = text;
    const regex = /(?<![<\/])(?:\$\$(.+?)\$\$|\$(.+?)\$|\\\((.+?)\\\)|\\\[(.+?)\\\]|\\(?:frac|sqrt|begin|end|lambda|alpha|beta|gamma|approx|cdot|times|text|[A-Za-z]+)(?:\s*(?:\{[^}]*\}|\[[^\]]*\]|\([^)]+\)|\\.|[^\s\\{}[\]()])*)?)/gs;

    result = result.replace(regex, (match, g1, g2, g3, g4) => {
        const content = g1 || g2 || g3 || g4 || match;
        return `<span class="katex">${content}</span>`;
    });

    // --- تابع بازگشتی برای frac ---
    const renderFrac = (str) => {
        // --- نرمال‌سازی حالت‌های مختلف \frac ---
        str = str
            // حالت کامل: \frac{a}{b}
            // حالت ترکیبی: \frac(a)(b) یا \frac{a}(b) یا \frac(a){b}یا \frac{(a)(c)}(b)
            .replace(/\\frac\{(\([^)]+\)\([^)]+\))\}\(([^()]+)\)/g, '\\frac{$1}{$2}')
            .replace(/\\frac\(([^()]+)\)\(([^()]+)\)/g, '\\frac{$1}{$2}')
            .replace(/\\frac\{([^{}]+)\}\(([^()]+)\)/g, '\\frac{$1}{$2}')
            .replace(/\\frac\(([^()]+)\)\{([^{}]+)\}/g, '\\frac{$1}{$2}')

            // حالت بدون {}
            .replace(/\\frac\s+([A-Za-z0-9]+)\s+([A-Za-z0-9]+)/g, '\\frac{$1}{$2}')
            .replace(/\\frac([A-Za-z0-9]+)\s*([A-Za-z0-9]+)/g, '\\frac{$1}{$2}')
            // حالت یک‌عبارتی مثل \fracX → \frac{1}{X}
            .replace(/\\frac([A-Za-z0-9]+)/g, '\\frac{1}{$1}');

        // --- تبدیل نهایی به HTML ---
        return str.replace(/\\?frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g,
            (_, num, den) => {
                return `<span class="inline-flex flex-col items-center justify-center align-middle equation">
                        <span class="border-b border-black px-1">${renderFrac(num)}</span>
                        <span class="px-1">${renderFrac(den)}</span>
                    </span>`;
            });
    };
    result = renderFrac(result);


    // --- نمادهای یونانی کامل ---
    const greekSymbols = {
        "\\alpha": "α",
        "\\beta": "β",
        "\\gamma": "γ",
        "\\delta": "δ",
        "\\epsilon": "ε",
        "\\varepsilon": "ϵ",
        "\\zeta": "ζ",
        "\\eta": "η",
        "\\theta": "θ",
        "\\vartheta": "ϑ",
        "\\iota": "ι",
        "\\kappa": "κ",
        "\\lambda": "λ",
        "\\mu": "μ",
        "\\nu": "ν",
        "\\xi": "ξ",
        "\\omicron": "ο",
        "\\pi": "π",
        "\\varpi": "ϖ",
        "\\rho": "ρ",
        "\\varrho": "ϱ",
        "\\sigma": "σ",
        "\\varsigma": "ς",
        "\\tau": "τ",
        "\\upsilon": "υ",
        "\\phi": "φ",
        "\\varphi": "ϕ",
        "\\chi": "χ",
        "\\psi": "ψ",
        "\\omega": "ω",
        // --- حروف بزرگ ---
        "\\Gamma": "Γ",
        "\\Delta": "Δ",
        "\\Theta": "Θ",
        "\\Lambda": "Λ",
        "\\Xi": "Ξ",
        "\\Pi": "Π",
        "\\Sigma": "Σ",
        "\\Upsilon": "Υ",
        "\\Phi": "Φ",
        "\\Psi": "Ψ",
        "\\Omega": "Ω"
    };

    // جایگزینی همه‌ی نمادهای یونانی در متن
    for (const [key, value] of Object.entries(greekSymbols)) {
        result = result.replace(new RegExp(key, "g"), value);
    }

    // --- پرانتزها و فاصله‌ها ---
    result = result.replace(/\\left|\\right|\\quad|\\text/g, " ");
    result = result.replace(/{و}/g, " و ");

    // دایره‌ها و چرخه‌ها
    result = result.replace(/\\circ/g, "∘");   // عملگر ترکیب دایره‌ای
    result = result.replace(/\\bigcirc/g, "○"); // دایره بزرگ‌تر
    result = result.replace(/\\odot/g, "⊙");    // دایره با نقطه
    result = result.replace(/\\oplus/g, "⊕");   // جمع مستقیم
    result = result.replace(/\\otimes/g, "⊗");  // ضرب تانسوری
    result = result.replace(/\\ominus/g, "⊖");  // تفریق دایره‌ای
    result = result.replace(/\\oslash/g, "⊘");  // تقسیم دایره‌ای
    result = result.replace(/\\bullet/g, "•");  // گلوله (دایره پر)
    result = result.replace(/\\circle/g, "○");  // دایره خالی
    result = result.replace(/\\cycle/g, "⟳");   // نماد چرخه
    result = result.replace(/\\cric/g, "∘");

    // --- براکت‌ها ---
    result = result.replace(/\\lfloor/g, "⌊")
        .replace(/\\rfloor/g, "⌋")
        .replace(/\\lceil/g, "⌈")
        .replace(/\\rceil/g, "⌉");

    // --- مجموعه اعداد ---
    result = result.replace(/\\mathbb{Z}/g, "ℤ")
        .replace(/\\mathbb{R}/g, "ℝ")
        .replace(/\\mathbb{N}/g, "ℕ");



    // --- فضای نازک برای \, \: \; ---
    result = result.replace(/\\,/g, "\u2009")
        .replace(/\\:/g, "\u2009")
        .replace(/cdot/g, ".")
        .replace(/\\;/g, "\u2009");

    // --- تبدیل \times به × (اگر هنوز تبدیل نشده) ---
    result = result.replace(/\\times/g, "×");

    // --- تبدیل مواردی مثل "\times 10-3" -> "× 10<sup>-3</sup>" ---
    result = result.replace(/\\times\s*10-([0-9]+)/g, "× 10<sup>-$1</sup>");
    result = result.replace(/×\s*10-([0-9]+)/g, "× 10<sup>-$1</sup>");

    // --- تبدیل "10-3" (بدون فاصله اطراف '-') به نمایه توان (نک: 30 - 10 با فاصله را تغییر نمی‌دهد) ---
    result = result.replace(/\b10-([0-9]+)\b/g, "10<sup>-$1</sup>");

    // --- اگر کسی `{m}3` نوشته (یعنی آکولاد واحد بلافاصله دنبال‌شده با رقم) -> m<sup>3</sup> ---
    result = result.replace(/\{([A-Za-z%\/]+)\}([0-9]+)/g, "$1<sup>$2</sup>");

    // --- تابع بازگشتی برای sqrt ---
    const renderSqrt = (str) => {
        return str.replace(/sqrt\{((?:[^{}]|\{[^{}]*\})*)\}/g,
            (_, inner) => `√<span style="text-decoration:overline">${renderSqrt(inner)}</span>`);
    };
    result = renderSqrt(result);
    result = result.replace(/sqrt\(([^()]*)\)/g, (_, inner) => `√<span style="text-decoration:overline">${inner}</span>`);
    result = result.replace(/sqrt/g, "√");

    // --- overline ---
    result = result.replace(/\\overline\{([^}]*)\}/g,
        (_, content) => `<span style="text-decoration:overline">${content}</span>`);

    // --- اندیس و توان ---
    result = result.replace(/_\{([^}]+)\}/g, "<sub>$1</sub>")
        .replace(/_([^\s^_{}]+)/g, "<sub>$1</sub>")
        .replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>")
        .replace(/\^([^\s^_{}]+)/g, "<sup>$1</sup>");

    // --- \text{...} حفظ محتوا ---
    result = result.replace(/\\text\{([^}]*)\}/g, "$1");

    // --- عملگرها و علائم ---
    const symbols = {
        "\\le": "≤",
        "\\propto": "∝",
        "\\ge": "≥",
        "\\neq": "≠",
        "\\pm": "±",
        "\\infty": "∞",
        "\\cdot": "·",
        "\\approx": "≈",
        "\\ne": "!= ",
        "neq": "!= ",
        "\\times": "×",
        "\\in": "∈",
        "\\sum": "∑",
        "\\int": "∫",
        "\\implies": "⇒",
        "\\to": "⇒",
        "\\arrow": "⇒",
        "\\Rightarrow": "⇒",
        "\\xrightarrow": "⇒"
    };
    for (const [key, value] of Object.entries(symbols)) {
        // فقط وقتی قبل یا بعد حرف انگلیسی نیست، جایگزین شود
        const regex = new RegExp(`(?<![a-zA-Z])${key}(?![a-zA-Z])`, "g");
        result = result.replace(regex, value);
    }

    // --- توابع ریاضی ---
    result = result.replace(/\\(sin|cos|tan|log|exp|sqrt)\b/g, "$1");
    result = result.replace(/arcsin|arccos|arctan|arccot|arcsec|arccsc/g, (match) => {
        const map = {
            arcsin: "sin<sup>-1</sup>",
            arccos: "cos<sup>-1</sup>",
            arctan: "tan<sup>-1</sup>",
            arccot: "cot<sup>-1</sup>",
            arcsec: "sec<sup>-1</sup>",
            arccsc: "csc<sup>-1</sup>"
        };
        return map[match] || match;
    });

    //json
    result = result.replace(/(```json|'''json)([\s\S]*?)(```|''')/g, '');
    result = result.replace(/\{([^}]+)\}/g, "$1");

    // --- حذف پرانتزهای لاتکسی و دلارها ---
    result = result.replace(/\\\((.*?)\\\)/g, "$1")
        .replace(/\$\$(.*?)\$\$/gs, "$1")
        .replace(/\$/g, "")
        .replace(/\\/g, "")
        .replace(/\{([^}]+)\}/g, "$1");

    return result.trim();
  };

  const extractJsonFromMessage = (message) => {
    if (!message) return null;
    
    const match = message.match(/(?:```json|'''json)([\s\S]*?)(?:```|''')/);

    if (!match) return null;

    const jsonText = match[1]
      .replace(/\\n/g, "")
      .replace(/\\"/g, '"')
      .trim();

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("❌ Invalid JSON after cleanup:", jsonText, error);
      return null;
    }
  };

  // Helper function to parse content (might be JSON string for model responses)
  const parseContent = useCallback(
    (content) => {
      if (!content) return { text: '', isHTML: false };

      let finalText = '';
      let FileObj = {};
      // Try to parse as JSON first (for model responses)
      try {
        const parsed = JSON.parse(content);
        // If it's a JSON object with candidates, extract the text
        if (
          parsed.candidates &&
          parsed.candidates[0]?.content?.parts?.[0]?.text
        ) {
          finalText = parsed.candidates[0].content.parts[0].text;
        } else if (typeof parsed === 'string') {
          // If it's just a string in JSON, use it
          finalText = parsed;
        }
      } catch {
        // If parsing fails, it's likely a plain string
        finalText = content;
      }
      let datajson = extractJsonFromMessage(finalText);
      finalText = removeLatex(finalText);

      // Remove markdown code block markers
      finalText = removeMarkdownCodeBlocks(finalText);

      try{
        const parsedContent = JSON.parse(content);

        if(
          parsedContent.candidates &&
          parsedContent.candidates[0]?.content?.parts?.[0]?.inlineData
        ){
          FileObj = parsedContent.candidates[0].content.parts[0].inlineData;
        } else if (typeof parsedContent === 'string'){
          FileObj = {};
        }
      } catch {
        FileObj = {};
      }


      return {
        text: finalText,
        json: datajson,
        file: FileObj,
        isHTML: isHTML(finalText),
      };
    },
    [isHTML, removeMarkdownCodeBlocks]
  );

  // ANIMATION TYOING
  const typeWriter = (id, text, onComplete, charsPerFrame = 8) => {
    let index = 0;

    const animate = () => {
      index += charsPerFrame;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === id
            ? {
                ...msg,
                text: text.slice(0, index),
                isHTML: true,
              }
            : msg
        )
      );

      if (index < text.length) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  };
  
  // Helper function to parse JSON string to array
  const parseJsonString = useCallback((jsonString) => {
    if (!jsonString) return [];
    if (Array.isArray(jsonString)) return jsonString;

    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);



  // Transform API messages to match the local message format
  const apiMessages = useMemo(() => {
    if (!chatId || !chatData) return [];

    // The API might return messages directly or in a data property
    const apiMessagesData =
      chatData.messages || chatData.data?.messages || chatData;

    if (!Array.isArray(apiMessagesData)) return [];

    return apiMessagesData.map((msg) => {
      const content = parseContent(msg.content);
      const attachments = parseJsonString(msg.attachments);
      const files = parseJsonString(msg.files);
      const contentFiles = content.hasOwnProperty('file');
    

      return {
        id: msg.id,
        chatId: msg.chat_id,
        text: content.text,
        isHTML: content.isHTML,
        json: content.json,
        sender: msg.sender, // 'user' or 'model'
        files:
          files.length > 0 ? files : attachments.length > 0 ? attachments : contentFiles ?? [],
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
      };
    });
  }, [chatId, chatData, parseContent, parseJsonString]);

  // Merge API messages with local messages
  const allMessages = useMemo(() => {
    // If we have API messages, use them (they include all messages from the chat)
    if (apiMessages.length > 0) {
      // Merge with local messages that might not be in API yet (optimistic updates)
      const apiMessageIds = new Set(
        apiMessages.map((m) => m.id).filter(Boolean)
      );
      const newLocalMessages = messages.filter(
        (m) => !m.id || !apiMessageIds.has(m.id)
      );
      return [...apiMessages, ...newLocalMessages];
    }
    // Otherwise, use local messages (for new chats)
    return messages;
  }, [apiMessages, messages]);

  const chatInputSectionRef = useRef(null);
  const chatPageRef = useRef(null);

  // Update chat-page padding-bottom to accommodate chat-input-section height
  useEffect(() => {
    if (!chatInputSectionRef.current || !chatPageRef.current) return;

    const updatePadding = () => {
      const height = chatInputSectionRef.current.offsetHeight;
      chatPageRef.current.style.paddingBottom = `${Math.max(height + 40, 200)}px`;
    };

    // Initial update
    updatePadding();

    // Use ResizeObserver to watch for height changes
    const resizeObserver = new ResizeObserver(updatePadding);
    resizeObserver.observe(chatInputSectionRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [allMessages, isLoading, error]);

  const handleChatSubmit = (messageData) => {
    if (messageData.isLoading) {
      // Add loading message
      setMessages((prev) => [
        ...prev,
        {
          id: `loading-${Date.now()}`,
          text: '',
          sender: 'model',
          isLoading: true,
        },
      ]);
    } else if (messageData.isError) {
      // Remove loading message and add error
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          {
            text: messageData.text,
            sender: 'model',
            isError: true,
          },
        ];
      });
    } else {

      const id = `msg-${Date.now()}`;

      // اگر پیام کاربر است
      if (messageData.sender === 'user') {
        setMessages(prev => [
          ...prev,
          {
            id,
            ...messageData,
          },
        ]);
        return;
      }

      // اگر پیام مدل است
      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        {
          id,
          text: '',
          json: extractJsonFromMessage(messageData.text),
          sender: 'model',
          isHTML: false,
        },
      ]);
      const ftext = removeMarkdownCodeBlocks(removeLatex(messageData.text));

      typeWriter(id, ftext);
    }
  };

  const createFilePreview = (file) => {

    const filesType = file.type ?? file.mimeType;
    const fileSrc = file.mimeType ? file.url : URL.createObjectURL(file) ;

    if (filesType?.startsWith('image/')) {
      return (
        <img
          src={fileSrc}
          alt={file.name}
          className="chat-response-file-preview-image"
        />
      );
    } else if (filesType === 'application/pdf') {
      return (
        <div className="chat-response-file-preview-pdf">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{file.name}</span>
        </div>
      );
    }else if (filesType?.startsWith('audio/')){
      return(
        <img
        src='/icons/SoundTypeIcon.svg'
        alt={file.name}
        style={{maxWidth:'300px', maxHeight:'300px'}}
        />
      )
    }else {
      return (
        <div className="chat-response-file-preview-generic">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{file.name}</span>
        </div>
      );
    }
  };

  return (
    <div className="chat-page" ref={chatPageRef}>
      <div className="chat-hero-section">
        <Hero hideChatInput={true} />
        <div className="chat-input-section" ref={chatInputSectionRef}>
          {isLoading && chatId ? (
            <div className="chat-response-box-wrapper">
              <div className="chat-response-box">
                <div className="chat-response-box-inner">
                  <div className="chat-response-content">
                    <div className="chat-response-message model-message-bubble">
                      <ChatLoading />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            error &&
            chatId && (
              <div className="chat-response-box-wrapper">
                <div className="chat-response-box">
                  <div className="chat-response-box-inner">
                    <div className="chat-response-content">
                      <p>خطا در بارگذاری گفتگو: {error.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
          {allMessages.length > 0 && (
            <div className="chat-response-box-wrapper">
              <div className="chat-response-box">
                <div className="chat-response-box-inner">
                  {allMessages.map((message, index) => {
                    const isUser = message.sender === 'user';
                    return (
                      <div
                        key={message.id || index}
                        className={`chat-response-message-container ${
                          isUser ? 'user-message' : 'model-message'
                        }`}
                      >
                        {message.isLoading ? (
                          <div className="chat-response-message model-message-bubble">
                            <ChatLoading />
                          </div>
                        ) : message.text ? (
                          <div
                            className={`chat-response-message ${
                              isUser ? "user-message-bubble" : "model-message-bubble"
                            } ${message.isError ? "error-message" : ""}`}
                          >
                            <div className="prose prose-lg max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                              >
                                {message.text}
                              </ReactMarkdown>
                            </div>
                          </div>
                        ) : null}
                        {message?.files && message?.files?.length > 0 && (
                          <div className="chat-response-files">
                            {message?.files?.map((file, fileIndex) => (
                              <div
                                key={fileIndex}
                                className="chat-response-file-item"
                              >
                                {createFilePreview(file)}
                              </div>
                            ))}
                          </div>
                        )}

                        {message.json && (
                          <ChartRenderer data={message.json} />
                        )}
                        {/* Action buttons and icons for model messages */}
                        {!isUser && !message.isLoading && message.text && (
                          <ChatActions
                            message={message}
                            extractPlainText={extractPlainText}
                            Challenge={localStorage.getItem('SelectedQuestionType') === 'challenge'}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <div className="chat-input-wrapper">
            <ChatInput previousMsg={allMessages} onSubmit={handleChatSubmit} chatId={chatId}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
