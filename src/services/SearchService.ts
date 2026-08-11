export interface SearchResult {
  line: number;
  text: string;
  index: number;
}

export class SearchService {
  static searchInText(text: string, query: string, caseSensitive: boolean = false): SearchResult[] {
    if (!query || query.trim() === '') {
      return [];
    }

    const results: SearchResult[] = [];
    const lines = text.split('\n');
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    for (let i = 0; i < lines.length; i++) {
      const line = caseSensitive ? lines[i] : lines[i].toLowerCase();
      let index = line.indexOf(searchQuery);
      
      while (index !== -1) {
        results.push({
          line: i,
          text: lines[i],
          index: index
        });
        index = line.indexOf(searchQuery, index + 1);
      }
    }

    return results;
  }

  static highlightText(text: string, query: string, caseSensitive: boolean = false): string {
    if (!query || query.trim() === '') {
      return text;
    }

    const searchQuery = caseSensitive ? query : query.toLowerCase();
    const flags = caseSensitive ? 'g' : 'gi';
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, flags);
    
    return text.replace(regex, '<mark>$1</mark>');
  }

  static scrollToLine(lineNumber: number): void {
    // Esta función se implementará cuando se integre con el UI
    console.log('Scrolling to line:', lineNumber);
  }
}
