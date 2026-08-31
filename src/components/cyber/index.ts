/**
 * Barrel export for the GuardianX cyber component library.
 *
 * Cyber security UI primitives used across the homepage, dashboards, and
 * lab experiences. Each component is themeable via the design tokens
 * declared in `src/app/globals.css` (violet primary, cyan accent, dark
 * cinematic surfaces).
 */

export { CyberTerminal } from "./terminal"
export type { TerminalLine, TerminalLineType, CyberTerminalProps } from "./terminal"

export { LabCard } from "./lab-card"
export type { LabCardProps, LabDifficulty, LabStatus } from "./lab-card"

export { MissionCard } from "./mission-card"
export type { MissionCardProps } from "./mission-card"

export { XPBar } from "./xp-bar"
export type { XPBarProps } from "./xp-bar"

export { RankBadge } from "./rank-badge"
export type { RankBadgeProps, RankName } from "./rank-badge"

export { SkillNode } from "./skill-node"
export type {
  SkillNodeProps,
  SkillNodeStatus,
  SkillNodeConnection,
} from "./skill-node"

export { ThreatMap } from "./threat-map"
export type { ThreatMapProps } from "./threat-map"

export { StatTile } from "./stat-tile"
export type { StatTileProps } from "./stat-tile"

export { StatusDot } from "./status-dot"
export type { StatusDotProps, StatusDotStatus } from "./status-dot"

export { FlagInput } from "./flag-input"
export type { FlagInputProps } from "./flag-input"
