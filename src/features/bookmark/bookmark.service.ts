import { LoggerService } from '@/business/services/LoggerService';
import type { Bookmark } from './bookmark.types';

export const BookmarkService = {
  toggle(current: Bookmark | null, patch: Bookmark): Bookmark | null {
    if (!current || !current.page && !current.scrollY) {
      return patch;
    }
    // Si ya hay bookmark en la misma página/posición, se quita
    const samePage = current.page !== undefined && patch.page !== undefined && current.page === patch.page;
    const sameScroll = current.scrollY !== undefined && patch.scrollY !== undefined && current.scrollY === patch.scrollY;
    if (samePage || sameScroll) {
      return null;
    }
    return patch;
  },
};

LoggerService.info('BookmarkService', 'module loaded');
