import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { getToken } from '../services/api';
import { authKeys } from './useAuth';

export const chatKeys = {
  all: ['chat'],
  lists: () => [...chatKeys.all, 'list'],
  list: () => [...chatKeys.lists(), 'all'],
  chats: () => [...chatKeys.all, 'chats'],
  chat: (chatId) => [...chatKeys.chats(), chatId],
  prompts: () => [...chatKeys.all, 'prompts'],
  offers: () => [...chatKeys.all, 'offers'],
};

export const useOffers = () => {
  const token = getToken();

  return useQuery({
    queryKey: chatKeys.offers(),
    queryFn: () => chatService.getOffers(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const usePrompts = () => {
  const token = getToken();

  return useQuery({
    queryKey: chatKeys.prompts(),
    queryFn: () => chatService.getPrompts(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useChatList = () => {
  const token = getToken();

  return useQuery({
    queryKey: chatKeys.list(),
    queryFn: () => chatService.getChatList(),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useReadChat = (chatId) => {
  const token = getToken();

  return useQuery({
    queryKey: chatKeys.chat(chatId),
    queryFn: () => chatService.getChatData(chatId),
    enabled: !!token && !!chatId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => chatService.sendMessage(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });

      if(response?.credit !== undefined){
        queryClient.setQueryData(authKeys.profile(),(old) => 
        old ? {...old , credit : response.credit} : old)
      }

      if (response.chat_id) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.chat(response.chat_id),
        });
      }
    },
  });
};
