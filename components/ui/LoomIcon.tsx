import React from 'react'

/**
 * Loom Brand Mark Icon Component
 * 
 * ============================================================================
 * 👉 INSTRUCTIONS FOR USER:
 * You can paste your custom SVG paths or entire SVG code directly inside this file!
 * If your SVG has its own viewBox or inner gradient definitions (<defs>), feel
 * free to replace the contents inside the <svg> element below, or adjust the
 * attributes as needed.
 * ============================================================================
 */
export function LoomIcon({ className = 'size-6', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 300"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Meta / Infinity Blue-Violet Gradient */}
        <linearGradient id="meta-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7082ff" />
          <stop offset="35%" stopColor="#5567f7" />
          <stop offset="70%" stopColor="#3c4ed8" />
          <stop offset="100%" stopColor="#2a38b5" />
        </linearGradient>

        {/* Subtle Drop Shadow */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.65" />
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#4658ea" floodOpacity="0.2" />
        </filter>
      </defs>


      {/* Smooth Infinity Symbol */}
      <path
        d="M 250,150 
          C 200,95 175,70 140,70 
          C 95,70 70,105 70,150 
          C 70,195 95,230 140,230 
          C 175,230 200,205 250,150 
          C 300,95 325,70 360,70 
          C 405,70 430,105 430,150 
          C 430,195 405,230 360,230 
          C 325,230 300,205 250,150 Z"
        fill="none"
        stroke="url(#meta-grad)"
        strokeWidth="42"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
    </svg>
  )
}
