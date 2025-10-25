import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Search, Calendar, Users, MessageSquare, Bell, Plus } from "lucide-react";
import LostAndFoundSection from "@/components/dashboard/LostAndFoundSection";
import EventsSection from "@/components/dashboard/EventsSection";
import ClubsSection from "@/components/dashboard/ClubsSection";
import FeedbackSection from "@/components/dashboard/FeedbackSection";
import ChatbotWidget from "@/components/ChatbotWidget";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .eq("id", session.user.id)
        .single();
      
      setProfile(profileData);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Smart Campus
            </h1>
            {profile?.user_roles?.[0]?.role && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                {profile.user_roles[0].role}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, {profile?.full_name || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Campus Hub</h2>
          <p className="text-muted-foreground">Manage your campus activities all in one place</p>
        </div>

        <Tabs defaultValue="lost-found" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-2 bg-muted/50">
            <TabsTrigger value="lost-found" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Lost & Found</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="clubs" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clubs</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lost-found" className="animate-fade-in">
            <LostAndFoundSection userId={user?.id || ""} />
          </TabsContent>

          <TabsContent value="events" className="animate-fade-in">
            <EventsSection userId={user?.id || ""} userRole={profile?.user_roles?.[0]?.role} />
          </TabsContent>

          <TabsContent value="clubs" className="animate-fade-in">
            <ClubsSection userId={user?.id || ""} userRole={profile?.user_roles?.[0]?.role} />
          </TabsContent>

          <TabsContent value="feedback" className="animate-fade-in">
            <FeedbackSection userId={user?.id || ""} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default Dashboard;
