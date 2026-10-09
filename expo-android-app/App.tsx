import React, { useState, useEffect, useRef, Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';

// Safe WebRTC imports with fallback
let RTCPeerConnection: any;
let RTCView: any;
let mediaDevices: any;

try {
  const webrtc = require('react-native-webrtc');
  RTCPeerConnection = webrtc.RTCPeerConnection;
  RTCView = webrtc.RTCView;
  mediaDevices = webrtc.mediaDevices;
} catch (e) {
  console.warn('WebRTC native module import notice:', e);
}

// Fallback error boundary to ensure screen NEVER goes blank
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || 'Unexpected error' };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorTitle}>ChatPulse</Text>
          <Text style={styles.errorSubtitle}>Something went wrong, but we recovered!</Text>
          <Text style={styles.errorText}>{this.state.error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: '' })}
          >
            <Text style={styles.retryButtonText}>Restart Camera</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function MainVideoChat() {
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'searching' | 'connected'>('idle');
  const [partnerName, setPartnerName] = useState('Stranger');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const pc = useRef<any>(null);

  // Request Android runtime camera and audio permissions
  const requestAndroidPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        const cameraGranted = granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
        const audioGranted = granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;

        const allGranted = cameraGranted && audioGranted;
        setHasPermissions(allGranted);
        return allGranted;
      } catch (err) {
        console.warn('Permission request error:', err);
        setHasPermissions(false);
        return false;
      }
    }
    setHasPermissions(true);
    return true;
  };

  const startLocalMedia = async () => {
    if (!mediaDevices) return;
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: 'user',
          frameRate: 30,
        },
      });
      setLocalStream(stream);
    } catch (err) {
      console.warn('getUserMedia error:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const ok = await requestAndroidPermissions();
      if (ok) {
        await startLocalMedia();
      }
    };
    init();

    return () => {
      if (ws.current) ws.current.close();
      if (pc.current) pc.current.close();
      if (localStream) {
        localStream.getTracks().forEach((t: any) => t.stop());
      }
    };
  }, []);

  const connectSignaling = () => {
    setConnectionStatus('searching');

    try {
      // Connect to the deployed signaling server URL
      const socket = new WebSocket('wss://ais-dev-ollmggw5fqklgkr5otu3h2-808300536981.europe-west2.run.app/ws');
      ws.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 'join_queue',
          username: 'Android_User',
          country: 'Mobile',
          interests: ['Mobile', 'Casual'],
        }));
      };

      socket.onmessage = async (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'matched') {
            setConnectionStatus('connected');
            setPartnerName(msg.partnerName || 'Stranger');
            if (msg.initiator) {
              createOffer();
            }
          } else if (msg.type === 'signal') {
            handleSignal(msg.data);
          } else if (msg.type === 'partner_disconnected') {
            setConnectionStatus('idle');
            setRemoteStream(null);
            if (pc.current) {
              pc.current.close();
              pc.current = null;
            }
          }
        } catch (err) {
          console.warn('Socket message parse error:', err);
        }
      };

      socket.onerror = (err) => {
        console.warn('Socket error:', err);
      };

      socket.onclose = () => {
        setConnectionStatus('idle');
      };
    } catch (err) {
      console.warn('WebSocket init error:', err);
    }
  };

  const createPeerConnection = () => {
    if (!RTCPeerConnection) return null;

    if (pc.current) {
      pc.current.close();
    }

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
      ],
    });

    peer.onicecandidate = (event: any) => {
      if (event.candidate && ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'signal',
          data: { candidate: event.candidate },
        }));
      }
    };

    peer.ontrack = (event: any) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((track: any) => {
        peer.addTrack(track, localStream);
      });
    }

    pc.current = peer;
    return peer;
  };

  const createOffer = async () => {
    const peer = createPeerConnection();
    if (!peer) return;
    try {
      const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await peer.setLocalDescription(offer);
      ws.current?.send(JSON.stringify({ type: 'signal', data: { sdp: peer.localDescription } }));
    } catch (e) {
      console.warn('Offer error:', e);
    }
  };

  const handleSignal = async (data: any) => {
    let peer = pc.current;
    if (!peer) peer = createPeerConnection();
    if (!peer) return;

    try {
      if (data.sdp) {
        await peer.setRemoteDescription(data.sdp);
        if (data.sdp.type === 'offer') {
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          ws.current?.send(JSON.stringify({ type: 'signal', data: { sdp: peer.localDescription } }));
        }
      } else if (data.candidate) {
        await peer.addIceCandidate(data.candidate);
      }
    } catch (e) {
      console.warn('Signal handling error:', e);
    }
  };

  const skipPartner = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'skip', requeue: true }));
    }
    setConnectionStatus('searching');
    setRemoteStream(null);
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track: any) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleCam = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track: any) => {
        track.enabled = !track.enabled;
      });
      setIsVideoMuted(!isVideoMuted);
    }
  };

  // Safe Stream URL getter
  const getStreamURL = (stream: any) => {
    if (!stream) return '';
    try {
      return typeof stream.toURL === 'function' ? stream.toURL() : '';
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>●</Text>
          </View>
          <Text style={styles.headerTitle}>ChatPulse</Text>
        </View>

        <View style={styles.statusPill}>
          <Text style={styles.statusText}>
            {connectionStatus === 'connected'
              ? partnerName
              : connectionStatus === 'searching'
              ? 'Matching...'
              : 'Online'}
          </Text>
        </View>
      </View>

      {/* Main Content Area */}
      {hasPermissions === false ? (
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Camera & Mic Needed</Text>
          <Text style={styles.permissionDesc}>
            ChatPulse needs camera and microphone permissions to connect you with video chat partners.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={async () => {
              const ok = await requestAndroidPermissions();
              if (ok) startLocalMedia();
            }}
          >
            <Text style={styles.primaryButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.videoCard}>
          {/* Remote Video or Searching Radar */}
          {connectionStatus === 'connected' && remoteStream && RTCView ? (
            <RTCView
              streamURL={getStreamURL(remoteStream)}
              style={styles.fullVideo}
              objectFit="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              {connectionStatus === 'searching' ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator size="large" color="#7c3aed" />
                  <Text style={styles.placeholderTitle}>Finding a partner...</Text>
                  <Text style={styles.placeholderSubtitle}>Connecting to matchmaking queue</Text>
                </View>
              ) : (
                <View style={styles.centerBox}>
                  <Text style={styles.readyTitle}>Ready to Connect</Text>
                  <Text style={styles.placeholderSubtitle}>Tap Start below to match with a stranger</Text>
                </View>
              )}
            </View>
          )}

          {/* Local Selfie PiP */}
          {localStream && !isVideoMuted && RTCView && (
            <View style={styles.pipCard}>
              <RTCView
                streamURL={getStreamURL(localStream)}
                style={styles.pipVideo}
                objectFit="cover"
                mirror={true}
              />
              <View style={styles.pipLabel}>
                <Text style={styles.pipLabelText}>You</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Bottom Floating Control Bar */}
      <View style={styles.footerDock}>
        {connectionStatus === 'idle' ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={connectSignaling}
          >
            <Text style={styles.startButtonText}>Start Video Chat</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.dockRow}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={skipPartner}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.circleButton, isAudioMuted && styles.mutedButton]}
              onPress={toggleMic}
            >
              <Text style={styles.circleButtonText}>{isAudioMuted ? '🔇' : '🎤'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.circleButton, isVideoMuted && styles.mutedButton]}
              onPress={toggleCam}
            >
              <Text style={styles.circleButtonText}>{isVideoMuted ? '📷❌' : '📷'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleStopButton}
              onPress={() => {
                if (ws.current) ws.current.close();
                setConnectionStatus('idle');
                setRemoteStream(null);
              }}
            >
              <Text style={styles.circleButtonText}>⏹️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainVideoChat />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf5ff',
  },
  header: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: '#10b981',
    fontSize: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  statusPill: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  statusText: {
    fontSize: 11,
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  videoCard: {
    flex: 1,
    margin: 12,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  fullVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#fdf4ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerBox: {
    alignItems: 'center',
    gap: 8,
  },
  readyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginTop: 8,
  },
  placeholderSubtitle: {
    fontSize: 12,
    color: '#6b21a8',
    textAlign: 'center',
  },
  pipCard: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 105,
    height: 145,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#000000',
    elevation: 8,
  },
  pipVideo: {
    width: '100%',
    height: '100%',
  },
  pipLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pipLabelText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footerDock: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3e8ff',
  },
  startButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutedButton: {
    backgroundColor: '#ffe4e6',
    borderColor: '#fecdd3',
  },
  circleStopButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButtonText: {
    fontSize: 16,
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  permissionDesc: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
