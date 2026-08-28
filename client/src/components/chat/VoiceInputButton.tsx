import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, disabled = false }) => {
  const { showToast } = useNotification();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const reco = new SpeechRecognition();
      reco.continuous = false;
      reco.interimResults = false;
      reco.lang = 'en-US';

      reco.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
          showToast(`Transcribed: "${transcript}"`, 'info');
        }
        setIsListening(false);
      };

      reco.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          showToast(`Microphone error: ${event.error}`, 'error');
        }
      };

      reco.onend = () => {
        setIsListening(false);
      };

      setRecognition(reco);
    }
  }, [onTranscript, showToast]);

  const toggleListening = () => {
    if (!recognition) {
      showToast('Speech Recognition is not supported on this browser (Chrome / Edge recommended).', 'error');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        showToast('Listening... Speak now', 'info');
      } catch (err) {
        console.error('Failed to start recognition', err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`p-2.5 rounded-full transition-all relative ${
        isListening
          ? 'bg-[#ea4335] text-white shadow-lg animate-pulse'
          : 'text-[#c4c7c5] hover:text-white hover:bg-[#282a2c]'
      }`}
      title={isListening ? 'Stop listening' : 'Use microphone'}
      aria-label="Voice input"
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
};
