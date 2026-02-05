import { FolderPlus } from 'lucide-react';
import useFileHub from '@/hooks/useFileHub';

export default function Toolbar() {
  try {
    const { addFolder, allFolders } = useFileHub();
    // const fileRef = useRef<HTMLInputElement>(null);

    const onFolder = () => {
      const name = prompt('新建文件夹名称:');
      if (name && name.trim()) {
        addFolder(name.trim());
        console.log('当前文件夹总数:', allFolders.length + 1);
      }
    };

    // const onUpload = () => {
    //   fileRef.current?.click();
    // };

    // const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   if (!e.target.files || e.target.files.length === 0) return;
    //   console.log('[Toolbar] 选中文件数:', e.target.files.length);
    //   console.log('[Toolbar] 当前文件夹id:', currentFolderId);
    //   uploadFiles(e.target.files, currentFolderId);
    //   e.target.value = '';
    //   // 移除这行：setSearch(''); // 不要在这里清空搜索
    // };

    // const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   try {
    //     const value = e.target.value;
    //     console.log('搜索输入:', value);
    //     setSearch(value); // 直接设置搜索值
    //   } catch (error) {
    //     console.error('搜索输入处理错误:', error);
    //   }
    // };

    return (
      <div className="toolbar">
        <div className="toolbar-left">
          <button onClick={onFolder}>
            <FolderPlus size={18} /> 新建文件夹
          </button>
          {/* <button onClick={onUpload}>
            <Upload size={18} /> 上传文件
          </button> */}
        </div>
        <div className="toolbar-right">
          {/* <Search size={18} /> */}
          {/* <input
            placeholder="搜索文件夹或文件…"
            value={search}
            onChange={handleSearchChange}
          /> */}
        </div>
        {/* <input
          ref={fileRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        /> */}
      </div>
    );
  } catch (error) {
    console.error('Toolbar 组件错误:', error);
    return <div>Toolbar 加载失败</div>;
  }
}