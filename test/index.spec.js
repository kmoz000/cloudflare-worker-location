import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('CORS Headers', () => {
	it('responds with CORS headers for OPTIONS request', async () => {
		const request = new Request('http://example.com', { method: 'OPTIONS' });
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.headers.get('Access-Control-Allow-Headers')).toBe('*');
		expect(response.headers.get('Access-Control-Allow-Methods')).toBe('*');
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});
});

describe('Location Endpoints', () => {
	it('responds with JSON location data', async () => {
		const request = new Request('http://example.com');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.headers.get('Content-Type')).toBe('application/json');
		const data = await response.json();
		expect(data).toHaveProperty('timestamp');
	});

	it('responds with text location data for /ros', async () => {
		const request = new Request('http://example.com/ros');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.headers.get('Content-Type')).toBe('text/plain');
		const text = await response.text();
		expect(text).toContain('timestamp=');
	});
});
