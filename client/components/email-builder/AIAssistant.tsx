import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Send, Bot, User, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentBlock, EmailTemplate } from "./types";
import { generateId, createTitleBlock, createTextBlock, createButtonBlock } from "./utils";

interface AIAssistantProps {
  onAddBlock: (block: ContentBlock) => void;
  onSetTemplate: (blocks: ContentBlock[]) => void;
  currentTemplate: EmailTemplate;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: ContentBlock[];
  isGenerating?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  onAddBlock,
  onSetTemplate,
  currentTemplate,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your Email AI Assistant. I can help you build beautiful newsletters. Just tell me what you need, for example: 'Create a welcome email for a tech newsletter' or 'Add a product section about new sneakers'.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    // Mock AI response for now
    // In a real app, this would call /api/ai/email-template
    setTimeout(() => {
      let aiContent = "I've generated some blocks for you based on your request.";
      let suggestions: ContentBlock[] = [];

      if (input.toLowerCase().includes("welcome")) {
        aiContent = "Here's a welcome email structure for you:";
        suggestions = [
          createTitleBlock("Welcome to our Newsletter!"),
          createTextBlock("We're so glad to have you with us. Stay tuned for exciting updates, tips, and exclusive offers."),
          createButtonBlock("Get Started", "#"),
        ];
      } else if (input.toLowerCase().includes("product")) {
        aiContent = "I've suggested a product section:";
        suggestions = [
          createTitleBlock("Featured Product"),
          createTextBlock("Check out our latest addition to the collection. Built with quality and style in mind."),
          createButtonBlock("Shop Now", "#"),
        ];
      } else {
        suggestions = [
          createTitleBlock("New Section"),
          createTextBlock("Tell me more about what you want to add here."),
        ];
      }

      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: aiContent,
        suggestions,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 1500);
  };

  const handleApplyAll = (blocks: ContentBlock[]) => {
    onSetTemplate(blocks);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-gray-900">Active Intelligence</h2>
          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Beta</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-2",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-start gap-2 max-w-[90%]">
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 mt-1 border border-purple-100">
                    <AvatarFallback className="bg-purple-600 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    message.role === "user"
                      ? "bg-purple-600 text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200"
                  )}
                >
                  {message.content}
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 mt-1 border border-gray-200">
                    <AvatarFallback className="bg-gray-200 text-gray-600">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="ml-10 mt-2 space-y-2 w-full max-w-[85%]">
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                    <div className="text-xs font-semibold text-purple-700 mb-3 flex items-center justify-between">
                      AI GENERATED BLOCKS
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-[10px] hover:bg-purple-100 text-purple-700"
                        onClick={() => handleApplyAll(message.suggestions!)}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Apply to Template
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {message.suggestions.map((block) => (
                        <div 
                          key={block.id} 
                          className="bg-white border border-purple-100 p-2 rounded-lg flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase font-medium">
                              {block.type}
                            </span>
                            <span className="text-xs text-gray-600 truncate">
                              {"content" in block ? block.content : block.type}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            onClick={() => onAddBlock(block)}
                            title="Add to template"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isGenerating && (
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8 border border-purple-100">
                <AvatarFallback className="bg-purple-600 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2 rounded-tl-none">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what to build..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="pr-10 border-purple-100 focus:border-purple-600 focus:ring-purple-600/10 rounded-xl"
            disabled={isGenerating}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="absolute right-1 top-1 h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          AI can make mistakes. Check important information for accuracy.
        </p>
      </div>
    </div>
  );
};
