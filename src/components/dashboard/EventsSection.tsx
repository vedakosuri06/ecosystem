import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  event_date: string;
  status: string;
  max_attendees?: number;
  profiles: {
    full_name: string;
  };
  event_attendees: { count: number }[];
}

const EventsSection = ({ userId, userRole }: { userId: string; userRole?: string }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const canCreateEvents = userRole === "faculty" || userRole === "admin";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    event_date: "",
    max_attendees: "",
  });

  useEffect(() => {
    fetchEvents();
    
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*, profiles(full_name), event_attendees(count)")
      .order("event_date", { ascending: true });

    if (!error && data) {
      setEvents(data as unknown as Event[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("events").insert([{
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      event_date: formData.event_date,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
      organizer_id: userId,
    }]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      setDialogOpen(false);
      setFormData({ title: "", description: "", category: "", location: "", event_date: "", max_attendees: "" });
    }
  };

  const handleRegister = async (eventId: string) => {
    const { error } = await supabase.from("event_attendees").insert([{
      event_id: eventId,
      user_id: userId,
    }]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Registered for event!",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Campus Events</h3>
          <p className="text-muted-foreground">Discover and join upcoming events</p>
        </div>
        {canCreateEvents && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" style={{ background: "var(--gradient-primary)" }}>
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>Add a new event to the campus calendar</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="tech">Technical</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Max Attendees (Optional)</Label>
                  <Input type="number" value={formData.max_attendees} onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" style={{ background: "var(--gradient-primary)" }}>
                  Create Event
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-all hover:scale-105 animate-fade-in" style={{ boxShadow: "var(--shadow-sm)" }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge className="capitalize">{event.category}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.event_date).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
                {event.max_attendees && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {event.event_attendees[0]?.count || 0} / {event.max_attendees} registered
                  </div>
                )}
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Organized by {event.profiles.full_name}</p>
                  <Button className="w-full" size="sm" onClick={() => handleRegister(event.id)} style={{ background: "var(--gradient-primary)" }}>
                    Register
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsSection;
