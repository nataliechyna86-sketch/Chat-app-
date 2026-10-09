export type ConnectionState = 'idle' | 'searching' | 'connecting' | 'connected' | 'ended';

export type VideoFilter = 'none' | 'warm' | 'cyberpunk' | 'noir' | 'vintage' | 'glow' | 'blur';

export type FaceOverlay = 'none' | 'sunglasses' | 'party_hat' | 'mustache' | 'cat_ears' | 'crown';

export interface ChatMessage {
  id: string;
  sender: 'me' | 'stranger' | 'system';
  text: string;
  timestamp: number;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

export interface PartnerInfo {
  id: string;
  name: string;
  country: string;
  interests: string[];
  isSimulated?: boolean;
}

export interface UserProfile {
  username: string;
  country: string;
  interests: string[];
  filter: VideoFilter;
  overlay: FaceOverlay;
  mirrorLocal: boolean;
  soundEnabled: boolean;
  layout: 'pip' | 'split';
}
