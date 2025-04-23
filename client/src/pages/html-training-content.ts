export const getHtmlContent = (youtubeId: string, title: string) => {
  return `
    <div style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1.125rem; font-weight: 500; margin-bottom: 0.75rem; display: flex; align-items: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; color: #e11d48;">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
        Training Video: ${title}
      </h3>
      <a 
        href="https://www.youtube.com/watch?v=${youtubeId}" 
        target="_blank" 
        rel="noopener noreferrer"
        style="display: block; width: 100%; background-color: #e11d48; color: white; border-radius: 0.375rem; padding: 1rem; text-align: center; font-weight: 500; text-decoration: none; transition: background-color 0.2s;"
        onmouseover="this.style.backgroundColor='#be123c'"
        onmouseout="this.style.backgroundColor='#e11d48'"
      >
        Watch Training Video on YouTube
      </a>
    </div>
  `;
};

export default getHtmlContent;
