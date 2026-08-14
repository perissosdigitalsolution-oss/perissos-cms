// scripts/load-test.js
// Usage: k6 run scripts/load-test.js --env BASE_URL=https://perissos-demo.vercel.app

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 20 },   // Ramp up to 20 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% of requests under 200ms
    http_req_failed: ['rate<0.01'],    // Less than 1% error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://perissos-demo.vercel.app';

export default function () {
  // Test homepage
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, { 'homepage status 200': (r) => r.status === 200 });

  // Test API endpoint
  const apiRes = http.get(`${BASE_URL}/api/pages?limit=10`);
  check(apiRes, { 'API status 200': (r) => r.status === 200 });

  // Test blog listing
  const blogRes = http.get(`${BASE_URL}/api/blog-articles?limit=10`);
  check(blogRes, { 'Blog API status 200': (r) => r.status === 200 });

  sleep(1);
}
