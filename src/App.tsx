import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "@/pages/Signup";
import ResetPassword from "@/pages/ResetPassword";
import Members from "./pages/Members";
import Finances from "./pages/Finances";
import Maintenance from "./pages/Maintenance";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Visitors from "./pages/Visitors";
import Amenities from "./pages/Amenities";
import Settings from "./pages/Settings";
import Security from "./pages/security";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Documents from "./pages/Documents";
import Chat from "./pages/Chat";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/members" element={<Members />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/transactions" element={<Navigate to="/finances" replace />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/events" element={<Events />} />
              <Route path="/visitors" element={<Visitors />} />
              <Route path="/amenities" element={<Amenities />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/security" element={<Security />} />
            </Route>
            
            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
