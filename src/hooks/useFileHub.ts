import { useState, useMemo, useEffect, useCallback } from 'react';

export interface FolderItem {
  id: string;
  name: string;
  fileCount: number;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size?: number;
  date: string;
  folderId: string;
}

class FileDB {
  private dbName = 'FileHubDB';
  private version = 3;
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建文件数据存储
        if (!db.objectStoreNames.contains('files')) {
          const store = db.createObjectStore('files', { keyPath: 'id' });
          store.createIndex('folderId', 'folderId', { unique: false });
        }
        
        // 创建元数据存储
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }

        // 创建文件夹存储
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' });
        }
      };
    });
  }

  async saveFile(file: File, fileItem: FileItem): Promise<void> {
    const db = await this.init();
    
    // 先将文件读取为ArrayBuffer
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });

    // 在事务中保存文件数据
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      
      const fileData = {
        ...fileItem,
        data: arrayBuffer,
        mimeType: file.type,
        lastModified: file.lastModified
      };
      
      const request = store.put(fileData);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getFile(fileId: string): Promise<File | null> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(fileId);
      
      request.onsuccess = () => {
        const fileData = request.result;
        if (fileData && fileData.data) {
          const file = new File([fileData.data], fileData.name, { 
            type: fileData.mimeType,
            lastModified: fileData.lastModified || Date.now()
          });
          resolve(file);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.delete(fileId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // 元数据操作方法
  async saveMetadata(files: FileItem[]): Promise<void> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      
      const request = store.put({ key: 'files', value: files });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getMetadata(): Promise<FileItem[] | null> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get('files');
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // 文件夹操作方法
  async saveFolders(folders: FolderItem[]): Promise<void> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['folders'], 'readwrite');
      const store = transaction.objectStore('folders');
      
      // 先清空再保存
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        const requests = folders.map(folder => store.put(folder));
        
        Promise.all(requests.map(req => 
          new Promise((res, rej) => {
            req.onsuccess = res;
            req.onerror = rej;
          })
        )).then(() => resolve()).catch(reject);
      };
      clearRequest.onerror = () => reject(clearRequest.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getFolders(): Promise<FolderItem[] | null> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['folders'], 'readonly');
      const store = transaction.objectStore('folders');
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result.length > 0 ? request.result : null);
      };
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

const fileDB = new FileDB();

const initialFolders: FolderItem[] = [
  { id: '1', name: '企业文化', fileCount: 0 },
  { id: '2', name: '内部管理与沟通', fileCount: 0},
  { id: '3', name: '研发与技术', fileCount: 0 },
  { id: '4', name: '项目与流程', fileCount: 0 },
  { id: '5', name: '对外与客户', fileCount: 0 },
  { id: '6', name: '财务与合规', fileCount: 0 },
  { id: '7', name: 'AI效率办公', fileCount: 0},
];

const initialFiles: FileItem[] = [
  // { id: 'file-f1', name: 'User Survey Report', type: 'PDF', size: 3388, date: '2023-05-12', folderId: '1' },
  // { id: 'file-f2', name: 'Design Draft', type: 'PSD', size: 63310, date: '2023-06-18', folderId: '1' },
  // { id: 'file-f3', name: 'Design Draft.jpg', type: 'JPG', size: 1380, date: '2023-06-19', folderId: '3' },
];

