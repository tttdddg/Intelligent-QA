import ToolBar from '@/components/ui/ToolBar'; 
import FileList from '@/components/ui/FileList';

function FileManager() {
  return (
    <div className="file=manager">
        <ToolBar />
        <FileList />
    </div>
  );
}

export default FileManager;