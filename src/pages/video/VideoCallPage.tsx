import React, { useState, useRef, useEffect } from 'react';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, Users,
  MessageSquare, Settings, Maximize2, Phone, Send, MoreVertical, AlertCircle, Clock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card, CardBody } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Participant } from '../../types';
import { MOCK_PARTICIPANTS } from '../../data/video';
import { playCallSound } from '../../utils/audio';

const ALT_AVATAR = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg';

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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamsRef = useRef<{ local: MediaStream | null; screen: MediaStream | null }>({ local: null, screen: null });

  const stopAllStreams = React.useCallback(() => {
    if (streamsRef.current.local) {
      streamsRef.current.local.getTracks().forEach(track => track.stop());
      streamsRef.current.local = null;
    }
    if (streamsRef.current.screen) {
      streamsRef.current.screen.getTracks().forEach(track => track.stop());
      streamsRef.current.screen = null;
    }
  }, []);

  const startLocalStream = React.useCallback(async () => {
    try {
      setMediaError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamsRef.current.local = stream;
      setLocalStream(stream);
      if (previewVideoRef.current) previewVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setMediaError('Could not access camera or microphone. Please check permissions.');
    }
  }, []);

  useEffect(() => {
    startLocalStream();
    return () => {
      stopAllStreams();
    };
  }, [startLocalStream, stopAllStreams]);

  useEffect(() => {
    let speakerInterval: ReturnType<typeof setInterval>;

    if (callActive) {
      playCallSound('join');
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);

      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }

      setTimeout(() => {
        setParticipants(MOCK_PARTICIPANTS);
        playCallSound('join');
      }, 1500);

      speakerInterval = setInterval(() => {
        const ids = ['self', ...MOCK_PARTICIPANTS.map(p => p.id)];
        setActiveSpeaker(ids[Math.floor(Math.random() * ids.length)]);
      }, 5000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (speakerInterval) clearInterval(speakerInterval);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
      setParticipants([]);
      setActiveSpeaker(null);
      if (previewVideoRef.current && localStream) {
        previewVideoRef.current.srcObject = localStream;
      }
    }
  }, [callActive, localStream]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        streamsRef.current.screen = stream;
        setScreenStream(stream);
        setIsScreenSharing(true);
        playCallSound('share');
        
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
          streamsRef.current.screen = null;
        };
      } catch (err) {
        console.error('Error sharing screen:', err);
      }
    } else {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      streamsRef.current.screen = null;
      setScreenStream(null);
      setIsScreenSharing(false);
      playCallSound('share');
    }
  };

  const endCall = () => {
    playCallSound('leave');
    setCallActive(false);
    setIsMuted(false);
    setIsVideoOff(false);
    if (isScreenSharing) toggleScreenShare();
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
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(prev => {
      playCallSound(!prev ? 'mute' : 'unmute');
      return !prev;
    });
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(prev => !prev);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardBody className="p-8">
                <div className="text-center">
                  <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-6 shadow-2xl border border-gray-800" style={{ aspectRatio: '16/9' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isVideoOff ? (
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-3 border border-gray-700">
                            <VideoOff size={40} className="text-gray-500" />
                          </div>
                          <p className="text-gray-500 font-medium">Camera is off</p>
                        </div>
                      ) : localStream ? (
                        <video
                          ref={previewVideoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover mirror"
                        />
                      ) : (
                        <div className="flex flex-col items-center p-6 text-center">
                          {mediaError ? (
                            <>
                              <AlertCircle size={48} className="text-red-500 mb-4" />
                              <p className="text-red-400 font-medium">{mediaError}</p>
                              <Button variant="outline" size="sm" className="mt-4 border-gray-700 text-gray-400" onClick={startLocalStream}>Retry Access</Button>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                              <p className="text-gray-400">Requesting camera access...</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                      <button
                        onClick={toggleMute}
                        className={`p-4 rounded-2xl backdrop-blur-md transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-800/80 text-white hover:bg-gray-700'}`}
                      >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>
                      <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-2xl backdrop-blur-md transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-800/80 text-white hover:bg-gray-700'}`}
                      >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                      </button>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to join?</h2>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto">Your microphone and camera are set up. Connect with your team now.</p>

                  <Button
                    onClick={() => setCallActive(true)}
                    size="lg"
                    leftIcon={<Phone size={20} />}
                    className="px-12 py-6 text-lg rounded-2xl shadow-xl shadow-primary-500/20"
                    disabled={!!mediaError || !localStream}
                  >
                    Start Video Call
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          <div>
            <Card>
              <CardBody>
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock size={18} className="text-primary-600" />
                  Scheduled Calls
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Michael Rodriguez', time: 'Today, 2:00 PM', topic: 'Investment Review', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg' },
                    { name: 'Jennifer Lee', time: 'Tomorrow, 10:00 AM', topic: 'Due Diligence', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg' },
                  ].map((call, i) => (
                    <div key={i} className="group flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-primary-50 hover:border-primary-100 transition-all cursor-pointer">
                      <Avatar src={call.avatar} alt={call.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{call.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{call.time}</p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 bg-white p-2 rounded-xl border border-primary-200 text-primary-600 shadow-sm transition-all shadow-primary-100 hover:bg-primary-600 hover:text-white">
                        <Phone size={16} />
                      </button>
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
    <div className="animate-fade-in h-screen -m-6 p-6" ref={containerRef}>
      <div className="bg-gray-950 rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between px-8 py-4 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <span className="text-white text-sm font-bold tracking-wider">LIVE</span>
            </div>
            <div className="h-6 w-[1px] bg-gray-800" />
            <span className="text-gray-400 text-sm font-mono tracking-widest">{formatDuration(callDuration)}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-800/80 px-4 py-1.5 rounded-2xl border border-gray-700/50">
              <Users size={16} className="text-primary-400" />
              <span className="text-white text-sm font-bold">{participants.length + 1} Participants</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={toggleFullscreen} className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all border border-transparent hover:border-gray-700">
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 relative overflow-hidden">
          <div className="flex-1 p-8 overflow-y-auto">
            <div className={`grid gap-6 h-full ${
              participants.length === 0 ? 'grid-cols-1 max-w-4xl mx-auto' :
              participants.length === 1 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
            }`}>
              <div className={`relative bg-gray-900 rounded-[2.5rem] overflow-hidden flex items-center justify-center border-2 transition-all duration-700 group ${
                activeSpeaker === 'self'
                  ? 'border-primary-500 ring-8 ring-primary-500/10 scale-[1.02] z-10 shadow-2xl'
                  : 'border-gray-800 scale-100'
              }`}>
                {isVideoOff ? (
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar src={user?.avatarUrl || ALT_AVATAR} alt={user?.name || 'You'} size="xl" className={`transition-all duration-700 ${activeSpeaker === 'self' ? 'scale-110' : ''}`} />
                      {activeSpeaker === 'self' && (
                        <div className="absolute -inset-4 border-2 border-primary-500/50 rounded-full animate-ping opacity-75" />
                      )}
                    </div>
                    <p className={`text-base mt-6 font-bold transition-colors ${activeSpeaker === 'self' ? 'text-primary-400' : 'text-gray-400'}`}>You</p>
                  </div>
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover mirror"
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="absolute bottom-6 left-6 flex gap-2">
                  {isMuted && <div className="bg-red-500/90 backdrop-blur-md p-2 rounded-xl border border-red-400/50 shadow-xl"><MicOff size={16} className="text-white" /></div>}
                  {isVideoOff && <div className="bg-red-500/90 backdrop-blur-md p-2 rounded-xl border border-red-400/50 shadow-xl"><VideoOff size={16} className="text-white" /></div>}
                </div>
                <div className={`absolute bottom-6 right-6 text-sm font-bold backdrop-blur-md px-4 py-2 rounded-2xl border transition-all ${
                  activeSpeaker === 'self' ? 'bg-primary-600 text-white border-primary-400 shadow-lg' : 'bg-gray-900/80 text-gray-200 border-gray-700'
                }`}>
                  {user?.name || 'You'} (Host)
                </div>
              </div>

              {participants.map(p => (
                <div key={p.id} className={`relative bg-gray-900 rounded-[2.5rem] overflow-hidden flex items-center justify-center border-2 transition-all duration-700 group ${
                  activeSpeaker === p.id
                    ? 'border-primary-500 ring-8 ring-primary-500/10 scale-[1.02] z-10 shadow-2xl'
                    : 'border-gray-800 scale-100'
                }`}>
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="relative">
                      <Avatar src={p.avatar} alt={p.name} size="xl" className={`transition-all duration-700 ${activeSpeaker === p.id ? 'scale-110' : ''}`} />
                      {activeSpeaker === p.id && (
                        <div className="absolute -inset-4 border-2 border-primary-500/50 rounded-full animate-ping opacity-75" />
                      )}
                    </div>
                    <p className={`text-base mt-6 font-bold transition-colors ${activeSpeaker === p.id ? 'text-primary-400' : 'text-white'}`}>{p.name}</p>
                    <p className="text-gray-500 text-xs mt-1 font-medium">{p.isMuted ? 'Muted' : 'Speaking'}</p>
                  </div>
                  <div className="absolute bottom-6 left-6">
                    {p.isMuted && <div className="bg-gray-800/90 backdrop-blur-md p-2 rounded-xl border border-gray-700 text-red-400 shadow-xl"><MicOff size={16} /></div>}
                  </div>
                  <div className={`absolute bottom-6 right-6 text-sm font-bold backdrop-blur-md px-4 py-2 rounded-2xl border transition-all ${
                    activeSpeaker === p.id ? 'bg-primary-600 text-white border-primary-400 shadow-lg' : 'bg-gray-900/80 text-gray-200 border-gray-700'
                  }`}>
                    {p.name}
                  </div>
                </div>
              ))}

              {participants.length === 0 && (
                <div className="bg-gray-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-800/50 flex flex-col items-center justify-center p-8 backdrop-blur-sm">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                    <Users size={32} className="text-gray-500" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Wait for your team</h3>
                  <p className="text-gray-500 text-sm text-center max-w-xs">Share your meeting link or wait for invited participants to join.</p>
                  <Button variant="outline" size="sm" className="mt-6 border-gray-700 text-gray-400 rounded-xl">Copy Invite Link</Button>
                </div>
              )}
            </div>

            {isScreenSharing && (
              <div className="fixed bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-primary-600 text-white px-8 py-3 rounded-[2rem] shadow-2xl shadow-primary-900/40 animate-pulse border border-primary-400/30">
                <Monitor size={20} className="animate-bounce" />
                <span className="text-sm font-bold tracking-tight">You are sharing your screen</span>
                <button onClick={toggleScreenShare} className="ml-4 bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all">
                  <span className="text-xs font-bold px-2">Stop</span>
                </button>
              </div>
            )}
          </div>

          {sidebar && (
            <div className="w-96 bg-gray-900/80 backdrop-blur-2xl border-l border-gray-800/50 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)] animate-slide-in-right">
              <div className="p-6 border-b border-gray-800/50 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {sidebar === 'chat' ? 'Team Chat' : 'Participants'}
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">{sidebar === 'chat' ? 'Messages are encrypted' : `${participants.length + 1} people in call`}</p>
                </div>
                <button onClick={() => setSidebar(null)} className="bg-gray-800 p-2 rounded-xl text-gray-400 hover:text-white transition-all">
                  <Settings size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {sidebar === 'chat' ? (
                  <div className="space-y-6">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className="animate-fade-in">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-xs font-bold text-primary-400 uppercase tracking-widest">{msg.from}</p>
                          <p className="text-[10px] text-gray-600">{msg.time}</p>
                        </div>
                        <div className="text-sm text-gray-200 bg-gray-800/50 rounded-2xl rounded-tl-none px-5 py-3 border border-gray-700/30 shadow-sm leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {chatMessages.length === 0 && (
                      <div className="text-center mt-32">
                        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
                          <MessageSquare size={24} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">No messages yet</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20">
                      <div className="flex items-center gap-4">
                        <Avatar src={user?.avatarUrl || ALT_AVATAR} alt={user?.name || 'You'} size="sm" />
                        <div>
                          <p className="text-sm text-white font-bold">{user?.name} (You)</p>
                          <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">Host / Speaker</p>
                        </div>
                      </div>
                    </div>
                    {participants.map(p => (
                      <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/60 transition-all">
                        <Avatar src={p.avatar} alt={p.name} size="sm" />
                        <div className="flex-1">
                          <p className="text-sm text-white font-bold">{p.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Participant</p>
                        </div>
                        {p.isMuted && <MicOff size={14} className="text-red-400" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {sidebar === 'chat' && (
                <div className="p-6 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-md">
                  <div className="flex gap-3">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Send a message..."
                      className="flex-1 bg-gray-800/50 border border-gray-700/50 text-white text-sm rounded-2xl px-5 py-3.5 outline-none focus:border-primary-500/50 placeholder-gray-600 transition-all shadow-inner"
                    />
                    <button
                      onClick={sendChatMessage}
                      className="bg-primary-600 text-white p-3.5 rounded-2xl hover:bg-primary-500 shadow-xl shadow-primary-900/20 active:scale-95 transition-all group"
                    >
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-900/80 backdrop-blur-2xl border-t border-gray-800/50 px-10 py-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="hidden lg:block w-64">
              <p className="text-white font-bold tracking-tight">Investment Strategy Deck</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="gray" size="sm" className="bg-gray-800 text-[10px] uppercase font-black tracking-widest">bix-qxzo-nexus</Badge>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <button
                onClick={toggleMute}
                className={`flex flex-col items-center gap-2 px-6 py-3 rounded-[1.25rem] transition-all border-2 ${isMuted ? 'bg-red-500 border-red-400 text-white shadow-xl shadow-red-900/40' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'}`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              <button
                onClick={toggleVideo}
                className={`flex flex-col items-center gap-2 px-6 py-3 rounded-[1.25rem] transition-all border-2 ${isVideoOff ? 'bg-red-500 border-red-400 text-white shadow-xl shadow-red-900/40' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'}`}
              >
                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{isVideoOff ? 'Cam On' : 'Cam Off'}</span>
              </button>

              <button
                onClick={toggleScreenShare}
                className={`flex flex-col items-center gap-2 px-6 py-3 rounded-[1.25rem] transition-all border-2 ${isScreenSharing ? 'bg-primary-500 border-primary-400 text-white shadow-xl shadow-primary-900/40' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'}`}
              >
                <Monitor size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isScreenSharing ? 'Stop' : 'Share'}</span>
              </button>

              <div className="w-[1px] h-12 bg-gray-800/50 mx-2" />

              <button
                onClick={() => setSidebar(s => s === 'chat' ? null : 'chat')}
                className={`flex flex-col items-center gap-2 px-6 py-3 rounded-[1.25rem] transition-all border-2 ${sidebar === 'chat' ? 'bg-primary-500 border-primary-400 text-white shadow-xl shadow-primary-900/40' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'}`}
              >
                <div className="relative">
                  <MessageSquare size={24} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-gray-900 rounded-full" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Chat</span>
              </button>

              <button
                onClick={() => setSidebar(s => s === 'participants' ? null : 'participants')}
                className={`flex flex-col items-center gap-2 px-6 py-3 rounded-[1.25rem] transition-all border-2 ${sidebar === 'participants' ? 'bg-primary-500 border-primary-400 text-white shadow-xl shadow-primary-900/40' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'}`}
              >
                <Users size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Peeps</span>
              </button>

              <button
                onClick={endCall}
                className="flex flex-col items-center gap-2 px-8 py-3 bg-red-600 border-2 border-red-500 text-white hover:bg-red-700 rounded-2xl transition-all shadow-2xl shadow-red-900/50 ml-6 group"
              >
                <PhoneOff size={24} className="group-hover:rotate-[-135deg] transition-transform duration-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">End</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center justify-end w-64 gap-3">
              <button className="p-3 text-gray-500 hover:text-white bg-gray-800 border border-gray-700 rounded-2xl hover:bg-gray-700 transition-all">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};