function useFileHub() {
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [renderKey,setRenderKey]=useState(0);
  const [forceUpdate,setForceUpdate]=useState(0);

 const getFolderName = (folderId: string) => {
    const folder = allFolders.find(f => f.id === folderId);
    return folder ? folder.name : '未知文件夹';
  };

  // 初始化：从IndexedDB加载所有数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [metadata, folders] = await Promise.all([
          fileDB.getMetadata(),
          fileDB.getFolders()
        ]);

        if (metadata) {
          console.log('从IndexedDB恢复文件元数据:', metadata.length);
          setAllFiles(metadata);
        } else {
          console.log('使用初始文件');
          setAllFiles(initialFiles);
          await fileDB.saveMetadata(initialFiles);
        }

        if (folders) {
          console.log('从IndexedDB恢复文件夹数据:', folders.length);
          setAllFolders(folders);
        } else {
          console.log('使用初始文件夹');
          setAllFolders(initialFolders);
          await fileDB.saveFolders(initialFolders);
        }
      } catch (error) {
        console.error('从IndexedDB加载数据失败:', error);
        setAllFiles(initialFiles);
        setAllFolders(initialFolders);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 保存文件元数据到IndexedDB
  const saveFilesMetadata = async (files: FileItem[]) => {
    try {
      await fileDB.saveMetadata(files);
      console.log('保存文件元数据到IndexedDB:', files.length, '个文件');
    } catch (error) {
      console.error('保存文件元数据到IndexedDB失败:', error);
    }
  };

  // 保存文件夹数据到IndexedDB
  const saveFoldersData = async (folders: FolderItem[]) => {
    try {
      await fileDB.saveFolders(folders);
      console.log('保存文件夹数据到IndexedDB:', folders.length, '个文件夹');
    } catch (error) {
      console.error('保存文件夹数据到IndexedDB失败:', error);
    }
  };

  const filteredFiles = useMemo(() => {
  if (!search || search.trim() === '') return allFiles;
  
  const s = search.toLowerCase().trim();
  console.log('🔍 文件过滤 - 搜索词:', s);
  console.log('🔍 文件过滤 - 所有文件数量:', allFiles.length);
  
  const result = allFiles.filter(f => 
    f.name.toLowerCase().includes(s) || 
    f.type.toLowerCase().includes(s) ||
    getFolderName(f.folderId).toLowerCase().includes(s)
  );
  
  console.log('🔍 文件过滤 - 过滤后数量:', result.length);
  return result;
}, [allFiles, search, getFolderName]);

const filteredFolders = useMemo(() => {
  if (!search || search.trim() === '') return allFolders;
  
  const s = search.toLowerCase().trim();
  console.log('🔍 文件夹过滤 - 搜索词:', s);
  console.log('🔍 文件夹过滤 - 所有文件夹数量:', allFolders.length);
  
  const result = allFolders.filter(f => f.name.toLowerCase().includes(s));
  
  console.log('🔍 文件夹过滤 - 过滤后数量:', result.length);
  console.log('🔍 文件夹过滤 - 过滤后内容:', result.map(f => f.name));
  return result;
}, [allFolders, search]);

   useEffect(() => {
    if (search && search.trim() !== '') {
      console.log('搜索关键词:', search);
      console.log('所有文件夹:', allFolders.map(f => f.name));
      console.log('过滤后的文件夹:', filteredFolders.map(f => f.name));
      console.log('所有文件:', allFiles.map(f => f.name));
      console.log('过滤后的文件:', filteredFiles.map(f => f.name));
    }
  }, [search, allFolders, allFiles, filteredFolders, filteredFiles]);

  const uploadFiles = async (fileList: FileList, folderId: string | null = null) => {
    if (isLoading) return [];
    
    const targetFolderId = folderId || 'root';
    const newFiles: FileItem[] = [];

    for (const rawFile of Array.from(fileList)) {
      try {
        const item: FileItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: rawFile.name,
          type: rawFile.name.split('.').pop()?.toUpperCase() || 'FILE',
          size: rawFile.size,
          date: new Date().toISOString().split('T')[0],
          folderId: targetFolderId,
        };
        
        console.log('开始保存文件到IndexedDB:', item.name);
        await fileDB.saveFile(rawFile, item);
        console.log('文件保存成功:', item.name);
        
        newFiles.push(item);
      } catch (error) {
        console.error('文件上传失败:', error);
      }
    }

    if (newFiles.length === 0) return [];

    const updatedFiles = [...allFiles, ...newFiles];
    setAllFiles(updatedFiles);
    
    // 更新文件夹文件计数
    if (folderId) {
      const updatedFolders = allFolders.map(f => 
        f.id === folderId ? { ...f, fileCount: f.fileCount + newFiles.length } : f
      );
      setAllFolders(updatedFolders);
      
      // 保存所有数据到IndexedDB
      await Promise.all([
        saveFilesMetadata(updatedFiles),
        saveFoldersData(updatedFolders)
      ]);
    } else {
      await saveFilesMetadata(updatedFiles);
    }
    
    return newFiles;
  };

  const openFile = async (file: FileItem) => {
    try {
      const fileData = await fileDB.getFile(file.id);
      if (!fileData) {
        alert('文件未找到或已损坏');
        return;
      }

      const url = URL.createObjectURL(fileData);
      const canPreview = /^(image|application\/pdf|video)/i.test(fileData.type);
      
      if (canPreview) {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
      }
      
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      console.error('打开文件失败:', error);
      alert('无法打开文件');
    }
  };

  const deleteItem = async (id: string) => {
    if (isLoading) return;
    
    console.log('删除项目:', id);
    
    if (id.startsWith('file-')) {
      try {
        await fileDB.deleteFile(id);
      } catch (error) {
        console.warn('从IndexedDB删除文件失败:', error);
      }
      
      const updatedFiles = allFiles.filter(f => f.id !== id);
      setAllFiles(updatedFiles);
      await saveFilesMetadata(updatedFiles);
      
    } else {
      // 删除文件夹及其内部文件
      const filesToDelete = allFiles.filter(f => f.folderId === id);
      
      for (const file of filesToDelete) {
        try {
          await fileDB.deleteFile(file.id);
        } catch (error) {
          console.warn('删除文件失败:', file.name, error);
        }
      }
      
      const updatedFiles = allFiles.filter(f => f.folderId !== id);
      const updatedFolders = allFolders.filter(f => f.id !== id);
      
      setAllFiles(updatedFiles);
      setAllFolders(updatedFolders);
      
      await Promise.all([
        saveFilesMetadata(updatedFiles),
        saveFoldersData(updatedFolders)
      ]);
    }
  };

