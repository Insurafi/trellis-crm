import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinalClientTest() {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Make direct call to test endpoint
    fetch("/api/client-auth-test")
      .then(res => res.json())
      .then(data => {
        setResponse(data);
        
        if (data.success && data.responseData) {
          console.log("Test endpoint worked, trying to use the cookie to get client info");
          
          // Now try the client info endpoint directly
          return fetch("/api/client/info", {
            credentials: "include"
          }).then(res => {
            if (res.ok) {
              return res.json();
            } else {
              throw new Error(`Client info request failed: ${res.status}`);
            }
          }).then(clientInfo => {
            setResponse(prev => ({ ...prev, clientInfoTest: { success: true, data: clientInfo } }));
          }).catch(err => {
            setResponse(prev => ({ ...prev, clientInfoTest: { success: false, error: String(err) } }));
          });
        }
      })
      .catch(err => {
        setError(String(err));
      });
  }, []);

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Final Client Authentication Test</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-4 border border-red-200 rounded bg-red-50 text-red-800">
              <h3 className="font-semibold">Error:</h3>
              <p>{error}</p>
            </div>
          )}
          
          {response && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Server-side test result:</h3>
                <div className="p-4 border rounded bg-gray-50 overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-lg font-medium">Problem Summary</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The direct server-side test shows the API works correctly</li>
              <li>The browser test is failing to authenticate correctly</li>
              <li>This might be a cookie/session handling issue between client and server</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}