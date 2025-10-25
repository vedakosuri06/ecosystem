// src/App.tsx
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Firebase
import { auth, db } from "./firebase/firebaseconfig";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Test Firebase auth and Firestore
    console.log("Firebase Auth:", auth);
    console.log("Firestore DB:", db);

    // Example: listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("User signed in:", user);
      } else {
        console.log("No user signed in");
      }
    });

    // Cleanup listener
    return () => unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
