// GoMotarCar — k6 Stress Test (5000 Users)
// Run: k6 run load-tests/k6-stress-test.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

const errorRate = new Rate('errors');
const dbTrend = new Trend('db_queries_duration');
const cacheTrend = new Trend('cache_operations');

export const options = {
  stages: [
    { duration: '2m', target: 1000 },   // Ramp to 1000
    { duration: '3m', target: 3000 },   // Ramp to 3000
    { duration: '3m', target: 5000 },   // Peak: 5000 concurrent
    { duration: '5m', target: 5000 },   // Sustain peak
    { duration: '2m', target: 3000 },   // Scale down
    { duration: '1m', target: 0 },      // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000', 'p(99)<10000'],
    http_req_failed: ['rate<0.10'],
    errors: ['rate<0.10'],
  },
};

const params = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${AUTH_TOKEN}`,
  },
};

// Stress: Frequently accessed read endpoints
function hitFrequentlyAccessed() {
  group('High Traffic Endpoints', () => {
    // These should ideally be cached
    const endpoints = [
      `${BASE_URL}/subscriptions/packages`,
      `${BASE_URL}/search?q=cleaning&type=faqs`,
      `${BASE_URL}/search?q=car+wash&type=services`,
    ];
    endpoints.forEach((url) => {
      const res = http.get(url, params);
      errorRate.add(res.status !== 200);
      sleep(0.2);
    });
  });
}

// Stress: Aggregation-heavy admin endpoints
function hitAdminEndpoints() {
  group('Admin Analytics Endpoints', () => {
    const endpoints = [
      `${BASE_URL}/analytics/dashboard`,
      `${BASE_URL}/analytics/revenue?fromDate=2026-01-01&toDate=2026-06-16`,
      `${BASE_URL}/analytics/cleaner-productivity`,
    ];
    endpoints.forEach((url) => {
      const res = http.get(url, params);
      dbTrend.add(res.timings.duration);
      errorRate.add(res.status !== 200);
      sleep(1);
    });
  });
}

// Stress: CRUD-heavy operations
function hitCRUDOperations() {
  group('CRUD Endpoints', () => {
    let res = http.get(`${BASE_URL}/complaints?limit=10`, params);
    errorRate.add(res.status !== 200);
    sleep(0.5);

    res = http.get(`${BASE_URL}/bookings?limit=10`, params);
    errorRate.add(res.status !== 200);
    sleep(0.5);

    res = http.get(`${BASE_URL}/payments?limit=10`, params);
    errorRate.add(res.status !== 200);
    sleep(0.5);
  });
}

// Stress: Mixed workloads
function hitMixedWorkload() {
  group('Mixed Workload', () => {
    // READ-heavy: 70% reads, 30% writes
    const isRead = Math.random() < 0.7;
    if (isRead) {
      const endpoints = [
        `${BASE_URL}/qr/stats`,
        `${BASE_URL}/bookings/stats`,
        `${BASE_URL}/payments/stats`,
        `${BASE_URL}/complaints/stats`,
      ];
      const url = endpoints[Math.floor(Math.random() * endpoints.length)];
      const res = http.get(url, params);
      errorRate.add(res.status !== 200);
    }
    sleep(0.5);
  });
}

export default function () {
  const zone = Math.random();

  if (zone < 0.30) hitFrequentlyAccessed();
  else if (zone < 0.50) hitAdminEndpoints();
  else if (zone < 0.70) hitCRUDOperations();
  else hitMixedWorkload();

  sleep(3);
}
