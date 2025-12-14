import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/subs/resource';

interface SubscriptionData {
  status: string;
  planName: string;
  renewalDate: string;
}

// Generate the client
const client = generateClient<Schema>();

export const SubscriptionDashboard = ({ userEmail }: { userEmail?: string }) => {
  const [subs, setSubs] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch Subscription Status
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await client.queries.getSubscription();
        
        // Check if subs exists before parsing
        if (response.data) {
          setSubs(response.data as SubscriptionData[] || []);
        }
      } catch (err) {
        console.error(err);
        setError('Could not load subscription details.');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  // 2. Handle "Manage Billing"
  const handleManageBilling = async () => {
    try {
      const response = await client.queries.createPortalSession();
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Billing redirect failed', err);
      alert('Failed to redirect to billing portal.');
    }
  };

  if (loading) return <p>Loading subscription details...</p>; 
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return ( 
    <div style={{ maxWidth: '600px', margin: '0 auto' }}> 
      <h2>Your Subscriptions</h2> 
      {/* CHANGE: Map through the array */} 
      {subs.length === 0 ? ( 
        <p>No active subscriptions found.</p> 
      ) : ( 
        subs.map((sub, index) => ( 
          <div key={index} style={{ 
            border: '1px solid #ccc', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            marginBottom: '1rem', 
            backgroundColor: '#f9f9f9' 
          }}> 
            <p><strong>Plan:</strong> {sub.planName}</p> 
            <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{sub.status}</span></p> 
            <p><strong>Renewal/End Date:</strong> {sub.renewalDate}</p> 
          </div> 
        )) 
      )} 
      
      <button 
        onClick={handleManageBilling} 
        style={{ 
          backgroundColor: '#635bff', 
          color: 'white', 
          border: 'none', 
          padding: '0.75rem 1.5rem', 
          borderRadius: '4px', 
          cursor: 'pointer', 
          marginTop: '1rem' 
        }} 
      > 
        Manage Billing 
      </button> 
    </div> 
  );
};
