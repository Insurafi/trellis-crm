import React from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  FileText,
  Globe,
  Video,
  Presentation,
  Download
} from "lucide-react";

const resourceCategories = [
  {
    id: 1,
    title: "Articles & Websites",
    description: "Recommended articles and industry websites for insurance professionals.",
    icon: <BookOpen className="h-12 w-12 p-3 rounded-full bg-cyan-100 text-cyan-600 mb-4" />,
    link: "/resources/articles"
  },
  {
    id: 2,
    title: "Marketing Templates",
    description: "Ready-to-use templates for client emails, social media, and presentations.",
    icon: <FileText className="h-12 w-12 p-3 rounded-full bg-green-100 text-green-600 mb-4" />,
    link: "/marketing"
  },
  {
    id: 3,
    title: "Training Videos",
    description: "Educational videos on insurance products, sales techniques, and more.",
    icon: <Video className="h-12 w-12 p-3 rounded-full bg-blue-100 text-blue-600 mb-4" />,
    link: "/resources/videos"
  },
  {
    id: 4,
    title: "Presentation Materials",
    description: "Slide decks and visual aids for client meetings and presentations.",
    icon: <Presentation className="h-12 w-12 p-3 rounded-full bg-purple-100 text-purple-600 mb-4" />,
    link: "/resources" // Temporary link until this section is implemented
  },
  {
    id: 5,
    title: "Downloadable Forms",
    description: "Insurance applications, disclosure forms, and client questionnaires.",
    icon: <Download className="h-12 w-12 p-3 rounded-full bg-amber-100 text-amber-600 mb-4" />,
    link: "/resources" // Temporary link until this section is implemented
  }
];

const ResourceCard = ({ resource }: { resource: typeof resourceCategories[0] }) => {
  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-md hover:border-primary/40">
      <CardHeader className="text-center">
        <div className="flex justify-center">
          {resource.icon}
        </div>
        <CardTitle className="text-xl">{resource.title}</CardTitle>
        <CardDescription>{resource.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-end justify-center pb-6">
        <a 
          href={resource.link}
          className="inline-flex items-center"
        >
          <Button className="inline-flex items-center">
            View Resources
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
};

export default function Resources() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <a href="/dashboard" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </a>
          <a href="/training" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Training
          </a>
        </div>
        <h1 className="text-3xl font-bold">Resources Hub</h1>
        <p className="text-muted-foreground mt-2">
          Access training materials, marketing templates, and reference guides to boost your insurance career.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {resourceCategories.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}