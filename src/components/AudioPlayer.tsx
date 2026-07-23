import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Headphones,
  ListMusic,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { Book } from '../types';

interface AudioPlayerProps {
  book: Book;
  onClose: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ book, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(45); // seconds
  const [duration, setDuration] = useState<number>(1800); // 30 mins
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentChapter = book.chapters[currentChapterIndex] || {
    title: 'Chapitre 1',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying) {
        setCurrentTime((prev) => (prev >= duration ? 0 : prev + 1));
      }
    }, 1000 / playbackSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, duration, playbackSpeed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bento-card rounded-b-none border-x-0 border-b-0 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl text-white p-4 shadow-2xl animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Book & Chapter Info */}
        <div className="flex items-center space-x-4 w-full md:w-1/4">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-14 h-14 rounded-xl object-cover ring-2 ring-emerald-500/50 shadow-md border border-slate-800"
          />
          <div className="overflow-hidden">
            <h4 className="font-serif font-bold text-sm truncate">{book.title}</h4>
            <p className="text-xs text-emerald-400 font-medium truncate">
              {currentChapter.title}
            </p>
            <p className="text-[10px] text-slate-400">Lu par la voix BookVerse AI Studio</p>
          </div>
        </div>

        {/* Center Audio Controls & Scrubber */}
        <div className="flex-1 max-w-2xl w-full space-y-2">
          <div className="flex items-center justify-center space-x-6">
            {/* Speed Toggle */}
            <button
              onClick={() => {
                const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
                const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                setPlaybackSpeed(speeds[nextIdx]);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-emerald-400 hover:bg-slate-800 transition cursor-pointer"
            >
              {playbackSpeed}x
            </button>

            {/* Skip 15s Back */}
            <button
              onClick={() => setCurrentTime((prev) => Math.max(0, prev - 15))}
              className="p-2 text-slate-400 hover:text-white transition cursor-pointer"
              title="Reculer de 15s"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center justify-center shadow-lg transition transform hover:scale-105 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            {/* Skip 15s Forward */}
            <button
              onClick={() => setCurrentTime((prev) => Math.min(duration, prev + 15))}
              className="p-2 text-slate-400 hover:text-white transition cursor-pointer"
              title="Avancer de 15s"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Chapter Selection Pill */}
            <select
              value={currentChapterIndex}
              onChange={(e) => setCurrentChapterIndex(Number(e.target.value))}
              className="bg-slate-900 text-slate-300 text-xs px-2 py-1 rounded-lg border border-slate-800 focus:outline-none"
            >
              {book.chapters.map((ch, idx) => (
                <option key={ch.id} value={idx}>
                  Ch. {ch.number}
                </option>
              ))}
            </select>
          </div>

          {/* Scrubber Bar */}
          <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => setCurrentTime(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Volume & Close */}
        <div className="flex items-center space-x-3 w-full md:w-1/6 justify-end">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-slate-400 hover:text-white transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
