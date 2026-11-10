import { LoggerService } from '@/business/services/LoggerService';
import type { ViewState } from './view-state.types';

const DB_NAME = 'JustReadPDF_ViewState_DB';
const STORE_NAME = 'viewState';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export const ViewStateRepository = {
  async load(): Promise<ViewState | null> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('current');
      return new Promise((resolve, reject) => {
        req.onsuccess = () => {
          db.close();
          resolve((req.result?.state as ViewState) ?? null);
        };
        req.onerror = () => { db.close(); reject(req.error); };
      });
    } catch (e) {
      LoggerService.error('ViewStateRepo', 'load failed', e);
      return null;
    }
  },
  async save(state: ViewState): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id: 'current', state });
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
      });
    } catch (e) {
      LoggerService.error('ViewStateRepo', 'save failed', e);
    }
  },
};
