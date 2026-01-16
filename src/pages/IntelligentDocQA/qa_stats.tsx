import FileManager from '@/components/ui/FileManager';
import '@/assets/styles/qa-status.css';

function QAStats() {
  return (
    <div className="min-h-screen bg-white">
      <header className="status-header">
        <h1>File Management</h1>
      </header>
      <FileManager />
    </div>
  );
};

export default QAStats;