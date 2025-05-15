import DashboardLayout from '@/components/layouts/dashboard/DashboardLayout';
import ProtectedRoute from '@/lib/auth/protected-route';

export const metadata = {
  title: 'Energy Monitor Dashboard',
  description: 'Energy consumption monitoring system dashboard',
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
