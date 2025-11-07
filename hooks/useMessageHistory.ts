import { useState } from "react";

export type MessagesHistory = {
  role: "user" | "assistant";
  content: string;
};

export type PayloadHistory = {
  model: "llama3.1:8b-instruct-q5_K_M";
  messages: MessagesHistory[];
};

export type Conversation = {
  id: string;
  title: string; // First user message or generated title
  timestamp: Date;
  messages: MessagesHistory[];
};

const useMessageHistory = () => {
  const [payload, setPayload] = useState<PayloadHistory>({
    model: "llama3.1:8b-instruct-q5_K_M",
    messages: [],
  });

  return { payload, setPayload };
};

export default useMessageHistory;
