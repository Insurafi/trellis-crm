import React from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ChevronLeft, 
  ExternalLink,
  FileText,
  Globe
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const articles = [
  {
    id: 1,
    title: "Understanding Term Life Insurance",
    author: "LIMRA",
    description: "This comprehensive article explains the basics of term life insurance, including policy terms, coverage options, and ideal candidates for this type of insurance.",
    link: "https://www.lifehappens.org/insurance-overview/life-insurance/term-life-insurance/",
    publishDate: "March 2025"
  },
  {
    id: 2,
    title: "The Basics of Whole Life Insurance",
    author: "Life Happens",
    description: "An in-depth look at how whole life insurance works, its cash value component, and how it differs from term policies for long-term financial planning.",
    link: "https://www.lifehappens.org/insurance-overview/life-insurance/permanent-life-insurance/",
    publishDate: "February 2025"
  },
  {
    id: 3,
    title: "Life Insurance for Business Protection",
    author: "Insurance Information Institute",
    description: "How life insurance can protect businesses through key person insurance, buy-sell agreements, and executive benefits packages.",
    link: "https://www.iii.org/article/life-insurance-for-business",
    publishDate: "January 2025"
  },
  {
    id: 4,
    title: "Understanding Living Benefits in Life Insurance",
    author: "NAIC",
    description: "A detailed guide to living benefits such as critical illness, chronic illness, and terminal illness riders that can be added to life insurance policies.",
    link: "https://content.naic.org/consumer/life-insurance.htm",
    publishDate: "April 2025"
  }
];

const websites = [
  {
    id: 1,
    title: "LIMRA",
    description: "Research, consulting and professional development organization for insurance and financial services companies worldwide.",
    link: "https://www.limra.com/",
    category: "Industry Research"
  },
  {
    id: 2,
    title: "Insurance News Net",
    description: "The leading source for news, thought leadership and information for insurance industry professionals.",
    link: "https://insurancenewsnet.com/",
    category: "News"
  },
  {
    id: 3,
    title: "ThinkAdvisor",
    description: "The premier destination for investment insights, financial news and advisor best practices.",
    link: "https://www.thinkadvisor.com/",
    category: "News & Analysis"
  },
  {
    id: 4,
    title: "Life Happens",
    description: "Non-profit organization dedicated to helping consumers make smart insurance decisions to safeguard their financial futures.",
    link: "https://lifehappens.org/",
    category: "Consumer Education"
  },
  {
    id: 5,
    title: "National Association of Insurance Commissioners (NAIC)",
    description: "Regulatory support organization that helps state insurance regulators establish standards and best practices.",
    link: "https://www.naic.org/",
    category: "Regulation"
  },
  {
    id: 6,
    title: "Society of Financial Service Professionals",
    description: "Network of multidisciplinary professionals committed to high professional and ethical standards.",
    link: "https://www.financialpro.org/",
    category: "Professional Development"
  }
];

const ArticleCard = ({ article }: { article: typeof articles[0] }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{article.title}</CardTitle>
            <CardDescription className="mt-1">by {article.author}</CardDescription>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-muted-foreground">{article.publishDate}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{article.description}</p>
      </CardContent>
      <CardFooter>
        <a
          href={article.link}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center py-2 px-4 rounded-md bg-primary hover:bg-primary/90 text-white font-medium text-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            window.open(article.link, "_blank", "noopener,noreferrer");
          }}
        >
          <span>Read Article</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardFooter>
    </Card>
  );
};

const WebsiteCard = ({ website }: { website: typeof websites[0] }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{website.title}</CardTitle>
            <CardDescription className="mt-1">{website.category}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{website.description}</p>
      </CardContent>
      <CardFooter>
        <a
          href={website.link}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center py-2 px-4 rounded-md bg-primary hover:bg-primary/90 text-white font-medium text-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            window.open(website.link, "_blank", "noopener,noreferrer");
          }}
        >
          <span>Visit Website</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardFooter>
    </Card>
  );
};

export default function ResourcesBooks() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <Link href="/resources" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Resources
          </Link>
          <Link href="/training" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Insurance Resources</h1>
        <p className="text-muted-foreground mt-2">
          Recommended articles and websites to enhance your insurance knowledge and sales skills.
        </p>
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="mb-8 w-full justify-start">
          <TabsTrigger value="articles" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Articles
          </TabsTrigger>
          <TabsTrigger value="websites" className="flex items-center">
            <Globe className="mr-2 h-4 w-4" />
            Websites
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="articles">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="websites">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {websites.map((website) => (
              <WebsiteCard key={website.id} website={website} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}