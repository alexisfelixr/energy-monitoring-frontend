import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to the monitoring page by default
  redirect('/dashboard/monitoring');
}
