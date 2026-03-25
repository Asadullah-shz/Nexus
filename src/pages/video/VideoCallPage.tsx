import React, { useState, useRef, useEffect } from 'react';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, Users,
  MessageSquare, Settings, Maximize2, Phone, Send, MoreVertical
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card, CardBody } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Participant } from '../../types';
import { MOCK_PARTICIPANTS, ALT_AVATAR } from '../../data/video';
import { playCallSound } from '../../utils/audio';

export const VideoCallPage: React.FC = () => {
  const { user } = useAuth();
  const [callActive, setCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [sidebar, setSidebar] = useState<'chat' | 'participants' | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ from: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (callActive) {
      playCallSound('join');
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);

      setTimeout(() => {
        setParticipants(MOCK_PARTICIPANTS);
        playCallSound('join');
      }, 1500);

      const speakerInterval = setInterval(() => {
        const ids = ['self', ...MOCK_PARTICIPANTS.map(p => p.id)];
        setActiveSpeaker(ids[Math.floor(Math.random() * ids.length)]);
      }, 5000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        clearInterval(speakerInterval);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
      setParticipants([]);
      setActiveSpeaker(null);
    }
  }, [callActive]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const endCall = () => {
    playCallSound('leave');
    setCallActive(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setSidebar(null);
    setChatMessages([]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      playCallSound(!prev ? 'mute' : 'unmute');
      return !prev;
    });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(prev => {
      playCallSound('share');
      return !prev;
    });
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(msgs => [...msgs, {
      from: user?.name || 'You',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
  };

  if (!callActive) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Calling</h1>
          <p className="text-gray-600">Connect face-to-face with investors and entrepreneurs</p>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardBody className="p-8">
                <div className="text-center">
                  {}
                  <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isVideoOff ? (
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-3">
                            <VideoOff size={40} className="text-gray-400" />
                          </div>
                          <p className="text-gray-400">Camera is off</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Avatar
                            src={user?.avatarUrl || ''}
                            alt={user?.name || 'You'}
                            size="xl"
                            className="mb-3"
                          />
                          <p className="text-white text-sm">Camera Preview</p>
                          <p className="text-gray-400 text-xs mt-1">In a real implementation, your webcam feed would show here</p>
                        </div>
                      )}
                    </div>

                    {}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                      <button
                        onClick={() => setIsMuted(m => !m)}
                        className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors`}
                      >
                        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>
                      <button
                        onClick={() => setIsVideoOff(v => !v)}
                        className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors`}
                      >
                        {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to join?</h2>
                  <p className="text-gray-500 mb-6">Your microphone and camera are set up. Click to start your call.</p>

                  <Button
                    onClick={() => setCallActive(true)}
                    size="lg"
                    leftIcon={<Phone size={20} />}
                    className="px-8"
                  >
                    Start Video Call
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {}
          <div>
            <Card>
              <CardBody>
                <h3 className="font-semibold text-gray-900 mb-4">Scheduled Calls</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Michael Rodriguez', time: 'Today, 2:00 PM', topic: 'Investment Review', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg' },
                    { name: 'Jennifer Lee', time: 'Tomorrow, 10:00 AM', topic: 'Due Diligence', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg' },
                  ].map((call, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <Avatar src={call.avatar} alt={call.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{call.name}</p>
                        <p className="text-xs text-gray-500">{call.time}</p>
                      </div>
                      <Button size="xs" onClick={() => setCallActive(true)}>Join</Button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" ref={containerRef}>
      <div className="bg-gray-950 rounded-2xl overflow-hidden flex flex-col h-full" style={{ minHeight: '85vh' }}>
        {}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-sm font-medium">LIVE</span>
            </div>
            <span className="text-gray-400 text-sm font-mono">{formatDuration(callDuration)}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full">
            <Users size={14} className="text-primary-400" />
            <span className="text-gray-300 text-sm font-medium">{participants.length + 1}</span>
          </div>
          <div className="flex gap-2">
            <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
            <button onClick={toggleFullscreen} className="p-1.5 text-gray-400 hover:text-white transition-colors">
              <Maximize2 size={18} />
            </button>
          </div>
        </div>

        {}
        <div className="flex flex-1 relative overflow-hidden bg-gray-950">
          <div className="flex-1 p-6 overflow-y-auto">
            {}
            <div className={`grid gap-4 h-full ${
              participants.length === 0 ? 'grid-cols-1' :
              participants.length === 1 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
            }`}>
              {}
              <div className={`relative bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 transition-all duration-500 ${
                activeSpeaker === 'self'
                  ? 'border-primary-500 ring-4 ring-primary-500/20 ring-inset shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-[1.02] z-10'
                  : 'border-gray-800 scale-100'
              }`}>
                {isVideoOff ? (
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar src={user?.avatarUrl || ALT_AVATAR} alt={user?.name || 'You'} size="xl" className={` transition-colors duration-500 ${activeSpeaker === 'self' ? 'border-primary-500' : 'border-gray-800'}`} />
                      {activeSpeaker === 'self' && (
                        <div className="absolute -inset-2 border-2 border-primary-400 rounded-full animate-ping opacity-75" />
                      )}
                    </div>
                    <p className={`text-sm mt-4 font-medium transition-colors ${activeSpeaker === 'self' ? 'text-primary-400' : 'text-gray-400'}`}>You</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <Avatar src={user?.avatarUrl || ALT_AVATAR} alt={user?.name || 'You'} size="xl" />
                    <div className="absolute inset-0 bg-black/20" />
                    {activeSpeaker === 'self' && (
                      <div className="absolute inset-0 border-4 border-primary-500/50 animate-pulse pointer-events-none" />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs bg-black/50 px-3 py-1 rounded-full">Local Preview</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {isMuted && <div className="bg-red-500/90 backdrop-blur-sm p-1.5 rounded-lg border border-red-400/50 shadow-lg"><MicOff size={14} className="text-white" /></div>}
                  {isVideoOff && <div className="bg-red-500/90 backdrop-blur-sm p-1.5 rounded-lg border border-red-400/50 shadow-lg"><VideoOff size={14} className="text-white" /></div>}
                </div>
                <div className={`absolute bottom-4 right-4 text-xs font-bold backdrop-blur-sm px-3 py-1.5 rounded-lg border transition-all ${
                  activeSpeaker === 'self' ? 'bg-primary-600 text-white border-primary-400' : 'bg-gray-900/80 text-gray-300 border-gray-700'
                }`}>
                  {user?.name || 'You'} (Host)
                </div>
              </div>

              {}
              {participants.map(p => (
                <div key={p.id} className={`relative bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 transition-all duration-500 ${
                  activeSpeaker === p.id
                    ? 'border-primary-500 ring-4 ring-primary-500/20 ring-inset shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-[1.02] z-10'
                    : 'border-gray-800 scale-100'
                }`}>
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar src={p.avatar} alt={p.name} size="xl" className={` transition-colors duration-500 ${activeSpeaker === p.id ? 'border-primary-500' : 'border-gray-800'}`} />
                      {activeSpeaker === p.id && (
                        <div className="absolute -inset-2 border-2 border-primary-100 rounded-full animate-ping opacity-75" />
                      )}
                    </div>
                    <p className={`text-sm mt-4 font-medium transition-colors ${activeSpeaker === p.id ? 'text-primary-400' : (p.isVideoOff ? 'text-gray-400' : 'text-white')}`}>{p.name}</p>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    {p.isMuted && <div className="bg-gray-800/90 backdrop-blur-sm p-1.5 rounded-lg border border-gray-700 text-red-400 shadow-lg"><MicOff size={14} /></div>}
                  </div>
                  <div className={`absolute bottom-4 right-4 text-xs font-bold backdrop-blur-sm px-3 py-1.5 rounded-lg border transition-all ${
                    activeSpeaker === p.id ? 'bg-primary-600 text-white border-primary-400' : 'bg-gray-900/80 text-gray-300 border-gray-700'
                  }`}>
                    {p.name}
                  </div>
                </div>
              ))}

              {participants.length === 0 && (
                <div className="bg-gray-900 rounded-2xl border-2 border-dashed border-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-gray-800 p-4 rounded-full inline-block mb-4">
                      <Users size={32} className="text-gray-500" />
                    </div>
                    <p className="text-gray-400 font-medium">Waiting for others to join...</p>
                    <p className="text-gray-600 text-xs mt-2">Share the link with investors</p>
                  </div>
                </div>
              )}
            </div>

            {}
            {isScreenSharing && (
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-primary-600 text-white px-6 py-2 rounded-full shadow-lg animate-bounce">
                <Monitor size={16} />
                <span className="text-sm font-medium">You are sharing your screen</span>
                <button onClick={toggleScreenShare} className="ml-2 hover:bg-primary-700 p-1 rounded">
                  <PhoneOff size={14} className="rotate-90" />
                </button>
              </div>
            )}
          </div>

          {}
          {sidebar && (
            <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold">
                  {sidebar === 'chat' ? 'In-call Chat' : 'Participants'}
                </h3>
                <button onClick={() => setSidebar(null)} className="text-gray-500 hover:text-white">
                  <Settings size={16} className="rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {sidebar === 'chat' ? (
                  <div className="space-y-4">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className="animate-slide-in">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">{msg.from}</p>
                          <p className="text-[10px] text-gray-500">{msg.time}</p>
                        </div>
                        <p className="text-sm text-gray-200 bg-gray-800 rounded-2xl px-4 py-2 shadow-sm border border-gray-700/50">{msg.text}</p>
                      </div>
                    ))}
                    {chatMessages.length === 0 && (
                      <div className="text-center mt-20">
                        <MessageSquare size={32} className="text-gray-700 mx-auto mb-2" />
                        <p className="text-gray-600 text-xs">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Avatar src={user?.avatarUrl || ALT_AVATAR} alt={user?.name || 'You'} size="sm" />
                        <p className="text-sm text-white font-medium">{user?.name} (You)</p>
                      </div>
                      <Badge variant="primary" size="sm">Host</Badge>
                    </div>
                    {participants.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-700">
                        <Avatar src={p.avatar} alt={p.name} size="sm" />
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">{p.name}</p>
                        </div>
                        {p.isMuted && <MicOff size={14} className="text-red-400" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {sidebar === 'chat' && (
                <div className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 placeholder-gray-600 transition-all"
                    />
                    <button
                      onClick={sendChatMessage}
                      className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-900/20 active:scale-95 transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {}
        <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            {}
            <div className="hidden md:block">
              <p className="text-white text-sm font-medium">Quarterly Investment Meet</p>
              <p className="text-gray-500 text-xs mt-0.5">Meeting ID: bix-qxzo-nexus</p>
            </div>

            {}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
                className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-900/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                <span className="text-[10px] font-bold uppercase tracking-tighter">{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              <button
                onClick={() => setIsVideoOff(v => !v)}
                className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-900/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
              >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                <span className="text-[10px] font-bold uppercase tracking-tighter">{isVideoOff ? 'Cam On' : 'Cam Off'}</span>
              </button>

              <button
                onClick={toggleScreenShare}
                className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${isScreenSharing ? 'bg-primary-500 text-white shadow-lg shadow-primary-900/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
              >
                <Monitor size={20} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{isScreenSharing ? 'Stop Share' : 'Share'}</span>
              </button>

              <div className="w-[1px] h-10 bg-gray-800 mx-2" />

              <button
                onClick={() => setSidebar(s => s === 'chat' ? null : 'chat')}
                className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${sidebar === 'chat' ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
              >
                <MessageSquare size={20} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Chat</span>
              </button>

              <button
                onClick={() => setSidebar(s => s === 'participants' ? null : 'participants')}
                className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${sidebar === 'participants' ? 'bg-primary-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
              >
                <Users size={20} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Peeps</span>
              </button>

              <button
                onClick={endCall}
                className="flex flex-col items-center gap-1.5 px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-900/40 ml-4 group"
              >
                <PhoneOff size={20} className="group-hover:rotate-[135deg] transition-transform duration-300" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Leave</span>
              </button>
            </div>

            {}
            <div className="hidden md:flex items-center gap-2">
               <button className="p-2 text-gray-500 hover:text-white bg-gray-800 rounded-lg">
                 <MoreVertical size={18} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};