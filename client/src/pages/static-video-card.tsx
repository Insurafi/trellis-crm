import { ExternalLink, Video } from "lucide-react";

interface VideoPlayerProps {
  youtubeId: string;
  title: string;
}

const VideoPlayer = ({ youtubeId, title }: VideoPlayerProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <Video className="mr-2 h-5 w-5 text-red-500" />
        Video: {title}
      </h3>
      <div className="rounded-md overflow-hidden border border-border">
        <div className="bg-muted p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-shrink-0 w-full md:w-64 h-auto">
            <div className="relative rounded overflow-hidden bg-zinc-900 aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 68 48" className="h-12 w-12 text-red-600">
                  <path 
                    d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" 
                    fill="currentColor" 
                  />
                  <path d="M 45,24 27,14 27,34" fill="#fff" />
                </svg>
              </div>
              <img 
                src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} 
                className="opacity-70 w-full object-cover" 
                alt={title} 
              />
            </div>
          </div>
          <div className="flex flex-col h-full w-full md:w-auto">
            <div className="flex-grow">
              <h4 className="font-medium text-lg mb-1">{title}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                From: Life Insurance Academy
              </p>
            </div>
            <a 
              href={`https://www.youtube.com/watch?v=${youtubeId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Watch on YouTube</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
