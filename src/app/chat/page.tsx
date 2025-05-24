import { Metadata } from "next";
import ChatInterface from "@/components/chat/ChatInterface";

export const metadata: Metadata = {
  title: "NBA Chat Advisor",
  description: "Get AI-powered NBA betting advice and recommendations",
};

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">NBA Betting Advisor</h1>
        <p className="text-muted-foreground text-lg">
          Get expert AI-powered recommendations for NBA betting
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
