import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, Pressable, TextInput } from 'react-native';

import { EmergencySupportScreen } from '../src/screens/EmergencySupportScreen';
import {
  getTrustedContact,
  createEmergencyRequest,
  createTrustedContact,
  deleteTrustedContact,
  notifyTrustedContact,
} from '../src/api/emergencyApi';
import { getAuthUserId } from '../src/api/authStore';

// Mock the API and Auth store functions
jest.mock('../src/api/emergencyApi', () => ({
  getTrustedContact: jest.fn(),
  createEmergencyRequest: jest.fn(),
  createTrustedContact: jest.fn(),
  deleteTrustedContact: jest.fn(),
  notifyTrustedContact: jest.fn(),
}));

jest.mock('../src/api/authStore', () => ({
  getAuthUserId: jest.fn(),
}));

const mockGetTrustedContact = getTrustedContact as jest.Mock;
const mockCreateEmergencyRequest = createEmergencyRequest as jest.Mock;
const mockCreateTrustedContact = createTrustedContact as jest.Mock;
const mockDeleteTrustedContact = deleteTrustedContact as jest.Mock;
const mockNotifyTrustedContact = notifyTrustedContact as jest.Mock;
const mockGetAuthUserId = getAuthUserId as jest.Mock;

describe('EmergencySupportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthUserId.mockReturnValue('test-user-id');
    mockGetTrustedContact.mockResolvedValue(null);
  });

  it('renders correctly with immediate danger options', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<EmergencySupportScreen onBack={() => {}} />);
    });

    const root = renderer!.root;
    const texts = root.findAllByType(Text).map(t => t.props.children).join(' ');

    expect(texts).toContain('Emergency Support');
    expect(texts).toContain('Need urgent help?');
    expect(texts).toContain('Call Police — 119');
    expect(texts).toContain('Call Ambulance — 1990');
    expect(texts).toContain('Call Emergency & Rescue — 110');
  });

  it('displays no trusted contact message if none configured', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<EmergencySupportScreen onBack={() => {}} />);
    });

    const root = renderer!.root;
    const texts = root.findAllByType(Text).map(t => t.props.children).join(' ');

    expect(texts).toContain('No trusted contact added yet.');
  });

  it('displays trusted contact information when available', async () => {
    mockGetTrustedContact.mockResolvedValue({
      _id: 'contact_123',
      name: 'John Doe',
      phone: '0771234567',
      relationship: 'Brother',
      isActive: true,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<EmergencySupportScreen onBack={() => {}} />);
    });

    const root = renderer!.root;
    const texts = root.findAllByType(Text).map(t => t.props.children).join(' ');

    expect(texts).toContain('John Doe');
    expect(texts).toContain('Brother');
    expect(texts).toContain('Call Trusted Person');
    expect(texts).toContain('Notify Trusted Person');
  });

  it('submits a professional support request and handles success state', async () => {
    mockCreateEmergencyRequest.mockResolvedValue({
      success: true,
      requestId: 'req_456',
      status: 'PENDING',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<EmergencySupportScreen onBack={() => {}} />);
    });

    const root = renderer!.root;
    const supportButton = root.findByProps({ testID: 'request-support-button' });

    await ReactTestRenderer.act(async () => {
      supportButton.props.onPress();
    });

    expect(mockCreateEmergencyRequest).toHaveBeenCalledTimes(1);
    expect(mockCreateEmergencyRequest).toHaveBeenCalledWith(
      'MENTAL_HEALTH',
      'User requested emergency mental health support'
    );
  });

  it('handles API errors gracefully during professional support request', async () => {
    mockCreateEmergencyRequest.mockRejectedValue(new Error('Network error'));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<EmergencySupportScreen onBack={() => {}} />);
    });

    const root = renderer!.root;
    const supportButton = root.findByProps({ testID: 'request-support-button' });

    await ReactTestRenderer.act(async () => {
      supportButton.props.onPress();
    });

    const texts = root.findAllByType(Text).map(t => t.props.children).join(' ');
    expect(texts).toContain('Network error');
  });
});
