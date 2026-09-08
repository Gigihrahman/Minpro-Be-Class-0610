// Setup file untuk Jest
import 'reflect-metadata';

// Mock untuk environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DELAYED_JOB_WAIT_PAYMENT = '2';
process.env.DELAYED_JOB_WAIT_PAYMENT_CONFIRMATION = '30';