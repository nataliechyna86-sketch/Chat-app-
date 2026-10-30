import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebRTCProps {
  onSignal: (data: any) => void;
}

export function useWebRTC({ onSignal }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [remoteAudioLevel, setRemoteAudioLevel] = useState(0);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string>('');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const originalCamStreamRef = useRef<MediaStream | null>(null);

  // Audio analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const localAnalyserRef = useRef<AnalyserNode | null>(null);
  const remoteAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize camera and microphone
  const initLocalMedia = useCallback(async (preferredDeviceId?: string) => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: preferredDeviceId ? { deviceId: { exact: preferredDeviceId } } : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback with basic constraints
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      }

      localStreamRef.current = stream;
      originalCamStreamRef.current = stream;
      setLocalStream(stream);
      setHasCameraPermission(true);
      setPermissionError(null);

      // Enumerate cameras
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0 && !preferredDeviceId) {
          setCurrentCameraId(videoDevices[0].deviceId);
        }
      } catch {}

      // Setup local audio level analyzer
      setupLocalAudioAnalysis(stream);

      return stream;
    } catch (err: any) {
      console.warn('getUserMedia error:', err);
      setHasCameraPermission(false);
      setPermissionError(err.message || 'Camera / Microphone access denied.');
      return null;
    }
  }, []);

  const setupLocalAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      localAnalyserRef.current = analyser;
    } catch {}
  };

  const setupRemoteAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      remoteAnalyserRef.current = analyser;
    } catch {}
  };

  // Poll audio volume levels for animated speaking indicator
  useEffect(() => {
    let active = true;
    const updateLevels = () => {
      if (!active) return;

      if (localAnalyserRef.current && !isAudioMuted) {
        const data = new Uint8Array(localAnalyserRef.current.frequencyBinCount);
        localAnalyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLocalAudioLevel(Math.min(100, Math.round(avg * 1.5)));
      } else {
        setLocalAudioLevel(0);
      }

      if (remoteAnalyserRef.current) {
        const data = new Uint8Array(remoteAnalyserRef.current.frequencyBinCount);
        remoteAnalyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setRemoteAudioLevel(Math.min(100, Math.round(avg * 1.5)));
      } else {
        setRemoteAudioLevel(0);
      }

      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };

    animationFrameRef.current = requestAnimationFrame(updateLevels);

    return () => {
      active = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isAudioMuted]);

  // Create RTCPeerConnection
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
      ],
      iceCandidatePoolSize: 10,
    });

    peerConnectionRef.current = pc;
    iceCandidatesQueue.current = [];

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onSignal({ candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setupRemoteAudioAnalysis(event.streams[0]);
      } else {
        const inboundStream = new MediaStream();
        inboundStream.addTrack(event.track);
        setRemoteStream(inboundStream);
        setupRemoteAudioAnalysis(inboundStream);
      }
    };

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  }, [onSignal]);

  // Handle incoming signaling messages
  const handleSignalMessage = useCallback(async (data: any, isInitiator: boolean) => {
    let pc = peerConnectionRef.current;
    if (!pc) {
      pc = createPeerConnection();
    }

    try {
      if (data.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

        // Process queued ice candidates
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          if (candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
          }
        }

        if (data.sdp.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          onSignal({ sdp: pc.localDescription });
        }
      } else if (data.candidate) {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
        } else {
          iceCandidatesQueue.current.push(data.candidate);
        }
      }
    } catch (err) {
      console.warn('Error handling WebRTC signal:', err);
    }
  }, [createPeerConnection, onSignal]);

  // Start Call as Initiator (create and send Offer)
  const startCallAsInitiator = useCallback(async () => {
    const pc = createPeerConnection();
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      onSignal({ sdp: pc.localDescription });
    } catch (err) {
      console.warn('Failed to create offer:', err);
    }
  }, [createPeerConnection, onSignal]);

  // Set synthetic remote stream (used for Solo Simulated Mode)
  const setSimulatedRemoteStream = useCallback((stream: MediaStream) => {
    setRemoteStream(stream);
    setupRemoteAudioAnalysis(stream);
  }, []);

  // Close connection
  const closeConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setRemoteAudioLevel(0);
    iceCandidatesQueue.current = [];
  }, []);

  // Toggle Audio Mute
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(prev => !prev);
    }
  }, []);

  // Toggle Video Mute (Camera off)
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoMuted(prev => !prev);
    }
  }, []);

  // Screen share toggle
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Revert to camera
      if (originalCamStreamRef.current) {
        const camVideoTrack = originalCamStreamRef.current.getVideoTracks()[0];
        if (camVideoTrack && peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(camVideoTrack);
          }
        }
        setLocalStream(originalCamStreamRef.current);
        localStreamRef.current = originalCamStreamRef.current;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenVideoTrack = screenStream.getVideoTracks()[0];

        screenVideoTrack.onended = () => {
          setIsScreenSharing(false);
          if (originalCamStreamRef.current) {
            setLocalStream(originalCamStreamRef.current);
            localStreamRef.current = originalCamStreamRef.current;
            const senders = peerConnectionRef.current?.getSenders();
            const videoSender = senders?.find(s => s.track && s.track.kind === 'video');
            if (videoSender && originalCamStreamRef.current.getVideoTracks()[0]) {
              videoSender.replaceTrack(originalCamStreamRef.current.getVideoTracks()[0]);
            }
          }
        };

        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenVideoTrack);
          }
        }

        // Combine screen video with local audio
        const combined = new MediaStream([screenVideoTrack]);
        if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach(t => combined.addTrack(t));
        }
        setLocalStream(combined);
        localStreamRef.current = combined;
        setIsScreenSharing(true);
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    }
  }, [isScreenSharing]);

  // Switch camera device
  const switchCamera = useCallback(async () => {
    if (availableCameras.length <= 1) return;
    const currentIndex = availableCameras.findIndex(c => c.deviceId === currentCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextDevice = availableCameras[nextIndex];
    setCurrentCameraId(nextDevice.deviceId);
    const newStream = await initLocalMedia(nextDevice.deviceId);
    if (newStream && peerConnectionRef.current) {
      const newVideoTrack = newStream.getVideoTracks()[0];
      if (newVideoTrack) {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(newVideoTrack).catch(() => {});
        }
      }
    }
  }, [availableCameras, currentCameraId, initLocalMedia]);

  return {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    hasCameraPermission,
    permissionError,
    localAudioLevel,
    remoteAudioLevel,
    availableCameras,
    initLocalMedia,
    startCallAsInitiator,
    createPeerConnection,
    handleSignalMessage,
    setSimulatedRemoteStream,
    closeConnection,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    switchCamera,
  };
}
