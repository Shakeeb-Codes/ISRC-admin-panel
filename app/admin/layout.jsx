import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

export const metadata = {
  title: 'Admin Panel - NGO',
  description: 'Manage your NGO content and media',
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}