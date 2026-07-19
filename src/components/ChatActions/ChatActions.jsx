import { useCallback } from 'react';
import './ChatActions.css';
import html2pdf from "html2pdf.js";

const ChatActions = ({ message, extractPlainText }) => {
  const handleCopyToClipboard = useCallback(async () => {
    try {
      // Extract plain text from message content
      const plainText = message.isHTML
        ? extractPlainText(message.text)
        : message.text || '';

      // Copy to clipboard
      await navigator.clipboard.writeText(plainText);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message.isHTML
        ? extractPlainText(message.text)
        : message.text || '';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  }, [message, extractPlainText]);

  const createWord = (btn) => {
    const element = btn.closest(".chat-response-message-container");
    if (!element) {
        alert("❌ المان last_content پیدا نشد!");
        return;
    }

    // گرفتن محتوای HTML
    const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'>
        <style>
            /* استایل مخصوص Word */
            body { font-family: Vazirmatn, sans-serif; direction: rtl; }
            .word-style {
                background: #f9f9f9 url("https://example.com/bg.jpg") no-repeat center center;
                background-size: cover;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
            .farsi {
            direction: rtl !important;
            font-family: "Vazirmatn", "Tahoma", sans-serif;
            }
            .katex, .katex * {
                font-family: monospace !important;
                direction: ltr !important;
                unicode-bidi: bidi-override !important;
                overflow-x: auto; /* فعال‌سازی اسکرول افقی در صورت نیاز */
                overflow-y: hidden; /* جلوگیری از اسکرول عمودی */
                white-space: nowrap; /* جلوگیری از شکستن خطوط */
            }
            #actions{
                display:none;
            }
        </style>
    </head>
    <body>
        <div class="word-style">
            ${element.innerHTML}
        </div>
    </body>
    </html>
    `;

    // ساخت Blob و دانلود Word
    const blob = new Blob(['\ufeff', content], {
        type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Create Word");
  };

  const createPdf = (btn) => {
    const element = btn.closest(".chat-response-message-container");
    if (!element) {
        alert("❌ المان last_content پیدا نشد!");
        return;
    }

    // اضافه کردن کلاس استایل PDF
    element.classList.add("pdf-style");
    //حذف کلاس بکگراند اضافی
    const opt = {
        margin:       0.5,
        filename:     'document.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        // حذف کلاس بعد از تولید PDF
        element.classList.remove("pdf-style");
    });
    console.log("Create PDF");
  };   

  return (
    <div className="chat-response-actions">
      <div className="chat-response-actions-right">
        <button
          className="chat-response-action-icon"
          onClick={handleCopyToClipboard}
        >
          <img src="/icons/document-normal.svg" alt="Document" />
        </button>
        <button className="chat-response-action-icon">
          <img src="/icons/rotate-right.svg" alt="Rotate" />
        </button>
        <button className="chat-response-action-icon">
          <img src="/icons/like.svg" alt="Like" />
        </button>
        <button className="chat-response-action-icon">
          <img src="/icons/dislike.svg" alt="Dislike" />
        </button>
      </div>
      <div className="chat-response-actions-left">
        <button onClick={(e) => createPdf(e.currentTarget)} className="chat-response-action-button pdf">PDF</button>
        <button onClick={(e) => createWord(e.currentTarget)} className="chat-response-action-button Word">Word</button>
      </div>
    </div>
  );
};

export default ChatActions;
