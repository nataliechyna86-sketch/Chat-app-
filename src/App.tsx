import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ConnectingScreen } from './components/ConnectingScreen';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
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
  const [onlineCount, setOnlineCount] = useState(1);
  const [waitingCount, setWaitingCount] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // App Flows matching 8 Mochii Screens
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('mochii_onboarded_completed');
  });
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

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
    username: 'mochii',
    country: 'United States',
    interests: ['music', 'gaming'],
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
    // Fetch live real server stats immediately
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (typeof data.onlineUsers === 'number') {
          setOnlineCount(data.onlineUsers);
        }
      })
      .catch(() => {});

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
              setOnlineCount(msg.onlineCount);
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
                text: `Connected with ${partner.name}!`,
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
    } else {
      setConnectionState('searching');
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
    <div className="font-sans antialiased text-white selection:bg-[#6538F6] selection:text-white">
      <MobileFrame>
        {/* Screen 1: Mochii Loading Splash Screen */}
        {showSplash && (
          <SplashScreen
            onFinish={() => setShowSplash(false)}
            onlineCount={onlineCount}
          />
        )}

        {/* Screen 2, 3, 4: Mochii Onboarding 3-step carousel */}
        {showOnboarding && !showSplash && (
          <OnboardingScreen
            onFinish={() => {
              localStorage.setItem('mochii_onboarded_completed', 'true');
              setShowOnboarding(false);
            }}
          />
        )}

        {/* Screen 8: Mochii Profile & Settings Screen */}
        <ProfileSettingsModal
          isOpen={isProfileSettingsOpen}
          onClose={() => setIsProfileSettingsOpen(false)}
          profile={profile}
          onUpdateProfile={(updates) => {
            setProfile(p => ({ ...p, ...updates }));
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'update_profile',
                username: updates.username ?? profile.username,
                country: updates.country ?? profile.country,
                interests: updates.interests ?? profile.interests,
              }));
            }
          }}
          onReplayOnboarding={() => {
            setShowOnboarding(true);
          }}
          onOpenTwoDevices={() => {
            setIsTwoDevicesOpen(true);
          }}
        />

        {/* Main Mochii Experience */}
        {connectionState === 'idle' ? (
          /* Screen 5: Home / Waiting Screen */
          <SetupScreen
            profile={profile}
            onUpdateProfile={(updates) => setProfile(p => ({ ...p, ...updates }))}
            onStartMatching={handleStartMatching}
            onOpenSettings={() => setIsProfileSettingsOpen(true)}
            onOpenTwoDevices={() => setIsTwoDevicesOpen(true)}
            localStream={localStream}
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onlineCount={onlineCount}
          />
        ) : connectionState === 'searching' || connectionState === 'connecting' ? (
          /* Screen 6: Connecting Screen */
          <ConnectingScreen onCancel={handleStop} />
        ) : (
          /* Screen 7: Active Video Chat Screen */
          <div className="flex-1 flex flex-col overflow-hidden relative min-h-0 bg-[#120E28]">
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

            {/* Screen 7 Floating Controls Bar */}
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
          </div>
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
