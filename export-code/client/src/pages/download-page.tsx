import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function DownloadPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    // Generate the full URL for the download
    const protocol = window.location.protocol;
    const host = window.location.host;
    setDownloadUrl(`${protocol}//${host}/trellis-crm-code.zip`);
  }, []);

  const handleDownload = () => {
    setIsDownloading(true);
    
    // Create an invisible anchor element
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'trellis-crm-code.zip';
    document.body.appendChild(a);
    
    // Click it to trigger download
    a.click();
    
    // Remove it from the DOM
    document.body.removeChild(a);
    
    // Reset state after a delay
    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Trellis CRM Code Download</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Download Complete Source Code</CardTitle>
          <CardDescription>
            Get the entire Trellis CRM application codebase as a ZIP file
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button 
            size="lg" 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="px-8 py-6 text-lg"
          >
            {isDownloading ? "Downloading..." : "Download Code (ZIP)"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installation Instructions</CardTitle>
          <CardDescription>
            Follow these steps to set up the application on your local machine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-3">
            <li>Download and extract the ZIP file to a folder on your computer.</li>
            <li>Open a terminal or command prompt in that folder.</li>
            <li>Run <code className="bg-muted px-1 py-0.5 rounded">npm install</code> to install all dependencies.</li>
            <li>Create a <code className="bg-muted px-1 py-0.5 rounded">.env</code> file in the root directory with your database credentials:
              <pre className="bg-muted p-2 rounded mt-2 text-sm">
                {`DATABASE_URL=postgres://username:password@localhost:5432/trellis_db
SESSION_SECRET=your_random_secret_string`}
              </pre>
            </li>
            <li>Run <code className="bg-muted px-1 py-0.5 rounded">npx drizzle-kit push</code> to initialize your database schema.</li>
            <li>Run <code className="bg-muted px-1 py-0.5 rounded">npm run dev</code> to start the development server.</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <strong className="text-blue-700">Note:</strong> You'll need Node.js 18+ and PostgreSQL to run this application.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}