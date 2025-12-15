import { Authenticator } from '@aws-amplify/ui-react';
import { SubscriptionDashboard } from './components/SubscriptionDashboard';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h1>Dashboard</h1>
            <button onClick={signOut} style={{ padding: '0.5rem 1rem' }}>Sign out</button>
          </header>
          
          {/* Main Subscription Content */}
          <SubscriptionDashboard userEmail={user?.signInDetails?.loginId} />
        </main>
      )}
    </Authenticator>
  );
}

export default App;