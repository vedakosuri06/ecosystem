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
import { Plus, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Feedback {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  response?: string;
  created_at: string;
}

const FeedbackSection = ({ userId }: { userId: string }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFeedbacks(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("feedback").insert([{
      category: formData.category,
      subject: formData.subject,
      message: formData.message,
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
        description: "Feedback submitted successfully!",
      });
      setDialogOpen(false);
      setFormData({ category: "", subject: "", message: "" });
      fetchFeedback();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Feedback & Grievances</h3>
          <p className="text-muted-foreground">Share your thoughts and concerns</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ background: "var(--gradient-primary)" }}>
              <Plus className="w-4 h-4" />
              Submit Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Feedback</DialogTitle>
              <DialogDescription>Share your feedback or report a grievance</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="canteen">Canteen</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea 
                  value={formData.message} 
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                  rows={5}
                  required 
                />
              </div>
              <Button type="submit" className="w-full" style={{ background: "var(--gradient-primary)" }}>
                Submit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : feedbacks.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No feedback submitted yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="animate-fade-in" style={{ boxShadow: "var(--shadow-sm)" }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{feedback.subject}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="capitalize">{feedback.category}</Badge>
                      <Badge variant={feedback.status === "resolved" ? "default" : "secondary"} className="capitalize">
                        {feedback.status}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{feedback.message}</p>
                {feedback.response && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Admin Response:</p>
                    <p className="text-sm text-muted-foreground">{feedback.response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;
