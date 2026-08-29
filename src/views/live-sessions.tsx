"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAppStore } from "@/store/app-store"
import { useUser } from "@/hooks/use-user"
import { colorFor } from "@/lib/colors"
import { WebRTCSession, type PeerMeta } from "@/lib/webrtc"
import { Whiteboard } from "@/components/platform/whiteboard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Radio, Video, Mic, MicOff, ScreenShare, ScreenShareOff, PhoneOff, Users,
  MessageSquare, Send, Hand, VideoOff, Monitor, Plus, ChevronLeft, Clock,
  ShieldAlert, Volume2, CircleDot, RadioTower, PenLine, Presentation,
  Circle, Download, Square,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface LiveSessionItem {
  id: string; title: string; description: string | null; roomId: string
  status: string; scheduledAt: string; host: { id: string; name: string; title: string | null }
  memberCount: number; isMember: boolean; isHost: boolean
  course: { id: string; title: string; shortName: string } | null
}

export function LiveSessionsView() {
  const { user } = useUser()
  const [activeSession, setActiveSession] = React.useState<LiveSessionItem | null>(null)

  if (activeSession) {
    return <LiveRoom session={activeSession} onLeave={() => setActiveSession(null)} userName={user?.name ?? "Guest"} userId={user?.id ?? ""} isHost={activeSession.isHost} />
  }

  return <SessionList onJoin={setActiveSession} />
}

