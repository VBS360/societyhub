import { useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Send, Smile, Paperclip } from "lucide-react";

interface Message { id: string; author: string; unit?: string; content: string; createdAt: string }

const initialMessages: Message[] = [
  { id: "m1", author: "Rajesh Kumar", unit: "B-304", content: "Hi everyone, AGM is next week. Please mark your calendars.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: "m2", author: "Priya Sharma", unit: "A-201", content: "Can someone share the minutes from the last meeting?", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.5).toISOString() },
  { id: "m3", author: "Society Admin", unit: undefined, content: "Minutes have been uploaded under Documents.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.25).toISOString() },
];

export default function Chat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const myName = profile?.full_name || "You";
  const myUnit = profile?.unit_number || undefined;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const handleSend = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      author: myName,
      unit: myUnit || undefined,
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 h-full">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Society Chat</h1>
          <p className="text-muted-foreground">A shared space for society discussions.</p>
        </div>

        <Card className="h-[70vh] flex flex-col shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">General Channel</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div ref={listRef} className="flex-1 overflow-auto rounded-lg border bg-background/50 p-4 space-y-4">
              {messages.map((m) => (
                <div key={m.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{m.author.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{m.author}</span>
                      {m.unit && <span className="text-muted-foreground">• {m.unit}</span>}
                      <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message..."
                className="min-h-[44px] h-[44px] resize-none"
              />
              <Button variant="outline" size="icon" title="Attach (mock)"><Paperclip className="h-4 w-4" /></Button>
              <Button size="icon" onClick={handleSend} title="Send"><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
