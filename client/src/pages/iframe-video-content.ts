export const getYouTubeEmbedHtml = (youtubeId: string, title: string) => {
  return `
    <div style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.125rem; font-weight: 500; margin-bottom: 0.75rem;">
        Training Video: ${title}
      </h3>
      <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 0.375rem; border: 1px solid #e2e8f0;">
        <iframe 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          src="https://www.youtube.com/embed/${youtubeId}" 
          title="${title}"
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    </div>
  `;
};

export default getYouTubeEmbedHtml;
