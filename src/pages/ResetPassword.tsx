import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPassword() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [email, setEmail] = useState('');

  // Optional: in-app password update after recovery link login could be added later
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    const redirectTo = `${window.location.origin}/login`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setIsSending(false);

    if (error) {
      toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Email sent', description: 'Check your inbox for the password reset link.' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/landing" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 overflow-hidden">
            <img
              src="/android-chrome-192x192.png"
              alt="SocietyHub"
              className="h-full w-full object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.ico'; }}
            />
          </div>
          <span className="font-semibold">SocietyHub</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/landing" className="hover:text-foreground">Home</Link>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-10 grid gap-10 lg:grid-cols-2 items-start">
        <div className="hidden lg:block">
          <Card className="border-0 shadow-elevated bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <img src="/android-chrome-192x192.png" alt="SocietyHub" className="h-5 w-5 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.ico'; }} />
                Reset your password
              </CardTitle>
              <CardDescription>We'll send a secure link to your email.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div>• Works even if you forgot your password</div>
              <div>• Link expires after a short time for security</div>
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto w-full max-w-md">
          <Card className="border-0 shadow-elevated">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Forgot password?</CardTitle>
              <CardDescription>Enter your email to get a reset link</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" placeholder="Enter your email" required className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send reset link'}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Remembered it? <Link to="/login" className="text-primary hover:underline">Log in</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
