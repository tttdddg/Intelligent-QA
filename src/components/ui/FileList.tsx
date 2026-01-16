import { FileText, Image, Film, Trash2, Download, Folder, ChevronLeft, Plus } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import useFileHub from '@/hooks/useFileHub';
import { fmtSize } from '@/utils/file';

const iconMap: any = {
  PDF: <FileText size={20} />,
  PSD: <FileText size={20} />,
  JPG: <Image size={20} />,
  MP3: <Film size={20} />,
  MP4: <Film size={20} />,
  DOC: <FileText size={20} />,
  XLS: <FileText size={20} />,
};

function FileList() {
  const {
    folders,
    files,
    currentFolderId,
    setCurrentFolderId,
    deleteItem,
    handleDownload,
    search,
    uploadFiles,
    openFile,
    allFolders,
    getFolderName,
    forceUpdate,
  } = useFileHub();

  // 添加本地状态来强制重新渲染
  const [localRenderKey, setLocalRenderKey] = useState(0);

  // 详细调试信息
  useEffect(() => {
    console.log('=== FILELIST 关键状态 ===');
    console.log('🔍 接收到的搜索词:', `"${search}"`);
    console.log('🔍 搜索词长度:', search.length);
    console.log('🔍 搜索词去除空格:', `"${search.trim()}"`);
    console.log('🔍 是否有有效搜索:', !!search && search.trim() !== '');
    console.log('🔍 当前文件夹ID:', currentFolderId);
    console.log('🔍 显示的文件夹数量:', folders.length);
    console.log('🔍 显示的文件数量:', files.length);
    console.log('🔍 forceUpdate:', forceUpdate);
    console.log('🔍 localRenderKey:', localRenderKey);
    console.log('=== 状态结束 ===');
  }, [search, currentFolderId, folders, files, forceUpdate, localRenderKey]);

  // 监听搜索变化，强制重新渲染
  useEffect(() => {
    if (search && search.trim() !== '') {
      console.log('🎯 检测到搜索词变化，强制重新渲染');
      setLocalRenderKey(prev => prev + 1);
    }
  }, [search]);

  const folderInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const onFolderPlusClick = (folderId: string) => {
    folderInputRefs.current[folderId]?.click();
  };

  const onFolderFileSelected = (e: React.ChangeEvent<HTMLInputElement>, folderId: string) => {
    if (!e.target.files?.length) return;
    uploadFiles(e.target.files, folderId);
    e.target.value = '';
  };

  // 渲染文件夹卡片
  const renderFolderCard = (folder: any) => (
    <div key={folder.id} className="folder-card">
      <div className="folder-main" onClick={() => setCurrentFolderId(folder.id)}>
        <div className="folder-icon">
          <Folder size={32} />
        </div>
        <div className="folder-info">
          <h3 className="folder-name">{folder.name}</h3>
          <div className="folder-details">
            <span>{folder.fileCount} 个项目</span>
          </div>
        </div>
      </div>

      <div className="folder-actions">
        <button
          className="icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(folder);
          }}
          title="下载文件夹"
        >
          <Download size={16} />
        </button>
        <button
          className="icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            deleteItem(folder.id);
          }}
          title="删除文件夹"
        >
          <Trash2 size={16} />
        </button>
        <button
          className="icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            onFolderPlusClick(folder.id);
          }}
          title="上传文件到文件夹"
        >
          <Plus size={16} />
        </button>
      </div>

      <input
        ref={(el) => { folderInputRefs.current[folder.id] = el; }}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => onFolderFileSelected(e, folder.id)}
      />
    </div>
  );

  // 渲染文件卡片
  const renderFileCard = (file: any) => (
    <div key={file.id} className="file-card" onClick={() => openFile(file)}>
      <div className="file-icon">
        {iconMap[file.type] || <FileText size={20} />}
      </div>
      <div className="file-info">
        <h3 className="file-name">{file.name}</h3>
        <div className="file-details">
          <span className="file-folder" onClick={(e) => e.stopPropagation()}>
            所属文件夹: {getFolderName(file.folderId)}
          </span>
          <span>{file.type}</span>
          <span>{file.size ? fmtSize(file.size) : '-'}</span>
          <span>{file.date}</span>
        </div>
      </div>
      <div className="file-actions">
        <button
          className="icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(file);
          }}
          title="下载文件"
        >
          <Download size={16} />
        </button>
        <button
          className="icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            deleteItem(file.id);
          }}
          title="删除文件"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
 
  const containerKey = `filelist-${search}-${currentFolderId}-${forceUpdate}-${localRenderKey}`;
  
  console.log('🎯 最终渲染决策:');
  console.log('  - 容器Key:', containerKey);
  console.log('  - 搜索词:', `"${search}"`);
  console.log('  - 是否有搜索:', !!search && search.trim() !== '');
  console.log('  - 进入模式:', 
    search && search.trim() !== '' ? '搜索模式' : 
    currentFolderId ? '文件夹模式' : '根目录模式'
  );

  // 如果有搜索词，强制显示搜索结果
  if (search && search.trim() !== '') {
    console.log('🚀 进入搜索模式显示');
    return (
      <div key={containerKey} className="file-grid-container">
        {/* 调试 */}
        <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px' }}>
    <button onClick={() => setLocalRenderKey(prev => prev + 1)}>
      强制刷新 (调试用)
    </button>
    <span style={{ marginLeft: '10px' }}>
      搜索词: "{search}", 模式: {search && search.trim() !== '' ? '搜索' : currentFolderId ? '文件夹' : '根目录'}
    </span>
  </div>

        <div className="folder-header">
          <h2>搜索结果: "{search}"</h2>
          <div className="folder-count">
            找到 {folders.length} 个文件夹和 {files.length} 个文件
          </div>
        </div>
        
        {folders.length > 0 && (
          <div className="search-section">
            <h3>匹配的文件夹 ({folders.length})</h3>
            <div className="folders-grid">
              {folders.map(renderFolderCard)}
            </div>
          </div>
        )}
        
        {files.length > 0 && (
          <div className="search-section">
            <h3>匹配的文件 ({files.length})</h3>
            <div className="files-grid">
              {files.map(renderFileCard)}
            </div>
          </div>
        )}
        
        {folders.length === 0 && files.length === 0 && (
          <div className="no-results">没有找到匹配的项目</div>
        )}
      </div>
    );
  }

  // 文件夹模式
  if (currentFolderId) {
    const currentFolder = allFolders.find(f => f.id === currentFolderId);
    const folderFiles = files.filter(f => f.folderId === currentFolderId);
    
    return (
      <div key={containerKey} className="file-grid-container">
        <div className="folder-header">
          <button className="back-button" onClick={() => setCurrentFolderId(null)}>
            <ChevronLeft size={20} />
            返回
          </button>
          <h2>{currentFolder?.name}</h2>
          <div className="folder-summary">
            <span>{folderFiles.length} 个项目</span>
          </div>
        </div>

        <div className="files-grid">
          {folderFiles.map(renderFileCard)}
        </div>
      </div>
    );
  }

  // 根目录模式
  console.log('📁 进入根目录模式显示');
  return (
    <div key={containerKey} className="file-grid-container">
      <div className="folder-header">
        <div className="folder-count">共 {folders.length} 个文件夹</div>
      </div>
      <div className="folders-grid">
        {folders.map(renderFolderCard)}
      </div>
    </div>
  );
}

export default FileList;