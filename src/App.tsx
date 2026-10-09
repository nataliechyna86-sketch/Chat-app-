import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { SetupScreen } from './components/SetupScreen';
import { VideoArea } from './components/VideoArea';
import { ControlBar } from './components/ControlBar';
import { ChatPanel } from './components/ChatPanel';
import { EffectsModal } from './components/EffectsModal';
import { ReportModal } from './components/ReportModal';
import { SafetyModal } from './components/SafetyModal';
import { TwoDevicesModal } from './components/TwoDevicesModal';
import { InstallAndroidModal } from './components/InstallAndroidModal';
import { MobileFrame } from './components/MobileFrame';
import { useWebRTC } from './hooks/useWebRTC';
import { sounds } from './utils/soundEffects';
import { createSimulatedVideoStream } from './utils/videoCanvas';
import {
  ConnectionState,
  PartnerInfo,
  ChatMessage,
  FloatingReaction,
  UserProfile,
  VideoFilter,
  FaceOverlay,
} from './types';

export default function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1342);
  const [waitingCount, setWaitingCount] = useState(24);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modals
  const [isEffectsOpen, setIsEffectsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isTwoDevicesOpen, setIsTwoDevicesOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Listen for native PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    }
  };

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => ({
    username: `User_${Math.floor(100 + Math.random() * 900)}`,
    country: 'United States',
    interests: ['gaming', 'music'],
    filter: 'none',
    overlay: 'none',
    mirrorLocal: true,
    soundEnabled: true,
    layout: 'pip',
  }));

  const wsRef = useRef<WebSocket | null>(null);
  const simulatedStreamRef = useRef<MediaStream | null>(null);

  // Send signaling message over WebSocket
  const sendSignal = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'signal',
        data,
      }));
    }
  }, []);

  // Initialize WebRTC hook
  const {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    availableCameras,
    localAudioLevel,
    remoteAudioLevel,
    initLocalMedia,
    startCallAsInitiator,
    handleSignalMessage,
    setSimulatedRemoteStream,
    closeConnection,
    toggleAudio,
    toggleVideo,
    switchCamera,
  } = useWebRTC({
    onSignal: sendSignal,
  });

  // Connect WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'update_profile',
        username: profile.username,
        country: profile.country,
        interests: profile.interests,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case 'connected': {
            if (msg.defaultCountry) {
              setProfile(p => ({
                ...p,
                country: p.country === 'United States' ? msg.defaultCountry : p.country,
              }));
            }
            break;
          }

          case 'presence': {
            if (typeof msg.onlineCount === 'number') {
              setOnlineCount(1200 + msg.onlineCount * 8);
            }
            if (typeof msg.waitingCount === 'number') {
              setWaitingCount(msg.waitingCount);
            }
            break;
          }

          case 'queue_joined': {
            setConnectionState('searching');
            setPartnerInfo(null);
            setMessages([]);
            setUnreadCount(0);
            break;
          }

          case 'queue_left': {
            setConnectionState('idle');
            setPartnerInfo(null);
            setIsChatOpen(false);
            break;
          }

          case 'matched': {
            setConnectionState('connecting');
            const partner: PartnerInfo = {
              id: msg.partnerId,
              name: msg.partnerName || 'Stranger',
              country: msg.partnerCountry || 'Unknown',
              interests: msg.partnerInterests || [],
            };
            setPartnerInfo(partner);
            setMessages([
              {
                id: `sys_${Date.now()}`,
                sender: 'system',
                text: `Connected with ${partner.name} from ${partner.country}!`,
                timestamp: Date.now(),
              },
            ]);

            sounds.playMatchFound();

            if (msg.initiator) {
              startCallAsInitiator();
            }
            break;
          }

          case 'matched_simulated': {
            setConnectionState('connected');
            const simPartner: PartnerInfo = {
              id: msg.partnerId,
              name: msg.partnerName || 'Alex',
              country: msg.partnerCountry || 'Canada',
              interests: msg.partnerInterests || ['Music', 'Casual Chat'],
              isSimulated: true,
            };
            setPartnerInfo(simPartner);

            const simStream = createSimulatedVideoStream(simPartner.name, simPartner.country);
            simulatedStreamRef.current = simStream;
            setSimulatedRemoteStream(simStream);

            sounds.playMatchFound();

            setMessages([
              {
                id: `sys_${Date.now()}`,
                sender: 'system',
                text: `Connected with practice partner ${simPartner.name}!`,
                timestamp: Date.now(),
              },
            ]);

            if (msg.icebreaker) {
              setTimeout(() => {
                setMessages(prev => [
                  ...prev,
                  {
                    id: `bot_${Date.now()}`,
                    sender: 'stranger',
                    text: msg.icebreaker,
                    timestamp: Date.now(),
                  },
                ]);
                sounds.playMessage();
                setUnreadCount(c => c + 1);
              }, 1200);
            }
            break;
          }

          case 'signal': {
            handleSignalMessage(msg.data, false);
            setConnectionState('connected');
            break;
          }

          case 'chat_message': {
            setMessages(prev => [
              ...prev,
              {
                id: `msg_${Date.now()}_${Math.random()}`,
                sender: 'stranger',
                text: msg.text,
                timestamp: msg.timestamp || Date.now(),
              },
            ]);
            sounds.playMessage();
            setUnreadCount(c => c + 1);
            break;
          }

          case 'reaction': {
            addFloatingReaction(msg.emoji);
            sounds.playReaction();
            break;
          }

          case 'typing': {
            setIsPartnerTyping(Boolean(msg.isTyping));
            break;
          }

          case 'partner_disconnected': {
            sounds.playSkip();
            closeConnection();
            if (simulatedStreamRef.current) {
              simulatedStreamRef.current.getTracks().forEach(t => t.stop());
              simulatedStreamRef.current = null;
            }
            setConnectionState('ended');
            setMessages(prev => [
              ...prev,
              {
                id: `sys_${Date.now()}`,
                sender: 'system',
                text: msg.reason === 'reported' ? 'Partner reported and skipped.' : 'Stranger disconnected.',
                timestamp: Date.now(),
              },
            ]);
            break;
          }
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [handleSignalMessage, setSimulatedRemoteStream, startCallAsInitiator, closeConnection]);

  // Request camera on initial load
  useEffect(() => {
    initLocalMedia();
  }, [initLocalMedia]);

  // Sync sound settings
  useEffect(() => {
    sounds.enabled = profile.soundEnabled;
  }, [profile.soundEnabled]);

  // Add floating reaction
  const addFloatingReaction = (emoji: string) => {
    const newReaction: FloatingReaction = {
      id: `rx_${Date.now()}_${Math.random()}`,
      emoji,
      x: 35 + Math.random() * 30,
      y: 70,
    };
    setFloatingReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 1800);
  };

  // Start matchmaking in real queue
  const handleStartMatching = () => {
    closeConnection();
    if (simulatedStreamRef.current) {
      simulatedStreamRef.current.getTracks().forEach(t => t.stop());
      simulatedStreamRef.current = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'join_queue',
        username: profile.username,
        country: profile.country,
        interests: profile.interests,
      }));
    }
  };

  // Start solo practice session
  const handleStartSoloPractice = () => {
    closeConnection();
    if (simulatedStreamRef.current) {
      simulatedStreamRef.current.getTracks().forEach(t => t.stop());
      simulatedStreamRef.current = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'create_simulated_peer',
      }));
    }
  };

  // Skip to next stranger
  const handleSkip = () => {
    sounds.playSkip();
    closeConnection();
    if (simulatedStreamRef.current) {
      simulatedStreamRef.current.getTracks().forEach(t => t.stop());
      simulatedStreamRef.current = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'skip',
        requeue: true,
      }));
    }
  };

  // Stop chatting / return to setup
  const handleStop = () => {
    closeConnection();
    if (simulatedStreamRef.current) {
      simulatedStreamRef.current.getTracks().forEach(t => t.stop());
      simulatedStreamRef.current = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'leave_queue',
      }));
    }
    setConnectionState('idle');
    setPartnerInfo(null);
    setMessages([]);
    setIsChatOpen(false);
    setUnreadCount(0);
  };

  // Send message
  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: `me_${Date.now()}`,
      sender: 'me',
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        text,
      }));

      if (partnerInfo?.isSimulated) {
        wsRef.current.send(JSON.stringify({
          type: 'simulated_chat_reply',
          text,
        }));
      }
    }
  };

  // Send reaction
  const handleSendReaction = (emoji: string) => {
    addFloatingReaction(emoji);
    sounds.playReaction();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'reaction',
        emoji,
      }));
    }
  };

  // Typing state
  const handleTyping = (isTyping: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        isTyping,
      }));
    }
  };

  // Report user
  const handleReportUser = (reason: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'report',
        reason,
      }));
    }
    handleSkip();
  };

  // Keyboard shortcut: Space to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (connectionState === 'idle') {
          handleStartMatching();
        } else {
          handleSkip();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectionState]);

  return (
    <div className="font-sans">
      <MobileFrame>
        {/* Mobile Header */}
        <Header
          onlineCount={onlineCount}
          waitingCount={waitingCount}
          soundEnabled={profile.soundEnabled}
          onToggleSound={() => setProfile(p => ({ ...p, soundEnabled: !p.soundEnabled }))}
          onOpenSafetyGuide={() => setIsSafetyOpen(true)}
          onOpenTwoDevicesModal={() => setIsTwoDevicesOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />

        {/* Main Content Area */}
        {connectionState === 'idle' ? (
          <SetupScreen
            profile={profile}
            onUpdateProfile={(updates) => setProfile(p => ({ ...p, ...updates }))}
            onStartMatching={handleStartMatching}
            onStartSoloPractice={handleStartSoloPractice}
            onOpenTwoDevicesModal={() => setIsTwoDevicesOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            localStream={localStream}
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onlineCount={onlineCount}
            waitingCount={waitingCount}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden relative min-h-0 bg-white">
            {/* Live Video Streams */}
            <VideoArea
              connectionState={connectionState}
              partnerInfo={partnerInfo}
              localStream={localStream}
              remoteStream={remoteStream}
              isAudioMuted={isAudioMuted}
              isVideoMuted={isVideoMuted}
              filter={profile.filter}
              overlay={profile.overlay}
              mirrorLocal={profile.mirrorLocal}
              localAudioLevel={localAudioLevel}
              remoteAudioLevel={remoteAudioLevel}
              floatingReactions={floatingReactions}
              recentMessages={messages}
              onStartSearch={handleStartMatching}
              onSimulateSoloMatch={handleStartSoloPractice}
              onOpenReport={() => setIsReportOpen(true)}
              waitingCount={waitingCount}
            />

            {/* Slide-Up Chat Bottom Sheet */}
            <ChatPanel
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              messages={messages}
              partnerInfo={partnerInfo}
              isPartnerTyping={isPartnerTyping}
              onSendMessage={handleSendMessage}
              onSendReaction={handleSendReaction}
              onTyping={handleTyping}
              isCallConnected={connectionState === 'connected'}
            />
          </div>
        )}

        {/* In-Call Mobile Dock */}
        {connectionState !== 'idle' && (
          <ControlBar
            connectionState={connectionState}
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
            canSwitchCamera={availableCameras.length > 1}
            isChatOpen={isChatOpen}
            unreadCount={unreadCount}
            onSkip={handleSkip}
            onStop={handleStop}
            onStart={handleStartMatching}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onSwitchCamera={switchCamera}
            onOpenEffects={() => setIsEffectsOpen(true)}
            onToggleChat={() => {
              setIsChatOpen(v => !v);
              setUnreadCount(0);
            }}
          />
        )}
      </MobileFrame>

      {/* Effects & Filters Modal */}
      <EffectsModal
        isOpen={isEffectsOpen}
        onClose={() => setIsEffectsOpen(false)}
        filter={profile.filter}
        onSelectFilter={(filter: VideoFilter) => setProfile(p => ({ ...p, filter }))}
        overlay={profile.overlay}
        onSelectOverlay={(overlay: FaceOverlay) => setProfile(p => ({ ...p, overlay }))}
        mirrorLocal={profile.mirrorLocal}
        onToggleMirror={() => setProfile(p => ({ ...p, mirrorLocal: !p.mirrorLocal }))}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmitReport={handleReportUser}
        partnerName={partnerInfo?.name || 'Stranger'}
      />

      {/* Safety Guidelines Modal */}
      <SafetyModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />

      {/* Two Devices Test Modal */}
      <TwoDevicesModal
        isOpen={isTwoDevicesOpen}
        onClose={() => setIsTwoDevicesOpen(false)}
        onlineCount={onlineCount}
        waitingCount={waitingCount}
      />

      {/* Install Android & React Native APK Modal */}
      <InstallAndroidModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallPWA={handleInstallPWA}
      />
    </div>
  );
}
