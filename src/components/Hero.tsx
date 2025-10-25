import { Button } from "@/components/ui/button";
import { GraduationCap, Calendar, Search, MessageSquare, Users, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const features = [
    { icon: Search, label: "Lost & Found" },
    { icon: Calendar, label: "Events" },
    { icon: Users, label: "Clubs" },
    { icon: MessageSquare, label: "Feedback" },
    { icon: Bell, label: "Announcements" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative container mx-auto px-6 pt-32 pb-16">
        <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6 animate-scale-in">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Smart Campus Hub</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Your Campus,
            <br />
            Connected & Simplified
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The all-in-one platform for campus life. Find lost items, discover events, join clubs, and stay connected with your campus community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ background: "var(--gradient-primary)" }}>
                Get Started
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-primary/5 transition-all hover:scale-105">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.label}
                className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-border hover:shadow-lg transition-all hover:scale-105 animate-fade-in cursor-pointer"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <feature.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { value: "500+", label: "Active Students" },
            { value: "50+", label: "Campus Events" },
            { value: "20+", label: "Student Clubs" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
