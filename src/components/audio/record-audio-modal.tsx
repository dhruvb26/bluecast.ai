"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mic, X, Loader2 } from "lucide-react";
import { useUploadStore } from "@/store/post";
import { useUploadThing } from "@/hooks/use-uploadthing";
import {
  Microphone,
  Pause,
  Play,
  PauseCircle,
  Square,
} from "@phosphor-icons/react";

export function RecordAudioModal() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { setUrl } = useUploadStore();
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  const { startUpload } = useUploadThing("audioUploader");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, isPaused]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(chunksRef.current);

        try {
          const audioFile = new File([audioBlob], "recording.mp3", {
            type: "audio/mpeg",
          });

          const uploadResult = await startUpload([audioFile]);

          if (uploadResult && uploadResult[0]) {
            setUrl(uploadResult[0].url);
            setAudioUrl(uploadResult[0].url);
          }
        } catch (error) {
          console.error("Error uploading audio:", error);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (duration < 60) {
        setError(
          "Audio is too short.\nPlease consider recording a longer audio to get better results."
        );
        return;
      }
      setError(null);

      // Create audio URL from the recorded chunks
      const audioBlob = new Blob(chunksRef.current, { type: "audio/mpeg" });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    }
  };

  const handlePause = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        // Resume recording
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        // Pause recording
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.load();
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReRecord = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl); // Clean up the URL
    }
    setAudioUrl(null);
    setError(null);
    setDuration(0);
    setIsPlaying(false);
    chunksRef.current = [];
  };

  const handleUseRecording = async () => {
    if (!audioUrl || error) return;

    setIsProcessing(true);
    try {
      const audioBlob = new Blob(chunksRef.current);
      const audioFile = new File([audioBlob], "recording.mp3", {
        type: "audio/mpeg",
      });

      const uploadResult = await startUpload([audioFile]);

      if (uploadResult && uploadResult[0]) {
        setUrl(uploadResult[0].url);
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.ontimeupdate = () => {
        const currentProgress =
          ((audioRef.current?.currentTime || 0) /
            (audioRef.current?.duration || 1)) *
          100;
        setProgress(currentProgress);
      };
    }
  }, [audioUrl]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Microphone size={18} weight="regular" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            Record Voice
          </DialogTitle>
          <DialogDescription className="text-sm font-normal text-muted-foreground">
            Record your voice note and use it in your post.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center">
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {!audioUrl ? (
                <>
                  <div className="text-xl font-medium mb-2" aria-live="polite">
                    {formatDuration(duration)}
                  </div>
                  <div className="relative mb-4">
                    {/* Circular animation rings */}
                    <div
                      className={`absolute inset-0 rounded-full ${
                        isRecording && !isPaused ? "animate-ping" : ""
                      } opacity-25 bg-blue-100`}
                    />
                    <div
                      className={`absolute inset-2 rounded-full ${
                        isRecording && !isPaused ? "animate-ping" : ""
                      } opacity-50 bg-blue-200`}
                    />
                    <div
                      className={`absolute inset-4 rounded-full ${
                        isRecording && !isPaused ? "animate-ping" : ""
                      } opacity-75 bg-blue-300`}
                    />
                    {/* Microphone button */}
                    <div className="relative bg-accent rounded-full p-6 cursor-pointer">
                      <Mic className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                  <div className="space-x-3">
                    {isRecording && (
                      <>
                        <Button
                          className="gap-2"
                          onClick={handlePause}
                          variant="outline"
                        >
                          {/* <PauseCircle size={18} weight="regular" /> */}
                          {isPaused ? "Resume" : "Pause"}
                        </Button>
                        <Button variant="outline" onClick={stopRecording}>
                          Stop
                        </Button>
                      </>
                    )}
                    {!isRecording && !audioUrl && (
                      <Button onClick={startRecording} className=" px-6">
                        Start Recording
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-4">
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        className="hidden"
                        onEnded={() => setIsPlaying(false)}
                        onTimeUpdate={() => {
                          setIsPlaying(isPlaying);
                        }}
                      />
                      <div className="flex-1">
                        <div className="bg-gray-200 h-1 rounded-full w-full">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300 ease-linear"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>
                            {audioRef.current
                              ? formatDuration(
                                  Math.floor(audioRef.current.currentTime)
                                )
                              : "0:00"}
                          </span>
                          <span>{formatDuration(duration)}</span>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full text-muted-foreground"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? (
                          <Pause size={16} weight="regular" />
                        ) : (
                          <Play size={16} weight="regular" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-md text-indigo-500 p-4 text-left text-sm bg-indigo-50 border border-indigo-200">
                      <p className="font-medium text-sm">
                        {error.split("\n")[0]}
                      </p>
                      <p className="text-xs text-indigo-400">
                        {error.split("\n")[1]}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleReRecord}>
                      Re-record
                    </Button>
                    <Button onClick={handleUseRecording}>Use It</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
