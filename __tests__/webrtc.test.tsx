import React from 'react';
import { render, act } from '@testing-library/react-native';
import { VideoCall } from '../components/VideoCall';
import { useWebRTC } from '../hooks/useWebRTC';

// Mock the useWebRTC hook
jest.mock('../hooks/useWebRTC');

// Mock the expo-av Video component
jest.mock('expo-av', () => ({
  Video: 'Video',
  ResizeMode: { CONTAIN: 'contain' },
}));

describe('VideoCall Component', () => {
  const mockLocalStream = {
    getTracks: () => [
      { kind: 'video', enabled: true, stop: jest.fn() },
      { kind: 'audio', enabled: true, stop: jest.fn() },
    ],
  };

  const mockUseWebRTC = useWebRTC as jest.Mock;

  beforeEach(() => {
    mockUseWebRTC.mockReturnValue({
      localStream: mockLocalStream,
      remoteStreams: {},
      isMuted: false,
      isVideoOff: false,
      isConnected: true,
      localVideoRef: { current: null },
      toggleMute: jest.fn(),
      toggleVideo: jest.fn(),
      startCall: jest.fn(),
    });
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<VideoCall roomId="test-room" onEndCall={jest.fn()} />);
    
    expect(getByTestId('video-call-container')).toBeTruthy();
    expect(getByTestId('local-video')).toBeTruthy();
  });

  it('shows connection status', () => {
    const { getByText } = render(<VideoCall roomId="test-room" onEndCall={jest.fn()} />);
    
    expect(getByText('Connected')).toBeTruthy();
  });

  it('calls onEndCall when end call button is pressed', () => {
    const mockOnEndCall = jest.fn();
    const { getByTestId } = render(
      <VideoCall roomId="test-room" onEndCall={mockOnEndCall} />
    );
    
    const endCallButton = getByTestId('end-call-button');
    endCallButton.props.onPress();
    
    expect(mockOnEndCall).toHaveBeenCalledTimes(1);
  });
});
