import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Task } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface TaskCardProps {
  task: Task;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-green-100 text-green-600";
    case "medium":
      return "bg-yellow-100 text-amber-500";
    case "high":
      return "bg-blue-100 text-primary";
    case "urgent":
      return "bg-red-100 text-red-500";
    default:
      return "bg-neutral-100 text-neutral-600";
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "low":
      return "Low Priority";
    case "medium":
      return "Medium Priority";
    case "high":
      return "High Priority";
    case "urgent":
      return "Urgent";
    default:
      return "No Priority";
  }
};

const getDueString = (dueDate: Date | null) => {
  if (!dueDate) return "No due date";

  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} days`;
  } else if (diffDays === 0) {
    return "Due today";
  } else if (diffDays === 1) {
    return "Due tomorrow";
  } else {
    return `Due in ${diffDays} days`;
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isCompleted, setIsCompleted] = useState(task.status === "completed");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleToggleStatus = async () => {
    const newStatus = isCompleted ? "pending" : "completed";
    try {
      await apiRequest("PATCH", `/api/tasks/${task.id}`, { status: newStatus });
      setIsCompleted(!isCompleted);
      
      toast({
        title: isCompleted ? "Task marked as pending" : "Task completed",
        description: isCompleted ? "The task has been marked as pending." : "The task has been marked as completed.",
        variant: "default",
      });
      
      // Invalidate task queries
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "An error occurred while updating the task status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-6 py-4 flex items-center border-b border-neutral-200">
      <div className="flex-shrink-0 mr-4">
        <button onClick={handleToggleStatus} className="focus:outline-none">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-red-500 fill-red-500 hover:text-red-600 hover:fill-red-600" />
          )}
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className={`text-sm font-medium ${isCompleted ? 'text-neutral-500 line-through' : 'text-neutral-900'}`}>
          {task.title}
        </h3>
        {task.dueDate && (
          <p className="text-sm text-neutral-600 mt-1">
            {getDueString(new Date(task.dueDate))}
          </p>
        )}
      </div>
      <div className="ml-4 flex-shrink-0">
        <Badge 
          variant="outline" 
          className={`${getPriorityColor(task.priority)}`}
        >
          {getPriorityLabel(task.priority)}
        </Badge>
      </div>
    </div>
  );
};

export default TaskCard;
