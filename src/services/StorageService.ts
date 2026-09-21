interface StoredDocument {
  fileName: string;
  fileType: string;
  fileData: ArrayBuffer;
  extractedText: string;
  timestamp: number;
}

import { LoggerService } from './LoggerService';

export class StorageService {
  private static DB_NAME = 'JustReadPDF_DB';
  private static STORE_NAME = 'documents';
  private static DB_VERSION = 1;

  private static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  static async saveDocument(file: File, extractedText: string): Promise<void> {
    const end = LoggerService.start('Storage', `saveDocument ${file.name}`);
    try {
      // Convertir archivo a ArrayBuffer ANTES de iniciar la transacción
      // para evitar que la transacción se cierre mientras esperamos
      const arrayBuffer = await file.arrayBuffer();
      
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      // Limpiar documentos anteriores en la misma transacción
      const clearRequest = store.clear();
      
      await new Promise<void>((resolve, reject) => {
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      });

      const document: StoredDocument = {
        fileName: file.name,
        fileType: file.type,
        fileData: arrayBuffer,
        extractedText,
        timestamp: Date.now(),
      };

      store.add(document);

      // Esperar a que la transacción complete
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      });
      LoggerService.info('Storage', `saved ${file.name} (${(arrayBuffer.byteLength / 1024).toFixed(1)}KB, texto ${extractedText.length} chars)`);
    } catch (error) {
      LoggerService.error('Storage', 'Error saving document to IndexedDB:', error);
    } finally {
      end();
    }
  }

  static async loadDocument(): Promise<{ file: File; extractedText: string } | null> {
    LoggerService.debug('Storage', 'loadDocument ...');
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const documents = request.result as StoredDocument[];
          if (documents.length > 0) {
            const latestDoc = documents[documents.length - 1];
            const file = new File([latestDoc.fileData], latestDoc.fileName, {
              type: latestDoc.fileType,
            });
            db.close();
            LoggerService.info('Storage', `loaded ${latestDoc.fileName} (texto ${latestDoc.extractedText.length} chars)`);
            resolve({ file, extractedText: latestDoc.extractedText });
          } else {
            db.close();
            LoggerService.debug('Storage', 'loadDocument -> null (sin docs)');
            resolve(null);
          }
        };
        request.onerror = () => {
          db.close();
          reject(request.error);
        };
      });
    } catch (error) {
      LoggerService.error('Storage', 'Error loading document from IndexedDB:', error);
      return null;
    }
  }

  static async clearDocuments(): Promise<void> {
    LoggerService.debug('Storage', 'clearDocuments ...');
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      store.clear();

      transaction.oncomplete = () => {
        db.close();
        LoggerService.info('Storage', 'documents cleared');
      };
    } catch (error) {
      LoggerService.error('Storage', 'Error clearing documents from IndexedDB:', error);
    }
  }

  static async hasStoredDocument(): Promise<boolean> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.count();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          db.close();
          resolve(request.result > 0);
        };
        request.onerror = () => {
          db.close();
          reject(request.error);
        };
      });
    } catch (error) {
      LoggerService.error('Storage', 'Error checking stored documents:', error);
      return false;
    }
  }
}
