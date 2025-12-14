# Subscription Viewer


A modern web application for authenticated users to view their subscription status and billing history, integrated with Stripe and AWS Amplify. Built for demonstration and rapid prototyping, it provides a simple dashboard for managing and viewing subscription data.

**Live Demo:** [https://main.d73xdtsqfyvnp.amplifyapp.com/](https://main.d73xdtsqfyvnp.amplifyapp.com/)

---

## Table of Contents
- [Introduction](#introduction)
- [Architecture Decisions](#architecture-decisions)
- [Assumptions](#assumptions)
- [Running the App Locally (WSL/Linux)](#running-the-app-locally-wsllinux)
- [Testing Strategy](#testing-strategy)
- [Areas for Improvement](#areas-for-improvement)
- [Deployment Process](#deployment-process)
- [Security Considerations](#security-considerations)
- [Contribution Guidelines](#contribution-guidelines)

---

## Introduction

**Subscription Viewer** is a React-based dashboard that allows authenticated users to:
- View their current subscription status and plan details
- See recent billing history and download invoices
- Access the Stripe billing portal for self-service management

The project is designed for easy local development using AWS Amplify (with sandbox), Stripe, and a modern React frontend. It is ideal for rapid prototyping, or as a starting point for more complex SaaS billing dashboards.

---

## Architecture Decisions

- **Frontend**: React (Vite) with AWS Amplify UI for authentication and API integration.
- **Backend**: AWS Amplify Functions written in **Node.js/TypeScript** for serverless business logic, including:
	- `get-subscription`: Fetches subscription status from Stripe
	- `get-billing-history`: Fetches recent invoices from Stripe
	- `create-portal-session`: Creates a Stripe billing portal session
- **Authentication**: Cognito User Pool (email login only, no sign-up UI)
- **API/Data Layer**: Amplify Data (GraphQL) exposes backend functions securely to authenticated users
- **Analytics**: Amplitude (browser analytics)
- **Local Development**: Designed for WSL/Linux, using Amplify sandbox for rapid iteration

---

## Assumptions

- **Single Demo User**: The app uses a default Stripe customer ID (set via environment variable) for all API calls. There is no user-specific Stripe mapping or sign-up flow.
- **No Sign-Up Flow**: Only login with email is enabled; user registration is not exposed in the UI.
- **No Persistent App Database**: All subscription/billing data is fetched live from Stripe; no local DB is used.
- **No Webhook Handling**: The app does not listen for Stripe webhooks or update state based on external events.
- **Local-Only/Prototype**: The app is intended for demo or learning purposes. While it is deployed and accessible at [the live demo URL](https://main.d73xdtsqfyvnp.amplifyapp.com/), it is not production-hardened and should not be used for sensitive or real customer data without further improvements.

---

## Running the App Locally (WSL/Linux)

- Node.js v20.x (recommended)
- npm
- WSL2 (or native Linux)
- AWS account (for Amplify sandbox)
- Stripe account (for API keys)


### Environment Variables

You will need to set up several environment variables and secrets for both the backend and frontend. Follow these steps:

#### 1. Stripe Setup

- **Create a Stripe account** (https://dashboard.stripe.com/register) if you don't have one.
- **Create a test customer:**
	1. Go to the Stripe Dashboard → Customers → Add customer.
	2. Fill in the details and save. Copy the **Customer ID** (e.g., `cus_123...`).
- **Get your Stripe Secret Key:**
	1. Go to Developers → API keys in the Stripe Dashboard.
	2. Copy the **Secret key** (starts with `sk_test_...`).
	3. Never share or commit this key.

#### 2. Amplitude Setup (for Analytics)

- **Create an Amplitude account** (https://analytics.amplitude.com/signup) if you don't have one.
- **Create a new project** and copy the **API Key** from the project settings.

#### 3. Set Environment Variables

Set the following secrets in your Amplify backend (see `amplify/functions/*/resource.ts`):
- `STRIPE_SECRET_KEY`: Your Stripe secret API key (from above)
- `DEFAULT_STRIPE_CUSTOMER_ID`: The Stripe customer ID you created
- `STRIPE_BILLING_PORTAL_RETURN_URL`: (optional) URL to return to after billing portal (default: `http://localhost:5173`)

For local frontend development, create a `.env` file in the project root (this file is gitignored and will not be pushed to GitHub):

```
VITE_AMPLITUDE_API_KEY=your-amplitude-api-key
```

This key is required for analytics to work locally.

### Setup Steps

1. **Clone the repository**
	```sh
	git clone https://github.com/vatsalchavda/subscription-viewer.git
	cd subscription-viewer
	```
2. **Install dependencies**
	```sh
	npm install
	```
3. **Configure Amplify sandbox**
	```sh
	npm install -g @aws-amplify/backend-cli
	amplify sandbox
	```
	- Follow prompts to set up backend and secrets.
	- **Let the sandbox finish initializing and keep it running.**
	- When successful, you will see output like `Amplify backend running at ...` in the terminal.
4. **Start the development server (in a new terminal)**
	```sh
	npm run dev
	```
	- The app will open at http://localhost:5173
	- **Keep the Amplify sandbox running in the original terminal.**

### Developer Notes
- The app is optimized for WSL/Linux. Windows users should use WSL2 for best results.
- All backend logic is in `amplify/functions/` and exposed via Amplify Data API.
- Frontend code is in `src/`.

---

## Testing Strategy

- **Current State**: No automated tests are included yet.
- **Recommended**:
  - Add unit tests for backend functions (e.g., using Jest)
  - Add integration tests for API endpoints
  - Add frontend tests (React Testing Library, Cypress for E2E)

---

## Areas for Improvement

- **Webhook Handling**: Listen for Stripe webhook events (e.g., `invoice.paid`, `customer.subscription.updated`) and update subscription status in a local DB or in-memory cache.
- **User-Specific Data**: Map Cognito users to Stripe customers for true multi-user support.
- **Persistent Database**: Store subscription and billing data in a database for audit/history.
- **Production Hardening**: Add error handling, logging, and security best practices, such as:
	- Use environment variables for all secrets (never hardcode keys)
	- Enable HTTPS everywhere
	- Validate and sanitize all user input
	- Implement proper CORS policies
	- Use least-privilege IAM roles for backend functions
	- Monitor and log errors securely
	- Regularly update dependencies
- **Testing**: Implement unit, integration, and E2E tests.
- **Sign-Up Flow**: Add user registration and onboarding.
- **UI/UX**: Improve dashboard design and add more subscription management features.

---

## Deployment Process


- The app is deployed and accessible at [https://main.d73xdtsqfyvnp.amplifyapp.com/](https://main.d73xdtsqfyvnp.amplifyapp.com/).
- Deployment is managed via AWS Amplify Console, which connects to the GitHub repository and automatically builds and deploys on push.
- Set environment variables and secrets in the Amplify Console for production deployments.
- Update CORS and authentication settings as needed for your deployment target.

---

## Security Considerations

- **Secrets Management**: Never commit API keys or secrets to source control. Use Amplify secrets for backend functions.
- **Authentication**: Only authenticated users can access the dashboard and API.
- **API Exposure**: All backend functions are protected by Cognito authentication.
- **Stripe Keys**: Use restricted keys and follow Stripe security best practices.

---

## Contribution Guidelines

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Write clear, concise commit messages
4. Open a pull request with a detailed description
5. Ensure your code follows project conventions and is well-documented

---

## Additional Topics to Consider
- **Testing and Coverage Reports**
- **CI/CD Pipeline Setup**
- **Monitoring and Analytics**
- **Internationalization (i18n)**
- **Accessibility (a11y)**