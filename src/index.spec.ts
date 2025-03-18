import { describe, it, expect, vi } from 'vitest';
import worker from './index';
import { messageMock, invalidMessageMock } from './tests/helpers/createEmailMessage';
import { ForwardableEmailMessage } from './types';

const env: Record<string, any> = { 
  "forwarding_address": "catch-all@example.com",
  "allowed_senders": ["sa@example.com"],
  "allowed_domains": ["example.com"],
  "tz": "US/Eastern",
  "NTFY_TOPIC": "https://ntfy.sh/foo",
  "NTFY_TOKEN": "1234567890abcdef", 
};

const ctx = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
  props: {},
  exports: {},
  abort: vi.fn()
};

const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Headers(),
  clone: () => ({} as Response),
  text: () => Promise.resolve('Success'),
} as Response);

const fetchArgs = {
  method: 'POST',
  headers: {
    "Authorization": `Bearer ${env.NTFY_TOKEN}`,
    "Title": expect.any(String),
    "Tags": "email",
    "X-Priority": 5,
    "Accept": "application/json"
  },
  body: expect.any(String)
}

describe('email worker', () => {

  it('should process email and send to API', async () => {
    const message = messageMock({
      from: 'sa@example.com',
      to: 'support@example.com',
      subject: 'Test Email',
      body: 'This is a test email message.'
    });

    await worker.email(message, env, ctx);

    expect(fetchMock).toHaveBeenCalledWith(`${env.NTFY_TOPIC}`, fetchArgs);

    const lastCall = fetchMock.mock.lastCall;
    if (lastCall && lastCall[1] && typeof lastCall[1].body === 'string') {
      const payload = JSON.parse(lastCall[1].body);

      expect(payload).toBe("This is a test email message. From: sa@example.com Date: 2025-03-11T20:54:05.000Z");
    }

    expect(message.setReject).not.toHaveBeenCalled();
  });

  it('should handle API call failure', async () => {
    const message = messageMock({
      from: 'sa@example.com',
      to: 'support@example.com',
      subject: 'Test Email',
      body: 'This is a test email message.'
    });

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'OK',
      headers: new Headers(),
      clone: () => ({} as Response),
      text: () => Promise.resolve('Error'),
    } as Response);

    await worker.email(message, env, ctx);

    expect(message.setReject).toHaveBeenCalledWith('Failed to process email.');
  });

  it('should handle invalid email content', async () => {
    // Arrange
    const message = invalidMessageMock('Invalid email content');
    const fetchMock = vi.spyOn(global, 'fetch');

    //Act
    await worker.email(message, env, ctx);

    //Assert
    expect(message.setReject).toHaveBeenCalledWith('Failed to process email.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards email if sender is not whitelisted and forwarding address is set", async () => {
    // Arrange
    const message = messageMock({
      from: 'sa@test-domain.com',
      to: 'support@example.com',
      subject: 'Test Email',
      body: 'This is a test email message.'
    });

    // Act
    await worker.email(message, env, ctx);

    // Assert
    expect(message.forward).toHaveBeenCalledWith('catch-all@example.com');
  });

  it("throws error if NTFY_TOPIC is missing", async () => {

    // Arrange
    const message = messageMock({
      from: 'sa@example.com',
      to: 'support@example.com',
      subject: 'Test Email',
      body: 'This is a test email message.'
    });
    delete env.NTFY_TOPIC;

    // Act
    await worker.email(message, env, ctx);

    // Assert
    expect(message.setReject).toHaveBeenCalledWith('Failed to process email.');

    env.NTFY_TOPIC = 'https://ntfy.sh/foo';
  });

  it("throws error if NTFY_TOKEN is missing", async () => {
    // Arrange
    const message = messageMock({
      from: 'sa@example.com',
      to: 'support@example.com',
      subject: 'Test Email',
      body: 'This is a test email message.'
    });
    delete env.NTFY_TOKEN;

    // Act
    await worker.email(message, env, ctx);

    // Assert
    expect(message.setReject).toHaveBeenCalledWith('Failed to process email.');

    env.NTFY_TOKEN = '1234567890abcdef';
  });

  it("does not forward email if sender is not whitelisted and forwarding address is not set", async () => {
    // Arrange
    const message = messageMock({
      from: 'sa@test-domain.com',
      to: 'support@example.com',
      subject: 'Test Email',
      body: 'This is a test email message.'
    });
    delete env.forwarding_address;

    // Act
    await worker.email(message, env, ctx);

    // Assert
    expect(message.forward).not.toHaveBeenCalled();
  });

  it("correctly extracts domain from email address", async () => {
    // Arrange
    const message = messageMock({
      from: 'sa@test-domain.com',
      to: 'support@example.com',
      subject: 'Test Email',
      body: 'This is a test email message.'
    });

    env.allowed_domains = ['test-domain.com'];
    
    const consoleSpy = vi.spyOn(console, 'log');
    
    // Act
    await worker.email(message, env, ctx);
    
    // Assert
    expect(consoleSpy).toHaveBeenCalledWith("Sender domain:", "test-domain.com");
    expect(consoleSpy).toHaveBeenCalledWith("Is allowed domain:", true);
  });
});