const handleDownload = async (item: FolderItem | FileItem) => {
    try {
       console.log('handleDownload被调用，项目类型:', 'folderId' in item ? '文件夹' : '文件');
       console.log('项目详情:', item);

      if ('fileCount' in item) {
        console.log('开始下载文件夹:', item.name);
        
        const folderFiles = allFiles.filter(file => file.folderId === item.id);
        
        if (folderFiles.length === 0) {
          alert('文件夹为空，无法下载');
          return;
        }

        // 逐个下载文件
        for (const fileItem of folderFiles) {
          try {
            const fileData = await fileDB.getFile(fileItem.id);
            if (fileData) {
              const url = URL.createObjectURL(fileData);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileItem.name;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              
              // 稍微延迟释放URL，确保下载开始
              setTimeout(() => URL.revokeObjectURL(url), 100);
            }
          } catch (error) {
            console.error(`下载文件 ${fileItem.name} 失败:`, error);
          }
        }
        
        console.log('文件夹下载完成:', item.name);
        
      } else {
        // 下载单个文件
        console.log('开始下载文件:', item.name);
        const fileData = await fileDB.getFile(item.id);
        if (fileData) {
          const url = URL.createObjectURL(fileData);
          const a = document.createElement('a');
          a.href = url;
          a.download = item.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          setTimeout(() => URL.revokeObjectURL(url), 100);
          console.log('文件下载完成:', item.name);
        } else {
          alert('文件未找到或已损坏');
        }
      }
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  const addFolder = async (name: string) => {
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name,
      fileCount: 0,
    };
    const updatedFolders = [...allFolders, newFolder];
    setAllFolders(updatedFolders);

    try{
      await fileDB.saveFolders(updatedFolders);
      console.log('保存文件夹数据到IndexedDB:', updatedFolders.length, '个文件夹');
    }catch(error){
      console.error('保存文件夹数据到IndexedDB失败:', error);
      setAllFolders(updatedFolders);
    }
    setSearch('');
  };

//  const currentFolderFiles = useMemo(() => {
//     return allFiles.filter(f => currentFolderId ? f.folderId === currentFolderId : f.folderId === 'root');
//   }, [allFiles, currentFolderId]);

  const stableSetSearch=useCallback((value:string)=>{
    setSearch(value);
    setForceUpdate(prev=>prev+1);
    // setRenderKey(prev=>prev+1);
  },[]);

    const result = useMemo(() => {
    const hasSearch = search && search.trim() !== '';
    
    console.log('🔄 useFileHub 返回对象:', {
      hasSearch,
      searchValue: `"${search}"`,
      foldersCount: hasSearch ? filteredFolders.length : allFolders.length,
      filesCount: hasSearch ? filteredFiles.length : allFiles.length
    });
    
     return {
      folders: hasSearch ? filteredFolders : allFolders,
      files: hasSearch ? filteredFiles : allFiles,
      currentFolderId,
      setCurrentFolderId,
      search,
      setSearch: stableSetSearch,
      deleteItem,
      handleDownload,
      addFolder,
      uploadFiles,
      openFile,
      currentFolderFiles: allFiles.filter(f => 
        currentFolderId ? f.folderId === currentFolderId : f.folderId === 'root'
      ),
      allFolders,
      isLoading,
      getFolderName,
      forceUpdate,
    };
  }, [
    search, 
    filteredFolders, 
    filteredFiles, 
    allFolders, 
    allFiles, 
    currentFolderId,
    forceUpdate,
    stableSetSearch,
    deleteItem,
    handleDownload,
    addFolder,
    uploadFiles,
    openFile,
    isLoading,
    getFolderName,
  ]);

  return result;
}

export default useFileHub;
export {FileDB};