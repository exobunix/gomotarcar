// GoMotarCar — k6 Load Test (500-1000 Users)
// Run: k6 run load-tests/k6-load-test.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

const errorRate = new Rate('errors');
const apiTrend = new Trend('api_duration');

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Warm-up: 100 users
    { duration: '2m', target: 500 },   // Load: 500 users
    { duration: '3m', target: 1000 },  // Peak: 1000 users
    { duration: '1m', target: 500 },   // Scale down
    { duration: '30s', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.05'],
  },
};

const params = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AUTH_TOKEN}`,
  },
};

// Simulates reading homepage data
function simulateHomepage() {
  group('Homepage API Calls', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/search?q=car+wash&type=services`, params);
    apiTrend.add(Date.now() - start);
    check(res, { 'search: status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(0.5);
  });
}

// Simulates subscription browsing
function simulateSubscriptions() {
  group('Subscription API Calls', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/subscriptions/packages`, params);
    apiTrend.add(Date.now() - start);
    check(res, { 'packages: status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(0.5);
  });
}

// Simulates viewing FAQs
function simulateFAQs() {
  group('FAQ API Calls', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/search?q=cleaning&type=faqs`, params);
    apiTrend.add(Date.now() - start);
    check(res, { 'faqs: status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(0.5);
  });
}

// Simulates admin analytics dashboard
function simulateAnalytics() {
  group('Analytics API Calls', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/analytics/dashboard`, params);
    apiTrend.add(Date.now() - start);
    check(res, { 'analytics: status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(1);
  });
}

// Simulates CRM operations
function simulateCRM() {
  group('CRM API Calls', () => {
    let res = http.get(`${BASE_URL}/complaints/stats`, params);
    check(res, { 'complaint stats: status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(0.3);

    res = http.get(`${BASE_URL}/subscriptions/stats`, params);
    check(res, { 'subscription stats: status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(0.3);

    res = http.get(`${BASE_URL}/payments/stats`, params);
    check(res, { 'payment stats: status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(0.3);
  });
}

export default function () {
  // Simulate different user types with weighted actions
  const action = Math.random();

  if (action < 0.3) simulateHomepage();
  else if (action < 0.5) simulateSubscriptions();
  else if (action < 0.65) simulateFAQs();
  else if (action < 0.8) simulateAnalytics();
  else simulateCRM();

  sleep(2);
}
