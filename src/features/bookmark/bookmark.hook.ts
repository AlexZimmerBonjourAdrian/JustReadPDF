import { useCallback, useEffect, useState } from 'react';
import type { Bookmark } from './bookmark.types';
import { BookmarkService } from './bookmark.service';
import { StorageService } from '@/data/StorageService';

export function useBookmark() {
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);

  useEffect(() => {
    // El bookmark se carga junto con el documento desde StorageService.loadDocument
    // Este hook solo expone el estado local; la carga inicial se hace desde HomeClient
  }, []);

  const set = useCallback((patch: Bookmark) => {
    setBookmark((prev) => {
      const next = BookmarkService.toggle(prev, patch);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setBookmark(null);
  }, []);

  const goTo = useCallback((bookmark: Bookmark | null) => {
    return bookmark;
  }, []);

  return { bookmark, setBookmark: set, clearBookmark: clear, goToBookmark: goTo };
}
