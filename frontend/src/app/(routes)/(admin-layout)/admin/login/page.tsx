import { Suspense } from 'react';
import AdminLogin from '@/components/pages/admin/login';

export const metadata = { title: 'Yönetici Girişi' };

export default function AdminLoginRoute() {
    return (
        <Suspense>
            <AdminLogin />
        </Suspense>
    );
}