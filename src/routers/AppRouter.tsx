import { Routes, Route } from 'react-router-dom';
import Home from '@/components/ui/Home';
import Login from '@/pages/Login/login';
import QA from '@/pages/IntelligentDocQA/QA';
import Room from '@/pages/EnterpriseShowroom/room';
import QAList from '@/pages/IntelligentDocQA/qa_list';
import QAStats from '@/pages/IntelligentDocQA/qa_stats';
import MainLayout from '@/components/layout/MainLayout';
function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/qa" element={
        <MainLayout>
          <QA />
        </MainLayout>
      } />

      <Route path="/qa/list" element={
        <MainLayout>
          <QAList />
        </MainLayout>
      } />

      <Route path="/qa/stats" element={
        <MainLayout>
          <QAStats />
        </MainLayout>
      } />
      <Route path="/room" element={<Room />} />
    </Routes>
  );
}

export default AppRouter;