function SessionList({ onJoin }: { onJoin: (s: LiveSessionItem) => void }) {
  const { navigate } = useAppStore()
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [desc, setDesc] = React.useState("")

  const { data, isLoading } = useQuery<{ sessions: LiveSessionItem[] }>({
    queryKey: ["live-sessions", "all"],
    queryFn: () => api("/api/live-sessions?status=all"),
    refetchInterval: 20000,
  })
  const sessions = data?.sessions ?? []
  const live = sessions.filter((s) => s.status === "live")
  const scheduled = sessions.filter((s) => s.status === "scheduled")
  const ended = sessions.filter((s) => s.status === "ended")

  const createMutation = useMutation({
    mutationFn: () => api("/api/live-sessions", { method: "POST", body: JSON.stringify({ title, description: desc }) }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["live-sessions"] })
      setCreateOpen(false); setTitle(""); setDesc("")
      toast.success("Live session created!")
      onJoin(data.session)
    },
  })

  const joinMutation = useMutation({
    mutationFn: (id: string) => api(`/api/live-sessions/${id}`, { method: "POST", body: JSON.stringify({ action: "join" }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live-sessions"] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Radio className="h-7 w-7 text-red-400" /> Live Sessions
          </h1>
          <p className="text-muted-foreground mt-1">Join live workshops with screen sharing & two-way voice.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-500/90 hover:bg-red-500 text-white"><Plus className="h-4 w-4 mr-1.5" /> Host a Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Host a Live Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Input placeholder="Session title (e.g. Live: OWASP Top 10 Workshop)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="What will you cover? (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} className="min-h-[80px]" />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={() => createMutation.mutate()} disabled={!title.trim() || createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Start Session"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid lg:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : (
        <>
          {/* Live now */}
          {live.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 pulse-dot" /> Live Now ({live.length})
              </h2>
              <div className="grid lg:grid-cols-2 gap-4">
                {live.map((s) => <SessionCard key={s.id} session={s} onJoin={async (ses) => { await joinMutation.mutateAsync(ses.id); onJoin(ses) }} />)}
              </div>
            </div>
          )}

          {/* Scheduled */}
          {scheduled.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><Clock className="h-5 w-5 text-amber-400" /> Upcoming</h2>
              <div className="grid lg:grid-cols-2 gap-4">
                {scheduled.map((s) => <SessionCard key={s.id} session={s} onJoin={async (ses) => { await joinMutation.mutateAsync(ses.id); onJoin(ses) }} />)}
              </div>
            </div>
          )}

          {/* Ended */}
          {ended.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-muted-foreground">Past Sessions</h2>
              <div className="grid lg:grid-cols-2 gap-4">
                {ended.slice(0, 4).map((s) => <SessionCard key={s.id} session={s} onJoin={() => toast.info("This session has ended.")} ended />)}
              </div>
            </div>
          )}

          {sessions.length === 0 && (
            <Card className="p-12 text-center border-dashed">
              <Radio className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-1">No live sessions yet</p>
              <p className="text-sm text-muted-foreground mb-4">Be the first to host a workshop!</p>
            </Card>
          )}
        </>
      )}

      {/* Info banner */}
      <Card className="p-5 bg-gradient-to-br from-cyan-950/30 to-transparent border-cyan-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10"><RadioTower className="h-5 w-5 text-cyan-400" /></div>
          <div>
            <h3 className="font-semibold text-sm mb-1">How live sessions work</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The host shares their screen with two-way voice. Participants can enable their mic to ask questions,
              and the host can grant screen-share control so students can present back. All traffic is peer-to-peer (WebRTC) with end-to-end encrypted media.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function SessionCard({ session, onJoin, ended }: { session: LiveSessionItem; onJoin: (s: LiveSessionItem) => void; ended?: boolean }) {
  return (
    <Card className="p-5 card-hover relative overflow-hidden">
      {session.status === "live" && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/15 text-red-400 text-[10px] font-mono border border-red-500/30 animate-glow-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 pulse-dot" /> LIVE
        </div>
      )}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarFallback className="bg-red-500/10 text-red-400 text-xs">
            {session.host.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-1">{session.title}</h3>
          <p className="text-xs text-muted-foreground">by {session.host.name}</p>
          {session.course && <Badge variant="outline" className="text-[10px] mt-1">{session.course.shortName}</Badge>}
        </div>
      </div>
      {session.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{session.description}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{session.memberCount}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(session.scheduledAt).toLocaleString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}</span>
        </div>
        <Button size="sm" variant={session.status === "live" ? "default" : "outline"} disabled={ended} onClick={() => onJoin(session)}>
          {session.status === "live" ? <><Video className="h-3.5 w-3.5 mr-1" /> Join</> : ended ? "Ended" : "Details"}
        </Button>
      </div>
    </Card>
  )
}

// ============ Live Room (WebRTC) ============
function LiveRoom({ session, onLeave, userName, userId, isHost }: {
  session: LiveSessionItem; onLeave: () => void; userName: string; userId: string; isHost: boolean
}) {
  const qc = useQueryClient()
  const webrtcRef = React.useRef<WebRTCSession | null>(null)
  const [connected, setConnected] = React.useState(false)
  const [peers, setPeers] = React.useState<PeerMeta[]>([])
  const [micOn, setMicOn] = React.useState(false)
  const [sharing, setSharing] = React.useState(false)
  const [presentRequests, setPresentRequests] = React.useState<any[]>([])
  const [chat, setChat] = React.useState<{ userId: string; userName: string; message: string; timestamp: number }[]>([])
  const [chatInput, setChatInput] = React.useState("")
  const [showChat, setShowChat] = React.useState(true)
  const [activePresenterName, setActivePresenterName] = React.useState<string | null>(null)
  const [stageMode, setStageMode] = React.useState<"screen" | "whiteboard">("screen")

  // Video Recording state (records the screen-share stream via MediaRecorder)
  const [recording, setRecording] = React.useState(false)
  const [recordSeconds, setRecordSeconds] = React.useState(0)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const recordedChunksRef = React.useRef<Blob[]>([])
  const recordTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  // remote video elements
  const screenVideoRef = React.useRef<HTMLVideoElement>(null)
  const remoteVoicePeers = React.useRef<Map<string, HTMLAudioElement>>(new Map())
  const voiceContainerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const session_ = new WebRTCSession(session.roomId, userId, userName, isHost ? "host" : "viewer")
    webrtcRef.current = session_

    session_.onPeersChange = (members) => setPeers(members)
    session_.onRemoteStream = (socketId, stream, kind) => {
      if (kind === "screen") {
        // this peer is presenting their screen
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream
          screenVideoRef.current.play().catch(() => {})
        }
      } else {
        // voice — attach to a hidden audio element
        let el = remoteVoicePeers.current.get(socketId)
        if (!el) {
          el = document.createElement("audio")
          el.autoplay = true
          el.setAttribute("playsinline", "")
          voiceContainerRef.current?.appendChild(el)
          remoteVoicePeers.current.set(socketId, el)
        }
        el.srcObject = stream
        el.play().catch(() => {})
      }
    }
    session_.onStreamRemoved = (socketId) => {
      if (screenVideoRef.current && screenVideoRef.current.srcObject) {
        const tracks = (screenVideoRef.current.srcObject as MediaStream).getTracks()
        // only clear if no peers are presenting
      }
      const el = remoteVoicePeers.current.get(socketId)
      if (el) { el.srcObject = null; el.remove(); remoteVoicePeers.current.delete(socketId) }
    }
    session_.onChat = (msg) => setChat((c) => [...c, msg])
    session_.onPresenterChange = (_socketId, name) => {
      setActivePresenterName(name)
      toast.info(`${name} is now presenting`)
    }
    session_.onPresentRequest = (req) => {
      setPresentRequests((r) => [...r, req])
      toast.info(`${req.userName} requested to present`)
    }

    session_.connect().then(() => setConnected(true))

    return () => {
      session_.disconnect()
      // cleanup audio els
      remoteVoicePeers.current.forEach((el) => { el.srcObject = null; el.remove() })
      remoteVoicePeers.current.clear()
    }
  }, [session.id])

  async function toggleMic() {
    const next = !micOn
    await webrtcRef.current?.toggleMic(next)
    setMicOn(next)
    toast.success(next ? "Microphone on" : "Microphone muted")
  }

  async function toggleShare() {
    if (sharing) {
      webrtcRef.current?.stopScreenShare()
      setSharing(false)
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null
    } else {
      const ok = await webrtcRef.current?.startScreenShare()
      if (ok) {
        setSharing(true)
        // show own screen preview
        if (screenVideoRef.current && webrtcRef.current?.screenStream) {
          screenVideoRef.current.srcObject = webrtcRef.current.screenStream
          screenVideoRef.current.play().catch(() => {})
        }
        toast.success("Screen sharing started")
      } else {
        toast.error("Screen share failed or was denied")
      }
    }
  }

  function requestPresent() {
    webrtcRef.current?.requestPresent()
    toast.success("Requested to present — waiting for host approval")
  }

  function approveRequest(req: any) {
    webrtcRef.current?.grantPresent(req.socketId)
    setPresentRequests((r) => r.filter((x) => x.socketId !== req.socketId))
  }

  function sendChat() {
    if (!chatInput.trim()) return
    webrtcRef.current?.sendChat(chatInput)
    setChat((c) => [...c, { userId, userName: "You", message: chatInput, timestamp: Date.now() }])
    setChatInput("")
  }

  async function leaveCall() {
    // Stop recording if active
    if (recording) {
      stopRecording()
    }
    await api(`/api/live-sessions/${session.id}`, { method: "POST", body: JSON.stringify({ action: "leave" }) })
    if (isHost) {
      await api(`/api/live-sessions/${session.id}`, { method: "POST", body: JSON.stringify({ action: "end" }) })
    }
    qc.invalidateQueries({ queryKey: ["live-sessions"] })
    onLeave()
  }

  // ===== Video Recording (MediaRecorder API) =====
  function startRecording() {
    const videoEl = screenVideoRef.current
    const stream = videoEl?.srcObject as MediaStream | null
    if (!stream || stream.getTracks().length === 0) {
      toast.error("Start screen sharing first to record the session.")
      return
    }
    try {
      recordedChunksRef.current = []
      // Prefer video/webm; fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : ""
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        const stamp = new Date().toISOString().replace(/[:.]/g, "-")
        a.download = `guardianx-${session.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${stamp}.webm`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Recording saved to your downloads.")
      }
      recorder.start(1000) // collect data every 1s
      mediaRecorderRef.current = recorder
      setRecording(true)
      setRecordSeconds(0)
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)
      toast.success("Recording started")
    } catch (err) {
      console.error(err)
      toast.error("Recording failed to start.")
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") {
      recorder.stop()
    }
    mediaRecorderRef.current = null
    setRecording(false)
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
  }

  function formatRecordTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={leaveCall} className="text-muted-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" /> Leave
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 pulse-dot" /> {session.title}
            </h1>
            <p className="text-xs text-muted-foreground">{peers.length + 1} participant{(peers.length + 1) !== 1 ? "s" : ""} · {connected ? "Connected" : "Connecting..."}</p>
          </div>
        </div>
        {activePresenterName && (
          <Badge className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Monitor className="h-3 w-3 mr-1" /> Presenting: {activePresenterName}
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Main stage */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stage mode switcher (Screen Share / Whiteboard) */}
          <div className="flex items-center gap-2">
            <Button
              variant={stageMode === "screen" ? "default" : "outline"}
              size="sm"
              onClick={() => setStageMode("screen")}
              className={stageMode === "screen" ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400" : ""}
            >
              <Monitor className="h-3.5 w-3.5 mr-1.5" /> Screen Share
            </Button>
            <Button
              variant={stageMode === "whiteboard" ? "default" : "outline"}
              size="sm"
              onClick={() => setStageMode("whiteboard")}
              className={stageMode === "whiteboard" ? "bg-cyan-500 text-cyan-950 hover:bg-cyan-400" : ""}
            >
              <PenLine className="h-3.5 w-3.5 mr-1.5" /> Whiteboard
            </Button>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              {stageMode === "whiteboard" && (
                <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30 bg-cyan-500/10">
                  <Presentation className="h-2.5 w-2.5 mr-1" /> Live collaborative whiteboard
                </Badge>
              )}
            </div>
          </div>

          {stageMode === "whiteboard" ? (
            <Whiteboard
              roomId={session.roomId}
              userId={userId}
              userName={userName}
              role={isHost ? "host" : "viewer"}
              height={500}
            />
          ) : (
            <Card className="overflow-hidden relative bg-black/40 border-border min-h-[400px] flex items-center justify-center">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-xs">
                {recording ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-red-500 pulse-dot" />
                    <span className="font-mono text-red-400">REC {formatRecordTime(recordSeconds)}</span>
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400/60" />
                    <span className="font-mono text-red-400/70">REC</span>
                  </>
                )}
                <span className="text-muted-foreground">·</span>
                <Video className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">{sharing ? "Presenting" : activePresenterName ? "Viewing" : "No presentation"}</span>
              </div>
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted={sharing} // mute local preview to avoid echo
                className={cn("w-full h-full max-h-[500px] object-contain", !sharing && !activePresenterName && "hidden")}
              />
              {!sharing && !activePresenterName && (
                <div className="text-center p-8">
                  <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">No one is presenting yet.</p>
                  {isHost ? (
                    <Button onClick={toggleShare} variant="outline"><ScreenShare className="h-4 w-4 mr-1.5" /> Share Your Screen</Button>
                  ) : (
                    <Button onClick={requestPresent} variant="outline"><Hand className="h-4 w-4 mr-1.5" /> Request to Present</Button>
                  )}
                </div>
              )}
              {/* hidden voice container */}
              <div ref={voiceContainerRef} className="hidden" />
            </Card>
          )}

          {/* Controls */}
          <Card className="p-3 flex items-center justify-center gap-2">
            <Button
              variant={micOn ? "default" : "outline"}
              size="sm"
              onClick={toggleMic}
              className={micOn ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400" : ""}
            >
              {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              <span className="ml-1.5">{micOn ? "Mute" : "Unmute"}</span>
            </Button>
            <Button variant={sharing ? "destructive" : "outline"} size="sm" onClick={toggleShare}>
              {sharing ? <ScreenShareOff className="h-4 w-4" /> : <ScreenShare className="h-4 w-4" />}
              <span className="ml-1.5">{sharing ? "Stop Share" : "Share Screen"}</span>
            </Button>
            {!isHost && !sharing && (
              <Button variant="outline" size="sm" onClick={requestPresent}>
                <Hand className="h-4 w-4" /><span className="ml-1.5">Raise Hand</span>
              </Button>
            )}
            <div className="h-6 w-px bg-border mx-1" />
            {recording ? (
              <Button variant="destructive" size="sm" onClick={stopRecording} className="gap-1.5">
                <Square className="h-3.5 w-3.5 fill-current" />
                <span className="font-mono text-xs">{formatRecordTime(recordSeconds)}</span>
                <span className="ml-1">Stop Rec</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={startRecording}
                disabled={stageMode !== "screen" || (!sharing && !activePresenterName)}
                title={stageMode !== "screen" ? "Switch to Screen Share to record" : (!sharing && !activePresenterName) ? "Waiting for a screen share to record" : "Record the screen share"}
              >
                <Circle className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                <span className="ml-1.5">Record</span>
              </Button>
            )}
            <div className="h-6 w-px bg-border mx-1" />
            <Button variant="ghost" size="sm" onClick={() => setShowChat((s) => !s)}>
              <MessageSquare className="h-4 w-4" /><span className="ml-1.5">Chat</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-500" onClick={leaveCall}>
              <PhoneOff className="h-4 w-4" /><span className="ml-1.5">Leave</span>
            </Button>
          </Card>

          {/* Present requests (host only) */}
          {isHost && presentRequests.length > 0 && (
            <Card className="p-4 border-amber-500/30 bg-amber-500/5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Hand className="h-4 w-4 text-amber-400" /> Presentation Requests</h3>
              <div className="space-y-2">
                {presentRequests.map((req) => (
                  <div key={req.socketId} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                    <span className="text-sm">{req.userName} wants to present</span>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approveRequest(req)}>Approve</Button>
                      <Button size="sm" variant="ghost" onClick={() => setPresentRequests((r) => r.filter((x) => x.socketId !== req.socketId))}>Dismiss</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar: participants + chat */}
        <div className="space-y-4">
          {/* Participants */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-emerald-400" /> Participants
              <Badge variant="outline" className="text-[10px] ml-auto">{peers.length + 1}</Badge>
            </h3>
            <ScrollArea className="h-48 pr-2">
              <div className="space-y-2">
                <ParticipantRow name={userName + " (You)"} role={isHost ? "Host" : "You"} micOn={micOn} presenting={sharing} isYou />
                {peers.map((p) => (
                  <ParticipantRow key={p.socketId} name={p.userName} role={p.role} micOn={p.micOn} presenting={p.isPresenting} />
                ))}
                {peers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Waiting for others to join...</p>}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat */}
          {showChat && (
            <Card className="p-4 flex flex-col h-[300px]">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-cyan-400" /> Live Chat
              </h3>
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-2">
                  {chat.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No messages yet. Say hi!</p>}
                  {chat.map((m, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium text-emerald-400">{m.userName}: </span>
                      <span className="text-muted-foreground">{m.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-1 mt-2">
                <Input placeholder="Message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} className="h-8 text-xs" />
                <Button size="icon" className="h-8 w-8 shrink-0" onClick={sendChat}><Send className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>
          )}

          <Card className="p-3 border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Media is peer-to-peer via WebRTC. Grant mic/screen permissions when your browser prompts. Echo cancellation is on by default.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ParticipantRow({ name, role, micOn, presenting, isYou }: { name: string; role: string; micOn: boolean; presenting: boolean; isYou?: boolean }) {
  return (
    <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent/30">
      <Avatar className="h-7 w-7">
        <AvatarFallback className="bg-emerald-500/10 text-emerald-400 text-[10px]">
          {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">{name}</div>
        <div className="text-[10px] text-muted-foreground">{role}</div>
      </div>
      {presenting && <Monitor className="h-3.5 w-3.5 text-cyan-400" />}
      {micOn ? <Mic className="h-3 w-3 text-emerald-400" /> : <MicOff className="h-3 w-3 text-muted-foreground" />}
    </div>
  )
}
