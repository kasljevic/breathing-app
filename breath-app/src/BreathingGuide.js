import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart } from 'lucide-react';

const BreathingGuide = () => {
  const [duration, setDuration] = useState(5);
  const [cycleCount, setCycleCount] = useState(0);
  const [maxCycles, setMaxCycles] = useState(10);
  const [showInfo, setShowInfo] = useState(false);
  const [progress, setProgress] = useState(0);

  const phases = useMemo(
    () => [
      { name: 'Inhale', duration },
      { name: 'Exhale', duration },
    ],
    [duration]
  );

  const [currentPhase, setCurrentPhase] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(phases[0].duration);
  const [scale, setScale] = useState(1);
  const [circleColor, setCircleColor] = useState('rgba(255, 255, 255, 0.2)');
  const [circleSize, setCircleSize] = useState(200);

  const timerRef = useRef(null);
  const scaleIntervalRef = useRef(null);
  const [reminder, setReminder] = useState('Breathe from the heart');

  const currentPhaseRef = useRef(currentPhase);
  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  useEffect(() => {
    if (isRunning) {
      // Timer Interval
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 1) {
            const nextPhase = (currentPhaseRef.current + 1) % phases.length;
            setCurrentPhase(nextPhase);
            if (nextPhase === 0) {
              setCycleCount((prev) => {
                const newCount = prev + 1;
                if (newCount >= maxCycles) {
                  setIsRunning(false);
                  return prev;
                }
                return newCount;
              });
            }
            setReminder(
              nextPhase === 0
                ? 'Breathe through your heart'
                : 'Release and feel the rhythm'
            );
            return phases[nextPhase].duration;
          }
          return prevTime - 1;
        });

        setProgress((prev) => (prev + 1) % (duration * 2));
      }, 1000);

      // Scale Animation Interval and Dynamic Circle Updates
      const animationDuration = duration * 1000 * 0.6;
      const fps = 60;
      const totalFrames = (animationDuration / 1000) * fps;

      scaleIntervalRef.current = setInterval(() => {
        setScale((prevScale) => {
          const phaseProgress = (duration - timeLeft) / duration;
          if (phaseProgress < 0.2 || phaseProgress > 0.8) {
            return prevScale;
          }

          const normalizedProgress = (phaseProgress - 0.2) / 0.6;
          const targetScale = phases[currentPhaseRef.current].name === 'Inhale' ? 1.5 : 1;
          const initialScale = phases[currentPhaseRef.current].name === 'Inhale' ? 1 : 1.5;
          const newScale = initialScale + (targetScale - initialScale) * normalizedProgress;

          setCircleSize(200 + newScale * 200);
          setCircleColor(
            phases[currentPhaseRef.current].name === 'Inhale'
              ? `rgba(0, 255, 0, ${0.2 + normalizedProgress * 0.2})`
              : `rgba(255, 0, 0, ${0.4 - normalizedProgress * 0.2})`
          );

          return newScale;
        });
      }, animationDuration / totalFrames);

      return () => {
        clearInterval(timerRef.current);
        clearInterval(scaleIntervalRef.current);
      };
    }
  }, [isRunning, phases, maxCycles, duration, timeLeft]);

  const toggleStartPause = () => {
    setIsRunning((prev) => !prev);
    if (!isRunning) {
      setReminder('Breathe through your heart');
      setCycleCount(0);
      setProgress(0);
      setCurrentPhase(0);
      setTimeLeft(phases[0].duration);
      setScale(1);
      setCircleSize(200);
      setCircleColor('rgba(255, 255, 255, 0.2)');
    }
  };

  const resetBreathing = () => {
    clearInterval(timerRef.current);
    clearInterval(scaleIntervalRef.current);
    setIsRunning(false);
    setCurrentPhase(0);
    setTimeLeft(phases[0].duration);
    setScale(1);
    setReminder('Breathe through your heart');
    setCycleCount(0);
    setProgress(0);
    setCircleSize(200);
    setCircleColor('rgba(255, 255, 255, 0.2)');
  };

  const getProgressPercentage = () => (progress / (duration * 2)) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
      <h2 className="text-4xl font-bold mb-4 text-red-400">Heart-Based Breathing Guide</h2>
      
      <button 
        onClick={() => setShowInfo(!showInfo)} 
        className="mb-4 text-blue-400 hover:text-blue-300 transition-colors text-sm"
      >
        {showInfo ? 'Hide Tips' : 'Show Tips'}
      </button>

      {showInfo && (
        <div className="mb-6 text-sm max-w-md text-center text-gray-300">
          <p className="mb-2">
            Your body's stress responses are rooted in ancient survival mechanisms. Understanding that your brain tends to shut down under stress can help you proactively manage pressure.
          </p>
          <h4 className="font-bold mt-4 mb-3">Top 3 Tips for Effective Breathing:</h4>
          <ol className="list-decimal list-inside text-left space-y-4">
            <li>
              <span className="font-semibold">Rhythm:</span> Maintain a steady, consistent breathing pattern to calm your nervous system.
              <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </li>
            <li>
              <span className="font-semibold">Smoothness:</span> Focus on smooth, uninterrupted breaths to promote relaxation and reduce stress.
              <div className="mt-1 relative h-2">
                <div 
                  className="absolute top-0 left-0 h-full w-2 bg-green-500 rounded-full transition-all duration-1000 ease-linear"
                  style={{ left: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </li>
            <li>
              <span className="font-semibold">From the Heart:</span> Imagine breathing through your heart to enhance positive emotions and energy flow.
              <div className="mt-1 flex justify-center">
                <Heart
                  size={24}
                  className="text-red-500 transition-transform duration-1000 ease-in-out"
                  style={{ transform: `scale(${1 + (scale - 1) * 0.5})` }}
                />
              </div>
            </li>
          </ol>
          <p className="mt-4">
            These techniques help regulate your body's stress response, improve focus, and cultivate a sense of inner calm and balance.
          </p>
        </div>
      )}

      <div className="flex items-center justify-center mb-8 z-10 space-x-8">
        <div
          className="relative"
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            borderRadius: '50%',
            backgroundColor: circleColor,
            transition: 'all 1s ease-in-out',
          }}
        ></div>

        <div className="relative">
          <Heart
            size={300}
            className="text-red-500 transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${scale})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-white">
              {isRunning ? timeLeft : ''}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-4 z-10">
        <h3 className="text-3xl font-bold text-red-400">{reminder}</h3>
      </div>

      <div className="flex space-x-4 mb-8 z-10">
        <button
          onClick={toggleStartPause}
          className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetBreathing}
          className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors text-sm"
        >
          Reset
        </button>
      </div>
      
      <div className="text-center text-xs text-gray-400 z-10">
        <p>Duration: {duration}s | Cycles: {cycleCount} / {maxCycles}</p>
      </div>
      
      <div className="mt-4 flex flex-col space-y-2 text-sm z-10">
        <div className="flex items-center space-x-2">
          <label htmlFor="duration" className="text-gray-400">Duration (s):</label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1) {
                setDuration(value);
              }
            }}
            className="w-12 px-1 py-0.5 border rounded bg-gray-800 text-white"
            min="1"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="maxCycles" className="text-gray-400">Max Cycles:</label>
          <input
            id="maxCycles"
            type="number"
            value={maxCycles}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1) {
                setMaxCycles(value);
              }
            }}
            className="w-12 px-1 py-0.5 border rounded bg-gray-800 text-white"
            min="1"
          />
        </div>
      </div>
    </div>
  );
};

export default BreathingGuide;