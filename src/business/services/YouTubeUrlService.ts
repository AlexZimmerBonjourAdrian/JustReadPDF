export class YouTubeUrlService {
  static extractVideoId(url: string): string | null {
    try {
      const u = new URL(url.trim());
      const host = u.hostname.replace(/^www\./, '');
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (u.pathname === '/watch') {
          const id = u.searchParams.get('v');
          return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
        }
        const shortsMatch = u.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
        if (shortsMatch) return shortsMatch[1];
        const embedMatch = u.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
        if (embedMatch) return embedMatch[1];
      }
      if (host === 'youtu.be') {
        const id = u.pathname.slice(1).split('/')[0];
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
      return null;
    } catch {
      return null;
    }
  }

  static toEmbedUrl(url: string): string | null {
    const id = this.extractVideoId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  static isValidYouTubeUrl(url: string): boolean {
    return this.extractVideoId(url) !== null;
  }
}