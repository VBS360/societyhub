import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function Signup() {
  const { user, signUp, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const phone = (formData.get('phone') as string) || undefined;

    if (password !== confirm) {
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, { full_name: fullName, phone });
    setIsLoading(false);

    if (!error) {
      // After sign up, guide user to login (email confirmation might be required)
      navigate('/login', { replace: true });
    }
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
                <img src="/favicon.ico" alt="SocietyHub" className="h-5 w-5" />
                Create your account
              </CardTitle>
              <CardDescription>Join your society's workspace in minutes.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div>• Keep finances and maintenance on track</div>
              <div>• Engage with events and announcements</div>
              <div>• Role-based access for everyone</div>
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto w-full max-w-md">
          <Card className="border-0 shadow-elevated">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Create your SocietyHub</CardTitle>
              <CardDescription>Begin your journey</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" name="fullName" type="text" placeholder="Enter your full name" required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" placeholder="Enter your email" required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" name="phone" type="tel" placeholder="Enter your phone number" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" required minLength={6} className="pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters long</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm your password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Account'}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
