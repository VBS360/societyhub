import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { user, signIn, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (!error) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Top nav */}
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
        {/* Left marketing panel */}
        <div className="hidden lg:block">
          <Card className="border-0 shadow-elevated bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <img src="/favicon.ico" alt="SocietyHub" className="h-5 w-5" />
                StartupStreak-style Login
              </CardTitle>
              <CardDescription>Stay on top of society operations with clarity.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div>• Manage members and finances</div>
              <div>• Plan events and announcements</div>
              <div>• Book amenities and track tasks</div>
            </CardContent>
          </Card>
        </div>

        {/* Login form */}
        <div className="mx-auto w-full max-w-md">
          <Card className="border-0 shadow-elevated">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" placeholder="Enter your email" required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" required className="pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div />
                  <Link to="/reset-password" className="text-primary hover:underline">Forgot password?</Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Need an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
