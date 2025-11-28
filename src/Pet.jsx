import React, { useState, useEffect, useRef } from 'react';
  
// Work in progress, and also making myself tear my hair apart by just refusing to draw the thing

const DesktopPet = () => {
  const [position, setPosition] = useState({ x: window.innerWidth - 160, y: window.innerHeight - 180 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [state, setState] = useState('idle'); // idle, focused, celebrating, sleeping
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [blinkBoth, setBlinkBoth] = useState(false);
  const petRef = useRef(null);

  const messages = {
    focused: ['Deep work time...', 'Stay in the zone', 'You got this', 'Focus mode activated'],
    celebrating: ['Great session!', 'Well done!', 'Keep it up!', 'Nice work!'],
    break: ['Time to rest', 'Take a breather', 'Stretch a bit', 'Recharge time']
  };

  // Load saved position
  useEffect(() => {
    const saved = localStorage.getItem('petPosition');
    if (saved) {
      setPosition(JSON.parse(saved));
    }
  }, []);

  // Listen for Pomodoro events
  useEffect(() => {
    const handlePomodoroStart = () => {
      setState('focused');
      setMessage('Let\'s focus!');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    };

    const handlePomodoroComplete = () => {
      setState('celebrating');
      setMessage(messages.celebrating[Math.floor(Math.random() * messages.celebrating.length)]);
      setShowMessage(true);
      setTimeout(() => {
        setState('idle');
        setShowMessage(false);
      }, 3000);
    };

    const handleBreakStart = () => {
      setState('sleeping');
      setMessage(messages.break[Math.floor(Math.random() * messages.break.length)]);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    };

    // Listen for storage changes from Pomodoro timer
    const checkPomodoroState = () => {
      const pomodoroState = localStorage.getItem('pomodoroState');
      if (pomodoroState === 'working') {
        if (state !== 'focused') setState('focused');
      } else if (pomodoroState === 'break') {
        if (state !== 'sleeping') setState('sleeping');
      } else {
        if (state !== 'idle') setState('idle');
      }
    };

    const interval = setInterval(checkPomodoroState, 1000);

    window.addEventListener('pomodoroStart', handlePomodoroStart);
    window.addEventListener('pomodoroComplete', handlePomodoroComplete);
    window.addEventListener('breakStart', handleBreakStart);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pomodoroStart', handlePomodoroStart);
      window.removeEventListener('pomodoroComplete', handlePomodoroComplete);
      window.removeEventListener('breakStart', handleBreakStart);
    };
  }, [state]);

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkBoth(true);
      setTimeout(() => setBlinkBoth(false), 150);
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Occasional messages when focused
  useEffect(() => {
    if (state === 'focused') {
      const messageInterval = setInterval(() => {
        setMessage(messages.focused[Math.floor(Math.random() * messages.focused.length)]);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2500);
      }, 180000); // Every 3 minutes

      return () => clearInterval(messageInterval);
    }
  }, [state]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newPos = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      setPosition(newPos);
      localStorage.setItem('petPosition', JSON.stringify(newPos));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePetClick = () => {
    if (!isDragging) {
      const messageSet = messages[state === 'focused' ? 'focused' : 'celebrating'];
      setMessage(messageSet[Math.floor(Math.random() * messageSet.length)]);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <>
      <div
        ref={petRef}
        onMouseDown={handleMouseDown}
        onClick={handlePetClick}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 9999,
          userSelect: 'none'
        }}
      >
        {/* Speech bubble */}
        {showMessage && (
          <div className="speech-bubble">
            {message}
          </div>
        )}
        
        {/* Desk/Perch */}
        {(state === 'focused' || state === 'sleeping') && (
          <div className="desk"></div>
        )}
        
        {/* Owl */}
        <div className={`owl-container owl-${state}`}>
          {/* Ear tufts */}
          <div className="ear-tuft ear-tuft-left"></div>
          <div className="ear-tuft ear-tuft-right"></div>
          
          {/* Head */}
          <div className="owl-head">
            {/* Eye areas */}
            <div className="eye-area eye-area-left">
              <div className={`eye-white ${blinkBoth || state === 'sleeping' ? 'blinking' : ''}`}>
                <div className="pupil">
                  <div className="pupil-highlight"></div>
                </div>
              </div>
            </div>
            
            <div className="eye-area eye-area-right">
              <div className={`eye-white ${blinkBoth || state === 'sleeping' ? 'blinking' : ''}`}>
                <div className="pupil">
                  <div className="pupil-highlight"></div>
                </div>
              </div>
            </div>
            
            {/* Beak */}
            <div className="beak"></div>
          </div>
          
          {/* Body */}
          <div className="owl-body">
            <div className="wing wing-left"></div>
            <div className="wing wing-right"></div>
            <div className="belly"></div>
          </div>
          
          {/* Feet */}
          <div className="feet">
            <div className="foot foot-left"></div>
            <div className="foot foot-right"></div>
          </div>

          {/* Focus indicator */}
          {state === 'focused' && (
            <div className="focus-indicator">
              <div className="focus-ring"></div>
              <div className="focus-ring"></div>
              <div className="focus-ring"></div>
            </div>
          )}

          {/* Celebration particles */}
          {state === 'celebrating' && (
            <div className="celebration">
              <div className="particle particle-1">✨</div>
              <div className="particle particle-2">⭐</div>
              <div className="particle particle-3">✨</div>
              <div className="particle particle-4">⭐</div>
            </div>
          )}

          {/* Sleep ZZZ */}
          {state === 'sleeping' && (
            <div className="sleep-indicator">
              <div className="zzz zzz-1">z</div>
              <div className="zzz zzz-2">z</div>
              <div className="zzz zzz-3">z</div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .owl-container {
          position: relative;
          width: 120px;
          height: 140px;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
          transition: transform 0.4s ease;
        }
        
        .owl-idle {
          animation: owlIdle 4s ease-in-out infinite;
        }
        
        .owl-focused {
          animation: owlFocused 2s ease-in-out infinite;
        }

        .owl-celebrating {
          animation: owlCelebrate 0.6s ease infinite;
        }

        .owl-sleeping {
          animation: owlSleeping 3s ease-in-out infinite;
        }

        /* Desk */
        .desk {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 140px;
          height: 8px;
          background: linear-gradient(to bottom, #6b5d4f 0%, #4a3f35 100%);
          border-radius: 4px;
          z-index: -1;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .desk::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 2px;
          background: rgba(0,0,0,0.3);
          filter: blur(2px);
        }
        
        /* Ear tufts */
        .ear-tuft {
          position: absolute;
          width: 16px;
          height: 26px;
          background: linear-gradient(to bottom, #8b6f47 0%, #a0826d 100%);
          border-radius: 50% 50% 0 0;
          top: -6px;
          z-index: 1;
          transition: transform 0.3s ease;
        }
        
        .ear-tuft-left {
          left: 22px;
          transform: rotate(-15deg);
        }
        
        .ear-tuft-right {
          right: 22px;
          transform: rotate(15deg);
        }

        .owl-focused .ear-tuft-left {
          transform: rotate(-25deg);
        }

        .owl-focused .ear-tuft-right {
          transform: rotate(25deg);
        }
        
        /* Head */
        .owl-head {
          position: absolute;
          width: 100px;
          height: 90px;
          background: linear-gradient(135deg, #a0826d 0%, #8b6f47 100%);
          border-radius: 45% 45% 40% 40%;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
        }
        
        /* Eyes */
        .eye-area {
          position: absolute;
          width: 34px;
          height: 34px;
          background: radial-gradient(circle, #6b5d4f 0%, #4a3f35 100%);
          border-radius: 50%;
          top: 26px;
          z-index: 3;
        }
        
        .eye-area-left {
          left: 14px;
        }
        
        .eye-area-right {
          right: 14px;
        }
        
        .eye-white {
          position: absolute;
          width: 26px;
          height: 26px;
          background: #f5f5dc;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          overflow: hidden;
          transition: height 0.15s ease, background 0.3s ease;
        }
        
        .eye-white.blinking {
          height: 2px;
        }

        .owl-focused .eye-white {
          background: #fff;
        }
        
        .pupil {
          position: absolute;
          width: 13px;
          height: 13px;
          background: #1a1a1a;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.3s ease;
        }

        .owl-focused .pupil {
          width: 10px;
          height: 10px;
        }
        
        .pupil-highlight {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
        }
        
        /* Beak */
        .beak {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 11px solid #e6a854;
          top: 58px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
        }
        
        /* Body */
        .owl-body {
          position: absolute;
          width: 80px;
          height: 70px;
          background: linear-gradient(to bottom, #a0826d 0%, #8b6f47 100%);
          border-radius: 45% 45% 50% 50%;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1;
        }
        
        .belly {
          position: absolute;
          width: 48px;
          height: 52px;
          background: linear-gradient(to bottom, #c9b8a3 0%, #b8a08d 100%);
          border-radius: 50%;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        /* Wings */
        .wing {
          position: absolute;
          width: 28px;
          height: 45px;
          background: linear-gradient(135deg, #8b6f47 0%, #6b5d4f 100%);
          border-radius: 0 50% 50% 0;
          top: 12px;
          transition: transform 0.3s ease;
        }
        
        .wing-left {
          left: -6px;
          border-radius: 50% 0 0 50%;
          transform-origin: right center;
        }
        
        .wing-right {
          right: -6px;
          border-radius: 0 50% 50% 0;
          transform-origin: left center;
        }

        .owl-celebrating .wing-left {
          animation: wingFlapLeft 0.3s ease infinite;
        }

        .owl-celebrating .wing-right {
          animation: wingFlapRight 0.3s ease infinite;
        }
        
        /* Feet */
        .feet {
          position: absolute;
          bottom: -3px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 18px;
          z-index: 0;
        }
        
        .foot {
          width: 18px;
          height: 7px;
          background: #e6a854;
          border-radius: 50% 50% 0 0;
          position: relative;
        }
        
        .foot::before,
        .foot::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 3px;
          background: #e6a854;
          bottom: 0;
        }
        
        .foot::before {
          left: -5px;
          transform: rotate(-25deg);
          transform-origin: right bottom;
        }
        
        .foot::after {
          right: -5px;
          transform: rotate(25deg);
          transform-origin: left bottom;
        }

        /* Focus indicator */
        .focus-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 150px;
          height: 150px;
          pointer-events: none;
        }

        .focus-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border: 2px solid rgba(99, 102, 241, 0.3);
          border-radius: 50%;
          animation: focusRingPulse 2s ease-in-out infinite;
        }

        .focus-ring:nth-child(2) {
          animation-delay: 0.6s;
        }

        .focus-ring:nth-child(3) {
          animation-delay: 1.2s;
        }

        /* Celebration particles */
        .celebration {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 120px;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          font-size: 20px;
          animation: particleFloat 1.5s ease-in-out infinite;
        }

        .particle-1 {
          top: 0;
          left: 20%;
          animation-delay: 0s;
        }

        .particle-2 {
          top: 10px;
          right: 20%;
          animation-delay: 0.3s;
        }

        .particle-3 {
          top: -10px;
          left: 50%;
          animation-delay: 0.6s;
        }

        .particle-4 {
          top: 20px;
          left: 35%;
          animation-delay: 0.9s;
        }

        /* Sleep indicator */
        .sleep-indicator {
          position: absolute;
          top: -30px;
          right: -20px;
          pointer-events: none;
        }

        .zzz {
          position: absolute;
          font-size: 18px;
          color: #6b5d4f;
          font-weight: bold;
          font-family: serif;
          opacity: 0;
          animation: zzzFloat 3s ease-in-out infinite;
        }

        .zzz-1 {
          animation-delay: 0s;
        }

        .zzz-2 {
          animation-delay: 1s;
          font-size: 22px;
        }

        .zzz-3 {
          animation-delay: 2s;
          font-size: 26px;
        }
        
        /* Speech bubble */
        .speech-bubble {
          position: absolute;
          bottom: 155px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border: 2px solid #1a1a1a;
          border-radius: 8px;
          padding: 8px 12px;
          box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
          white-space: nowrap;
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          animation: bubblePop 0.3s ease;
          z-index: 10;
          font-family: 'Courier New', monospace;
        }
        
        .speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid white;
        }

        .speech-bubble::before {
          content: '';
          position: absolute;
          bottom: -13px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 13px solid #1a1a1a;
          z-index: -1;
        }
        
        /* Animations */
        @keyframes owlIdle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(0deg); }
        }
        
        @keyframes owlFocused {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.02); }
        }

        @keyframes owlCelebrate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(-5deg); }
          75% { transform: translateY(-8px) rotate(5deg); }
        }

        @keyframes owlSleeping {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(2px) rotate(-3deg); }
        }

        @keyframes wingFlapLeft {
          0%, 100% { transform: scaleX(1) translateX(0); }
          50% { transform: scaleX(0.7) translateX(-3px); }
        }

        @keyframes wingFlapRight {
          0%, 100% { transform: scaleX(1) translateX(0); }
          50% { transform: scaleX(0.7) translateX(3px); }
        }

        @keyframes focusRingPulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          50% { opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
        }

        @keyframes particleFloat {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-30px) scale(1.2); opacity: 0; }
        }

        @keyframes zzzFloat {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: translate(10px, -40px); opacity: 0; }
        }
        
        @keyframes bubblePop {
          0% { transform: translateX(-50%) scale(0); opacity: 0; }
          50% { transform: translateX(-50%) scale(1.05); }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default DesktopPet;