import React from 'react';

export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #7A1E1E 0%, #3d0f0f 40%, #1a0000 100%)' }}
    >
      {/* Desktop: phone frame */}
      <div
        className="relative w-full max-w-[390px] overflow-hidden"
        style={{
          height: '100dvh',
          maxHeight: '844px',
          borderRadius: '0',
          boxShadow: 'none',
        }}
      >
        {/* Actual phone frame styling on md+ screens */}
        <style>{`
          @media (min-width: 768px) {
            .phone-inner {
              border-radius: 44px !important;
              box-shadow: 0 0 0 10px #111, 0 0 0 14px #333, 0 30px 80px rgba(0,0,0,0.8) !important;
            }
          }
        `}</style>
        <div
          className="phone-inner w-full h-full overflow-hidden relative"
          style={{ background: '#FFF5E4' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
