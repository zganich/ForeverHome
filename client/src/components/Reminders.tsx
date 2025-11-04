import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Bell, Check, Plus, Trash2, Calendar, Pill, Scissors, GraduationCap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RemindersProps {
  petId: string;
}

export default function Reminders({ petId }: RemindersProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"medication" | "vet" | "grooming" | "training" | "custom">("medication");
  const [dueDate, setDueDate] = useState("");
  const [isRecurring, setIsRecurring] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly">("none");

  const utils = trpc.useUtils();
  const { data: reminders, isLoading } = trpc.reminders.forPet.useQuery({ petId });

  const createReminder = trpc.reminders.create.useMutation({
    onSuccess: () => {
      toast.success("Reminder created!");
      utils.reminders.forPet.invalidate({ petId });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create reminder: ${error.message}`);
    },
  });

  const completeReminder = trpc.reminders.complete.useMutation({
    onSuccess: () => {
      toast.success("Reminder completed!");
      utils.reminders.forPet.invalidate({ petId });
    },
  });

  const deleteReminder = trpc.reminders.delete.useMutation({
    onSuccess: () => {
      toast.success("Reminder deleted!");
      utils.reminders.forPet.invalidate({ petId });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("medication");
    setDueDate("");
    setIsRecurring("none");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    createReminder.mutate({
      petId,
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      dueDate: new Date(dueDate),
      isRecurring,
    });
  };

  const getTypeIcon = (reminderType: string) => {
    switch (reminderType) {
      case "medication":
        return <Pill className="w-4 h-4" />;
      case "vet":
        return <Calendar className="w-4 h-4" />;
      case "grooming":
        return <Scissors className="w-4 h-4" />;
      case "training":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "No date";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isOverdue = (date: Date | string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Reminders
            </CardTitle>
            <CardDescription>Medication, vet visits, grooming, and more</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="text-base min-h-[48px]">
                <Plus className="w-5 h-5 mr-2" />
                Add Reminder (For Vet Visits, Medications, etc.)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">Add Reminder</DialogTitle>
                <DialogDescription className="text-base">
                  Set a reminder for your pet's care needs. This will help you remember vet visits, medications, and other important dates.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold">
                    What do you need to remember? <span className="text-destructive">*</span>
                    <span className="text-xs text-muted-foreground font-normal ml-2">(Required)</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Give heartworm medication"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="text-base min-h-[48px]"
                  />
                  <p className="text-sm text-muted-foreground">Type what you need to remember</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Select value={type} onValueChange={(value: any) => setType(value)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">💊 Medication</SelectItem>
                      <SelectItem value="vet">🏥 Vet Appointment</SelectItem>
                      <SelectItem value="grooming">✂️ Grooming</SelectItem>
                      <SelectItem value="training">🎓 Training</SelectItem>
                      <SelectItem value="custom">📝 Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">
                    Due Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isRecurring">Recurring</Label>
                  <Select value={isRecurring} onValueChange={(value: any) => setIsRecurring(value)}>
                    <SelectTrigger id="isRecurring">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">One-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Notes (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" size="lg" className="flex-1 text-base min-h-[48px]" disabled={createReminder.isPending}>
                    {createReminder.isPending ? "Creating..." : "Create Reminder"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="text-base min-h-[48px]"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading reminders...</p>
        ) : !reminders || reminders.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-base text-muted-foreground">
              No reminders yet.
            </p>
            <p className="text-base text-muted-foreground">
              Click "Add Reminder" above to set reminders for vet visits, medications, and other important dates.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  reminder.isCompleted === "yes"
                    ? "bg-muted/50 opacity-60"
                    : isOverdue(reminder.dueDate)
                    ? "border-destructive bg-destructive/5"
                    : "bg-card"
                }`}
              >
                <div className="flex-shrink-0">
                  {getTypeIcon(reminder.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${reminder.isCompleted === "yes" ? "line-through" : ""}`}>
                      {reminder.title}
                    </h4>
                    {reminder.isRecurring !== "none" && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {reminder.isRecurring}
                      </span>
                    )}
                  </div>
                  {reminder.description && (
                    <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                  )}
                  <p className={`text-sm mt-1 ${isOverdue(reminder.dueDate) && reminder.isCompleted === "no" ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {formatDate(reminder.dueDate)}
                    {isOverdue(reminder.dueDate) && reminder.isCompleted === "no" && " (Overdue)"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {reminder.isCompleted === "no" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeReminder.mutate({ reminderId: reminder.id })}
                      disabled={completeReminder.isPending}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteReminder.mutate({ reminderId: reminder.id })}
                    disabled={deleteReminder.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

