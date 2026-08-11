interface StoredDocument {
  fileName: string;
  fileType: string;
  fileData: ArrayBuffer;
  extractedText: string;
  timestamp: number;
}

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
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      // Limpiar documentos anteriores en la misma transacción
      const clearRequest = store.clear();
      
      await new Promise<void>((resolve, reject) => {
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      });

      // Convertir archivo a ArrayBuffer dentro de la transacción
      const arrayBuffer = await file.arrayBuffer();
      
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
    } catch (error) {
      console.error('Error saving document to IndexedDB:', error);
    }
  }

  static async loadDocument(): Promise<{ file: File; extractedText: string } | null> {
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
            resolve({ file, extractedText: latestDoc.extractedText });
          } else {
            db.close();
            resolve(null);
          }
        };
        request.onerror = () => {
          db.close();
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error loading document from IndexedDB:', error);
      return null;
    }
  }

  static async clearDocuments(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      store.clear();

      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      console.error('Error clearing documents from IndexedDB:', error);
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
      console.error('Error checking stored documents:', error);
      return false;
    }
  }
}
