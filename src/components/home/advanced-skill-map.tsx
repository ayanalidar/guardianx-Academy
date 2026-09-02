"use client"

/**
 * Advanced interactive skill map component for the GuardianX homepage.
 *
 * Purely presentational - takes no props. Reads `SKILL_MAP_DATA` and
 * `SKILL_DOMAINS` from `@/views/home-data` and renders an SVG-based
 * radial skill graph with hover / tap interactions.
 *
 * Moved out of `src/views/home.tsx` so the homepage view file stays
 * small enough for Turbopack to compile reliably. Visual output and
 * behavior are IDENTICAL to the original inline implementation.
 */

import * as React from "react"
import { motion } from "framer-motion"
import { SKILL_MAP_DATA, SKILL_DOMAINS } from "@/views/home-data"

export function AdvancedSkillMap() {
  const [hoveredDomain, setHoveredDomain] = React.useState<number | null>(null)
  const [selectedDomain, setSelectedDomain] = React.useState<number | null>(null)

  const centerX = 50
  const centerY = 50
  const domainRadius = 32 // distance from center to domain nodes
  const skillRadius = 14 // distance from domain node to skill nodes

  return (
    <div className="relative">
      {/* Legend bar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-400" /> Completed</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-400" /> In Progress</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-violet-400/40" /> Available</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-muted-foreground/30" /> Locked</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">35 SKILLS / 7 DOMAINS</span>
      </div>

      {/* SVG-based interactive map */}
      <div className="relative aspect-square max-w-[600px] mx-auto">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Outer ring */}
          <circle cx={centerX} cy={centerY} r={domainRadius + 8} fill="none" stroke="oklch(1 0 0 / 0.05)" strokeWidth="0.3" strokeDasharray="0.5 1" />
          <circle cx={centerX} cy={centerY} r={domainRadius} fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="0.2" />
          <circle cx={centerX} cy={centerY} r={domainRadius - 12} fill="none" stroke="oklch(1 0 0 / 0.05)" strokeWidth="0.2" />

          {/* Connection lines from center to domains */}
          {SKILL_MAP_DATA.map((d, i) => {
            const rad = (d.angle * Math.PI) / 180
            const x = centerX + domainRadius * Math.cos(rad)
            const y = centerY + domainRadius * Math.sin(rad)
            const isActive = hoveredDomain === i || selectedDomain === i
            return (
              <line
                key={`line-${i}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke={isActive ? d.color : "oklch(1 0 0 / 0.12)"}
                strokeWidth={isActive ? "0.6" : "0.3"}
                strokeDasharray={isActive ? "0" : "0.5 1"}
                style={{ transition: "all 0.3s" }}
              />
            )
          })}

          {/* Sub-skill connection lines + nodes */}
          {SKILL_MAP_DATA.map((d, di) => {
            const drad = (d.angle * Math.PI) / 180
            const dx = centerX + domainRadius * Math.cos(drad)
            const dy = centerY + domainRadius * Math.sin(drad)
            const isActive = hoveredDomain === di || selectedDomain === di

            return d.skills.map((skill, si) => {
              // Spread skills in an arc around the domain node
              const spread = 50 // degrees of arc
              const skillAngle = d.angle - spread / 2 + (spread / (d.skills.length - 1)) * si
              const srad = (skillAngle * Math.PI) / 180
              const sx = dx + skillRadius * Math.cos(srad)
              const sy = dy + skillRadius * Math.sin(srad)

              return (
                <g key={`skill-${di}-${si}`}>
                  <line
                    x1={dx}
                    y1={dy}
                    x2={sx}
                    y2={sy}
                    stroke={isActive ? d.color : "oklch(1 0 0 / 0.06)"}
                    strokeWidth={isActive ? "0.3" : "0.15"}
                    style={{ transition: "all 0.3s" }}
                  />
                  <circle
                    cx={sx}
                    cy={sy}
                    r={isActive ? "1.5" : "1"}
                    fill={isActive ? d.color : "oklch(1 0 0 / 0.2)"}
                    style={{ transition: "all 0.3s", cursor: "pointer" }}
                    onClick={() => setSelectedDomain(selectedDomain === di ? null : di)}
                  />
                  {isActive && (
                    <text
                      x={sx}
                      y={sy - 2.5}
                      textAnchor="middle"
                      fill={d.color}
                      fontSize="1.5"
                      fontFamily="monospace"
                      style={{ pointerEvents: "none" }}
                    >
                      {skill.length > 12 ? skill.substring(0, 10) + "..." : skill}
                    </text>
                  )}
                </g>
              )
            })
          })}

          {/* Domain nodes */}
          {SKILL_MAP_DATA.map((d, i) => {
            const rad = (d.angle * Math.PI) / 180
            const x = centerX + domainRadius * Math.cos(rad)
            const y = centerY + domainRadius * Math.sin(rad)
            const isActive = hoveredDomain === i || selectedDomain === i
            const domain = SKILL_DOMAINS[i]
            const status = domain.progress >= 70 ? "completed" : domain.progress >= 30 ? "in-progress" : domain.progress > 0 ? "available" : "locked"

            return (
              <g
                key={`domain-${i}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredDomain(i)}
                onMouseLeave={() => setHoveredDomain(null)}
                onClick={() => setSelectedDomain(selectedDomain === i ? null : i)}
              >
                {/* Pulsing ring for active domains */}
                {isActive && (
                  <circle cx={x} cy={y} r="5" fill="none" stroke={d.color} strokeWidth="0.3" opacity="0.4">
                    <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Domain circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? "4" : "3.5"}
                  fill={d.color}
                  fillOpacity={isActive ? "0.3" : status === "locked" ? "0.05" : "0.15"}
                  stroke={d.color}
                  strokeWidth={isActive ? "0.6" : "0.4"}
                  style={{ transition: "all 0.3s" }}
                />
                {/* Domain label */}
                <text
                  x={x}
                  y={y + 7}
                  textAnchor="middle"
                  fill={isActive ? d.color : "oklch(0.7 0 0)"}
                  fontSize="2"
                  fontWeight="bold"
                  fontFamily="monospace"
                  style={{ pointerEvents: "none", transition: "all 0.3s" }}
                >
                  {d.domain.toUpperCase()}
                </text>
                {/* Progress ring */}
                <circle
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="none"
                  stroke={d.color}
                  strokeWidth="0.8"
                  strokeDasharray={`${(domain.progress / 100) * 22} 22`}
                  strokeDashoffset="0"
                  transform={`rotate(-90 ${x} ${y})`}
                  opacity="0.6"
                  style={{ transition: "all 0.3s" }}
                />
              </g>
            )
          })}

          {/* Central node */}
          <circle cx={centerX} cy={centerY} r="8" fill="oklch(0.6 0.2 295 / 0.15)" stroke="oklch(0.6 0.2 295 / 0.6)" strokeWidth="0.5" />
          <circle cx={centerX} cy={centerY} r="6" fill="none" stroke="oklch(0.6 0.2 295 / 0.3)" strokeWidth="0.3" strokeDasharray="1 1">
            <animateTransform attributeName="transform" type="rotate" from={`0 ${centerX} ${centerY}`} to={`360 ${centerX} ${centerY}`} dur="20s" repeatCount="indefinite" />
          </circle>
          <text x={centerX} y={centerY - 1} textAnchor="middle" fill="oklch(0.8 0.15 295)" fontSize="2.5" fontWeight="bold" fontFamily="monospace">CYBER</text>
          <text x={centerX} y={centerY + 2} textAnchor="middle" fill="oklch(0.8 0.15 295)" fontSize="2.5" fontWeight="bold" fontFamily="monospace">SECURITY</text>
        </svg>

        {/* Hover detail panel */}
        {hoveredDomain !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 left-2 right-2 lg:left-auto lg:right-2 lg:max-w-xs rounded-lg border border-border/60 bg-card/90 backdrop-blur p-3 z-20"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: SKILL_MAP_DATA[hoveredDomain].color }} />
              <span className="text-xs font-bold uppercase tracking-wider">{SKILL_DOMAINS[hoveredDomain].name} Security</span>
              <span className="text-[10px] font-mono text-muted-foreground ml-auto">{SKILL_DOMAINS[hoveredDomain].progress}%</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {SKILL_MAP_DATA[hoveredDomain].skills.map(s => (
                <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{s}</span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile tap hint */}
      <p className="text-center text-[10px] text-muted-foreground/60 mt-2 lg:hidden">Tap a domain to explore skills</p>
    </div>
  )
}
