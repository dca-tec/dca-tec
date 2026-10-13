import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import logo3dImg from "../assets/images/dca_tec_3d_logo_1791860209311.jpg";

interface Logo3DProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export default function Logo3D({
  size = "md",
  className = "",
  showText = false,
  interactive = true,
  onClick,
}: Logo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-44 h-44 md:w-60 md:h-60",
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Calculate tilt angles (-20 to +20 degrees)
    const rotX = -((y - centerY) / centerY) * 18;
    const rotY = ((x - centerX) / centerX) * 18;
    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <div 
      className={`inline-flex items-center gap-3 select-none ${className}`}
      onClick={onClick}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 800 }}
        className={`relative ${sizeClasses[size]} cursor-pointer group`}
      >
        {/* Glow backdrop */}
        <div 
          className="absolute -inset-2 bg-gradient-to-r from-[#00ffe0]/40 to-[#0070f3]/40 rounded-2xl blur-lg transition-opacity duration-300 pointer-events-none"
          style={{ opacity: isHovered ? 0.9 : 0.4 }}
        />

        {/* 3D Card Container */}
        <motion.div
          animate={{
            rotateX: isHovered ? rotateX : [0, 6, -6, 0],
            rotateY: isHovered ? rotateY : [0, -8, 8, 0],
            scale: isHovered ? 1.08 : 1,
          }}
          transition={{
            rotateX: isHovered ? { type: "spring", stiffness: 300, damping: 20 } : { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotateY: isHovered ? { type: "spring", stiffness: 300, damping: 20 } : { duration: 6, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.2 },
          }}
          style={{ transformStyle: "preserve-3d" }}
          className="w-full h-full relative rounded-2xl overflow-hidden border border-[#00ffe0]/40 shadow-[0_0_25px_rgba(0,255,224,0.3)] bg-black/80 flex items-center justify-center"
        >
          {/* Holographic light sweep */}
          <div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ transform: `translateZ(20px)` }}
          />

          {/* 3D Logo Image */}
          <img
            src={logo3dImg}
            alt="DCA TEC 3D Logo"
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: `translateZ(10px)` }}
          />

          {/* Cyan Corner Accents */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[#00ffe0] pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[#00ffe0] pointer-events-none" />
        </motion.div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="text-xl md:text-2xl font-black tracking-[4px] hero-gradient-text leading-tight">
            DCA TEC
          </div>
          <div className="text-[9px] uppercase tracking-[2px] text-[#00ffe0]/70 font-semibold">
            Technology Corporation
          </div>
        </div>
      )}
    </div>
  );
}
