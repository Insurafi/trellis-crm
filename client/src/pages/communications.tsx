import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { PencilIcon, PlusCircle, Trash2, Send, Mail } from "lucide-react";

// Email sending schema
const emailSchema = z.object({
  to: z.string().email("Invalid email address"),
  from: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  templateId: z.number().optional(),
  customText: z.string().optional(),
  replacements: z.record(z.string()).optional(),
});

type EmailFormValues = z.infer<typeof emailSchema>;

// Template schema for form validation
const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  category: z.string().min(1, "Category is required"),
  content: z.string().min(1, "Content is required"),
  subject: z.string().optional(),
  tags: z.string().optional(),
  isDefault: z.boolean().optional(),
  createdBy: z.number().default(1), // Default to admin user for now
});

type TemplateFormValues = z.infer<typeof templateSchema>;

function CommunicationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Fetch templates based on the active tab
  const { data: templates, isLoading } = useQuery({
    queryKey: activeTab === "all" 
      ? ['/api/communication/templates'] 
      : ['/api/communication/templates', activeTab],
    queryFn: async ({ queryKey }) => {
      const url = activeTab === "all" 
        ? '/api/communication/templates' 
        : `/api/communication/templates?category=${activeTab}`;
      return apiRequest('GET', url);
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (newTemplate: TemplateFormValues) => 
      apiRequest('POST', '/api/communication/templates', newTemplate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communication/templates'] });
      toast({
        title: "Template created",
        description: "The communication template has been created successfully.",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create the template. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TemplateFormValues> }) => 
      apiRequest('PATCH', `/api/communication/templates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communication/templates'] });
      toast({
        title: "Template updated",
        description: "The communication template has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update the template. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/communication/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communication/templates'] });
      toast({
        title: "Template deleted",
        description: "The communication template has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the template. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form for creating a new template
  const createForm = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      category: "email",
      content: "",
      subject: "",
      tags: "",
      isDefault: false,
      createdBy: 1,
    },
  });

  // Form for editing an existing template
  const editForm = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      category: "email",
      content: "",
      subject: "",
      tags: "",
      isDefault: false,
      createdBy: 1,
    },
  });

  // Handle template creation form submission
  const onCreateSubmit = (values: TemplateFormValues) => {
    createTemplateMutation.mutate(values);
  };

  // Handle template edit form submission
  const onEditSubmit = (values: TemplateFormValues) => {
    if (selectedTemplate) {
      updateTemplateMutation.mutate({ id: selectedTemplate.id, data: values });
    }
  };

  // Open edit dialog with template data
  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    editForm.reset({
      name: template.name,
      category: template.category,
      content: template.content,
      subject: template.subject || "",
      tags: template.tags || "",
      isDefault: template.isDefault || false,
      createdBy: template.createdBy || 1,
    });
    setIsEditDialogOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Email form handling
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      to: "",
      from: "",
      subject: "",
      customText: "",
      replacements: {}
    }
  });

  // Add a template ID field when a user selects a template
  const handleUseTemplate = (template: any) => {
    if (template.category !== 'email') {
      toast({
        title: "Not an email template",
        description: "Only email templates can be used for sending emails.",
        variant: "destructive"
      });
      return;
    }

    setSelectedTemplate(template);
    emailForm.reset({
      to: "",
      from: "",
      subject: template.subject || "",
      templateId: template.id,
      customText: "",
      replacements: {}
    });
    setIsSendEmailDialogOpen(true);
  };

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (emailData: EmailFormValues) => 
      apiRequest('POST', '/api/communication/send-email', emailData),
    onSuccess: () => {
      toast({
        title: "Email sent",
        description: "The email has been sent successfully.",
      });
      setIsSendEmailDialogOpen(false);
    },
    onError: (error: any) => {
      // If the error indicates API key configuration is needed
      if (error.data?.configRequired) {
        toast({
          title: "Email service not configured",
          description: "SendGrid API key is required to send emails. Please contact your administrator.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send the email. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Handle email form submission
  const onSendEmailSubmit = (values: EmailFormValues) => {
    sendEmailMutation.mutate(values);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Scripts & Templates</h1>
          <p className="text-gray-500 mt-1">
            Manage scripts and templates for client communications via emails, calls, and text messages
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSendEmailDialogOpen} onOpenChange={setIsSendEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Mail size={18} />
                Send Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Send Email</DialogTitle>
                <DialogDescription>
                  {selectedTemplate 
                    ? `Using template: ${selectedTemplate.name}`
                    : "Create and send a new email"}
                </DialogDescription>
              </DialogHeader>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSendEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To</FormLabel>
                        <FormControl>
                          <Input placeholder="recipient@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From</FormLabel>
                        <FormControl>
                          <Input placeholder="your@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Email subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {!selectedTemplate && (
                    <FormField
                      control={emailForm.control}
                      name="customText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your email content here..." 
                              className="min-h-[200px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {selectedTemplate && (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md bg-gray-50">
                        <h4 className="font-medium mb-2">Template Preview</h4>
                        <p className="text-sm whitespace-pre-line">{selectedTemplate.content}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Replacements</h4>
                        <p className="text-xs text-gray-500 mb-3">
                          Enter values for placeholders in the format [PLACEHOLDER]
                        </p>
                        
                        {/* Dynamic fields for replacements */}
                        <div className="space-y-2">
                          {(selectedTemplate.content.match(/\[([A-Z_]+)\]/g) || [])
                            .map((match: string) => match.slice(1, -1)) // Remove [ and ]
                            .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index) // Remove duplicates
                            .map((placeholder: string) => (
                              <div key={placeholder} className="flex gap-2 items-center">
                                <div className="w-1/3">
                                  <Label>{placeholder}</Label>
                                </div>
                                <div className="w-2/3">
                                  <Input
                                    placeholder={`Value for ${placeholder}`} 
                                    onChange={(e) => {
                                      const currentReplacements = emailForm.getValues("replacements") || {};
                                      emailForm.setValue("replacements", {
                                        ...currentReplacements,
                                        [placeholder]: e.target.value
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsSendEmailDialogOpen(false);
                        setSelectedTemplate(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={sendEmailMutation.isPending}
                    >
                      {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle size={18} />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a new template for client communications.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Welcome Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="call">Call Script</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {createForm.watch("category") === "email" && (
                    <FormField
                      control={createForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Welcome to Our Insurance Agency" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={createForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Template content. Use [PLACEHOLDER] for variables." 
                            className="min-h-[200px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., welcome, onboarding" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Set as default template</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createTemplateMutation.isPending}
                    >
                      {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Scripts</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
          <TabsTrigger value="call">Call Scripts</TabsTrigger>
          <TabsTrigger value="sms">SMS Templates</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates && templates.length > 0 ? (
                templates.map((template: any) => (
                  <Card key={template.id} className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>
                            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                            {template.isDefault && " • Default"}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          {template.category === 'email' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleUseTemplate(template)}
                              title="Use this template"
                            >
                              <Send size={16} />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <PencilIcon size={16} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this template? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTemplateMutation.mutate(template.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {template.subject && (
                        <div className="mt-1">
                          <span className="text-sm font-medium">Subject: </span>
                          <span className="text-sm">{template.subject}</span>
                        </div>
                      )}
                      {template.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.split(',').map((tag: string, index: number) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <ScrollArea className="h-28">
                        <p className="text-sm whitespace-pre-line">{template.content}</p>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="pt-2 text-xs text-gray-500">
                      Created: {formatDate(template.createdAt)}
                      {template.updatedAt !== template.createdAt && 
                        ` • Updated: ${formatDate(template.updatedAt)}`}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex justify-center items-center h-64">
                  <p>No templates found. Create your first template to get started.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the selected communication template.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="call">Call Script</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {editForm.watch("category") === "email" && (
                <FormField
                  control={editForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Subject</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Set as default template</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateTemplateMutation.isPending}
                >
                  {updateTemplateMutation.isPending ? "Updating..." : "Update Template"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CommunicationsPage;