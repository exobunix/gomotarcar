// GoMotarCar — k6 Smoke Test (100 Users)
// Run: k6 run load-tests/k6-smoke-test.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';

const errorRate = new Rate('errors');
const authTrend = new Trend('auth_duration');
const bookingTrend = new Trend('booking_duration');
const analyticsTrend = new Trend('analytics_duration');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up
    { duration: '1m', target: 20 },   // Stay
    { duration: '30s', target: 100 }, // Spike
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    errors: ['rate<0.05'],             // Error rate under 5%
  },
};

export default function () {
  group('Health Check', () => {
    const res = http.get(`${BASE_URL.replace('/api/v1', '')}/health`);
    check(res, { 'health status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(1);
  });

  group('Auth Flow', () => {
    const start = Date.now();
    const res = http.post(`${BASE_URL}/auth/send-otp`, {
      phone: `99999${String(Math.floor(Math.random() * 90000) + 10000)}`,
    }, { headers: { 'Content-Type': 'application/json' } });
    authTrend.add(Date.now() - start);
    check(res, { 'send-otp status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(2);
  });

  group('List Subscriptions Packages', () => {
    const res = http.get(`${BASE_URL}/subscriptions/packages`);
    check(res, { 'packages status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(1);
  });

  group('List Service FAQs', () => {
    const res = http.get(`${BASE_URL}/search?q=cleaning&type=faqs`);
    check(res, { 'faq search status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    sleep(1);
  });
}
