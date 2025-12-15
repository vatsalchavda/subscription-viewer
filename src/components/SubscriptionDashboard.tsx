import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import * as amplitude from '@amplitude/analytics-browser';

interface SubscriptionData {
  status: string;
  planName: string;
  renewalDate: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  currency: string;
  status: string;
  pdfUrl: string | null;
} 

// Generate the client
const client = generateClient<Schema>();

export const SubscriptionDashboard = ({ userEmail }: { userEmail?: string }) => {
  const [subs, setSubs] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const isBillingReturn = new URLSearchParams(window.location.search).get('billing_return');
  if (isBillingReturn) { 
    // Attempt to close the tab immediately 
    // // (Works if the tab was opened by a script, which it was!) 
    window.close(); 
    
    // Fallback UI if browser blocks window.close() 
    return ( 
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        textAlign: 'center', 
        padding: '2rem' 
      }}> 
        <h2>Billing Updated</h2> 
        <p>You can now safely close this tab and return to your dashboard.</p> 
        <button 
          onClick={() => window.close()} 
          style={{ 
            marginTop: '1rem', 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#635bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }} 
        > 
          Close Tab 
        </button> 
      </div> 
    ); 
  }



  // 1. Fetch Subscription Status
  useEffect(() => {
    // Initialize Amplitude
    const amplitudeApiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;
    if (amplitudeApiKey) {
      amplitude.init(amplitudeApiKey, {
        defaultTracking: true,
      });
      amplitude.logEvent('Viewed Subscription Dashboard', { email: userEmail || 'unknown email' });
    }

    async function fetchSubscription() {
      try {
        const response = await client.queries.getSubscription();
        
        // Check if subs exists before parsing
        if (response.data) {
          setSubs(response.data as SubscriptionData[] || []);
        }

        // Fetch History
        const historyResponse = await client.queries.getBillingHistory();
        if (historyResponse.data) {
          const cleanHistory = (historyResponse.data as Invoice[]).map(invoice => ({
            ...invoice,
            pdfUrl: invoice.pdfUrl || '#'
          }));
          setInvoices(cleanHistory);
        }

      } catch (err) {
        console.error(err);
        setError('Could not load subscription details.');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [userEmail]);

  // Handle "Manage Billing"
  const handleManageBilling = async () => {
    // log clicked button event
    if (import.meta.env.VITE_AMPLITUDE_API_KEY) {
      amplitude.logEvent('Clicked Manage Billing');
    }

    try {
      const response = await client.queries.createPortalSession();
      if (response.data && response.data.url) {
        // window.location.href = response.data.url; Remove this to avoid browser history leaking.
        window.open(response.data.url, '_blank');
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

      <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #eee' }} />

      <h3>Billing History</h3>
      {invoices.length === 0 ? <p>No invoices found.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.9rem' }}>
          <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '0.5rem' }}>Date</th>
                  <th style={{ padding: '0.5rem' }}>Amount</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                  <th style={{ padding: '0.5rem' }}>Invoice</th>
              </tr>
          </thead>
          <tbody>
              {invoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{inv.date}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{inv.amount} {inv.currency}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textTransform: 'capitalize' }}>{inv.status}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                          {inv.pdfUrl && inv.pdfUrl !== '#' ? (
                              <a href={inv.pdfUrl} target="_blank" rel="noreferrer" style={{ color: '#635bff' }}>View PDF</a>
                          ) : '-'}
                      </td>
                  </tr>
              ))}
          </tbody>
        </table>
      )}
    </div> 
  );
};