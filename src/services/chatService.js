import { apiRequest, getChatToken } from './api';

const getModelName = (answerMode) => {
  const modelMap = {
    quick: 'gemini-2.5-flash-lite',
    strong: 'gemini-2.0-flash-exp',
  };
  return modelMap[answerMode] || modelMap.quick;
};

const getPromptName = (questionType) => {
  const promptMap = {
    'problem-solver': 'حل مسئله',
    'pdf-helper': 'همیار مقاله / PDF',
    'quiz-maker': 'طراحی نمونه سوال',
    'book-chat': 'چت با کتاب',
    summarizer: 'خلاصه سازی',
  };
  return promptMap[questionType] || promptMap['problem-solver'];
};

const getPromptValue = (questionType, prompts) => {
  if (!prompts || !Array.isArray(prompts)) {
    return null;
  }

  const promptName = getPromptName(questionType);
  const prompt = prompts.find((p) => p.name === promptName);
  return prompt?.value || null;
};

export const chatService = {
  getOffers: async () => {
    const response = await apiRequest('/offer', {
      method: 'GET',
    });
    return response.data || response;
  },

  getPrompts: async () => {
    const response = await apiRequest('/promp', {
      method: 'GET',
    });
    return response.data || response;
  },

  // Get list of messages/chats
  getChatList: async () => {
    const response = await apiRequest('/list_chat', {
      method: 'GET',
    });
    return response.data;
  },

  getChatData: async (chatId) => {
    const response = await apiRequest('/get_messages', {
      method: 'POST',
      body: {
        chat_id: chatId,
      },
    });
    return response;
  },

  sendMessage: async ({
    userText,
    questionType,
    answerMode,
    chatId,
    previousMessages,
    files,
    prompts,
    chatToken: providedChatToken,
  }) => {
    const chatToken = providedChatToken || getChatToken();

    if (!chatToken) {
      throw new Error('Authentication required');
    }

    const promptValue = getPromptValue(questionType, prompts);

    const formData = new FormData();
    formData.append('prompt', promptValue);
    formData.append('user_text', userText);
    formData.append('token', chatToken);
    formData.append('model', getModelName(answerMode));

    if (chatId) {
      formData.append('chat_id', chatId);
    }

    if (
      previousMessages &&
      Array.isArray(previousMessages) &&
      previousMessages.length > 0
    ) {
      const formattedMessages = previousMessages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        content: msg.text || '',
      }));
      formData.append('previousMessages', JSON.stringify(formattedMessages));
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('file', file);
      });
    }

    const isDevelopment =
      import.meta.env.DEV || import.meta.env.MODE === 'development';
    const apiUrl = isDevelopment
      ? '/node-api/send-message2'
      : 'https://node.mrjavab.com/send-message2';

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`;

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  },
};
