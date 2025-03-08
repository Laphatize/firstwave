import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrganizationOnboarding from './OrganizationOnboarding';

export default function RequireOrganization({ children }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchOrganizations = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
        } else {
          // If the response is not ok (e.g. 401), redirect to login
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-neutral-800" />
          <div className="h-4 w-32 bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <OrganizationOnboarding onOrganizationCreated={() => {
          // Refresh the page to refetch organizations
          window.location.reload();
        }} />
      </div>
    );
  }

  return children;
} 