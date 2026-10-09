import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';

// Set this to your deployed server URL or development URL
const SIGNALING_SERVER_URL = 'wss://ais-dev-ollmggw5fqklgkr5otu3h2-808300536981.europe-west2.run.app/ws';

export default function App() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [partnerName, setPartnerName] = useState('Stranger');

  const ws = useRef<WebSocket | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // 1. Get local camera stream
    mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: 'user',
        frameRate: 30,
      },
    }).then((stream: any) => {
      setLocalStream(stream);
    }).catch((err: any) => {
      console.warn('Camera error:', err);
    });

    // 2. Connect WebSocket
    const socket = new WebSocket(SIGNALING_SERVER_URL);
    ws.current = socket;

    socket.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'matched') {
        setIsConnected(true);
        setPartnerName(msg.partnerName || 'Stranger');
        if (msg.initiator) {
          createOffer();
        }
      } else if (msg.type === 'signal') {
        handleSignal(msg.data);
      } else if (msg.type === 'partner_disconnected') {
        setIsConnected(false);
        setRemoteStream(null);
      }
    };

    return () => {
      socket.close();
      if (pc.current) pc.current.close();
    };
  }, []);

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
      ],
    });

    peer.onicecandidate = (event: any) => {
      if (event.candidate && ws.current) {
        ws.current.send(JSON.stringify({
          type: 'signal',
          data: { candidate: event.candidate },
        }));
      }
    };

    (peer as any).ontrack = (event: any) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((track: any) => {
        (peer as any).addTrack(track, localStream);
      });
    }

    pc.current = peer;
    return peer;
  };

  const createOffer = async () => {
    const peer = createPeerConnection();
    const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await peer.setLocalDescription(offer);
    ws.current?.send(JSON.stringify({ type: 'signal', data: { sdp: peer.localDescription } }));
  };

  const handleSignal = async (data: any) => {
    let peer = pc.current;
    if (!peer) peer = createPeerConnection();

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
  };

  const skipPartner = () => {
    ws.current?.send(JSON.stringify({ type: 'skip', requeue: true }));
    setIsConnected(false);
    setRemoteStream(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ChatPulse Native</Text>
        <Text style={styles.badge}>{isConnected ? `Connected with ${partnerName}` : 'Matching...'}</Text>
      </View>

      {/* Main Video Area */}
      <View style={styles.videoContainer}>
        {remoteStream ? (
          <RTCView
            streamURL={(remoteStream as any).toURL()}
            style={styles.remoteVideo}
            objectFit="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Searching for a stranger...</Text>
          </View>
        )}

        {/* Local Selfie PiP */}
        {localStream && (
          <View style={styles.localPip}>
            <RTCView
              streamURL={(localStream as any).toURL()}
              style={styles.localVideo}
              objectFit="cover"
              mirror={true}
            />
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={skipPartner}>
          <Text style={styles.nextButtonText}>Next Stranger</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  badge: {
    fontSize: 12,
    color: '#6b21a8',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    margin: 12,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  localPip: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3e8ff',
  },
  nextButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
