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
import { Plus, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LostItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  image_url?: string;
  contact_info?: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

const LostAndFoundSection = ({ userId }: { userId: string }) => {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    status: "lost",
    contact_info: "",
  });

  useEffect(() => {
    fetchItems();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('lost-found-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lost_and_found' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("lost_and_found")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data as LostItem[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("lost_and_found").insert([{
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      status: formData.status as "lost" | "found" | "claimed",
      contact_info: formData.contact_info,
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
        description: "Item posted successfully!",
      });
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        status: "lost",
        contact_info: "",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Lost & Found</h3>
          <p className="text-muted-foreground">Report or find lost items on campus</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="w-4 h-4" />
              Post Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Post Lost/Found Item</DialogTitle>
              <DialogDescription>Share details about a lost or found item</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="found">Found</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Contact Info</Label>
                <Input value={formData.contact_info} onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" style={{ background: "var(--gradient-primary)" }}>
                Post Item
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-all hover:scale-105 animate-fade-in" style={{ boxShadow: "var(--shadow-sm)" }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <Badge variant={item.status === "lost" ? "destructive" : "default"} className="capitalize">
                    {item.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Posted by {item.profiles.full_name}</p>
                  {item.contact_info && (
                    <p className="text-sm text-primary font-medium mt-1">{item.contact_info}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LostAndFoundSection;
