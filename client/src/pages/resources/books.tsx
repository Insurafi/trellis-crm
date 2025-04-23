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
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ExternalLink,
  BookOpen,
  Globe,
  Star
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const books = [
  {
    id: 1,
    title: "The Digital Life Insurance Agent",
    author: "Jeff Root",
    description: "How to market life insurance online and sell over the phone. A practical guide to leveraging digital marketing for insurance sales.",
    link: "https://amazon.com/Digital-Life-Insurance-Agent-Insurance-ebook/dp/B01BUKR5EK/",
    rating: 4.5,
    coverImage: "https://m.media-amazon.com/images/I/41pLvjmOF4L._SX331_BO1,204,203,200_.jpg"
  },
  {
    id: 2,
    title: "Questions and Answers on Life Insurance",
    author: "Tony Steuer",
    description: "The Life Insurance Toolbook. A comprehensive guide to understanding life insurance policies and helping clients make informed decisions.",
    link: "https://amazon.com/Questions-Answers-Life-Insurance-Toolbook/dp/0984508104/",
    rating: 4.7,
    coverImage: "https://m.media-amazon.com/images/I/51pLJrTdDPL._SX331_BO1,204,203,200_.jpg"
  },
  {
    id: 3,
    title: "Knock Out the Competition",
    author: "Michael Bonilla",
    description: "A proven formula for selling final expense life insurance like a champion. Specific strategies for the final expense market.",
    link: "https://amazon.com/Knock-Out-Competition-Selling-Insurance/dp/1735393509/",
    rating: 4.8,
    coverImage: "https://m.media-amazon.com/images/I/41bq9U6YYTL._SX331_BO1,204,203,200_.jpg"
  },
  {
    id: 4,
    title: "Paychecks and Playchecks",
    author: "Tom Hegna",
    description: "Retirement solutions for life. Strategies to create a steady stream of retirement income that lasts a lifetime.",
    link: "https://amazon.com/Paychecks-Playchecks-Retirement-Solutions-Life/dp/0615393063/",
    rating: 4.6,
    coverImage: "https://m.media-amazon.com/images/I/41YCFyHfVNL._SX331_BO1,204,203,200_.jpg"
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

const BookCard = ({ book }: { book: typeof books[0] }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{book.title}</CardTitle>
            <CardDescription className="mt-1">by {book.author}</CardDescription>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{book.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-col sm:flex-row gap-4">
          {book.coverImage && (
            <div className="flex-shrink-0 w-24 sm:w-28 mx-auto sm:mx-0">
              <img
                src={book.coverImage}
                alt={`Cover of ${book.title}`}
                className="w-full h-auto rounded-md shadow-md"
              />
            </div>
          )}
          <div>
            <p className="text-muted-foreground text-sm">{book.description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <button 
          onClick={() => window.open(book.link, '_blank')}
          className="w-full flex items-center justify-center py-2 px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-center gap-2"
        >
          <span>View on Amazon</span>
          <ExternalLink className="h-4 w-4" />
        </button>
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
        <button 
          onClick={() => window.open(website.link, '_blank')}
          className="w-full flex items-center justify-center py-2 px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-center gap-2"
        >
          <span>Visit Website</span>
          <ExternalLink className="h-4 w-4" />
        </button>
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
          Recommended books and websites to enhance your insurance knowledge and sales skills.
        </p>
      </div>

      <Tabs defaultValue="books" className="w-full">
        <TabsList className="mb-8 w-full justify-start">
          <TabsTrigger value="books" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            Books
          </TabsTrigger>
          <TabsTrigger value="websites" className="flex items-center">
            <Globe className="mr-2 h-4 w-4" />
            Websites
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="books">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
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