import React, { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { buildFounderTimeline, founderRecordingDuration } from './founderTranscript'
import './styles.css'

function MotionField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frameId
    let width = 0
    let height = 0
    let particles = []
    let lastFrame = 0

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)

      const count = Math.min(70, Math.max(28, Math.round((width * height) / 22000)))
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.14 + Math.random() * 0.28,
        size: index % 9 === 0 ? 1.8 : 0.75 + Math.random(),
        alpha: 0.15 + Math.random() * 0.5,
      }))
    }

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height)
      const delta = Math.min(32, time - lastFrame || 16)
      lastFrame = time

      for (const particle of particles) {
        if (!reducedMotion) {
          particle.x += particle.speed * (delta / 16)
          particle.y -= particle.speed * 0.12 * (delta / 16)
        }

        if (particle.x > width + 10) particle.x = -10
        if (particle.y < -10) particle.y = height + 10

        context.beginPath()
        context.fillStyle = `rgba(93, 174, 255, ${particle.alpha})`
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        context.fill()
      }

      const stride = width < 600 ? 72 : 96
      context.lineWidth = 1
      for (let x = -height; x < width + height; x += stride) {
        context.beginPath()
        context.strokeStyle = 'rgba(53, 132, 255, 0.045)'
        context.moveTo(x, height)
        context.lineTo(x + height * 0.72, 0)
        context.stroke()
      }

      if (!reducedMotion) frameId = window.requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="motion-field" aria-hidden="true" />
}

function SpeedMark() {
  return (
    <a
      className="speed-mark-link"
      href="https://snowsproam.com"
      aria-label="Visit Snows ProAm"
    >
      <img
        className="speed-mark"
        src="/snows-proam-logo.png"
        alt="Snows ProAm"
        width="72"
        height="72"
      />
    </a>
  )
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

function FounderMessage({ onEnded, onProgress, onStarted }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioError, setAudioError] = useState(false)

  useEffect(() => {
    if (!isPlaying) return undefined

    let frameId
    let lastUpdate = 0
    const syncPlayback = (timestamp) => {
      const audio = audioRef.current
      if (!audio || audio.paused || audio.ended) return

      if (timestamp - lastUpdate >= 100) {
        lastUpdate = timestamp
        setCurrentTime(audio.currentTime)
        onProgress(audio.currentTime, audio.duration || duration)
      }

      frameId = window.requestAnimationFrame(syncPlayback)
    }

    frameId = window.requestAnimationFrame(syncPlayback)
    return () => window.cancelAnimationFrame(frameId)
  }, [duration, isPlaying, onProgress])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!audio.paused) {
      audio.pause()
      return
    }

    setAudioError(false)
    setIsLoading(true)

    try {
      await audio.play()
    } catch {
      setAudioError(true)
      setIsLoading(false)
    }
  }

  const seekMessage = (event) => {
    const nextTime = Number(event.target.value)
    if (!audioRef.current || !Number.isFinite(nextTime)) return

    audioRef.current.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0
  const status = audioError
    ? 'AUDIO UNAVAILABLE — PRESS TO RETRY'
    : isLoading
      ? 'CONNECTING TO THE MESSAGE'
      : isPlaying
        ? 'MESSAGE IN MOTION'
        : 'PRESS PLAY TO BEGIN'

  return (
    <section className={`founder-message${isPlaying ? ' is-playing' : ''}`} aria-label="A message from the founder">
      <audio
        ref={audioRef}
        src="/audio/whereab.wav"
        preload="metadata"
        onLoadedMetadata={(event) => {
          const nextDuration = event.currentTarget.duration || 0
          setDuration(nextDuration)
          onProgress(0, nextDuration)
        }}
        onDurationChange={(event) => {
          const nextDuration = event.currentTarget.duration || 0
          setDuration(nextDuration)
          onProgress(event.currentTarget.currentTime, nextDuration)
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime)
          onProgress(event.currentTarget.currentTime, event.currentTarget.duration || duration)
        }}
        onPlay={() => {
          setIsPlaying(true)
          onStarted()
        }}
        onPlaying={() => setIsLoading(false)}
        onPause={() => {
          setIsPlaying(false)
          setIsLoading(false)
        }}
        onWaiting={() => setIsLoading(true)}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTime(0)
          onProgress(0, duration)
          onEnded()
        }}
        onError={() => {
          setAudioError(true)
          setIsPlaying(false)
          setIsLoading(false)
        }}
      >
        Your browser does not support the founder audio message.
      </audio>

      <button
        className={`founder-play${isLoading ? ' is-loading' : ''}`}
        type="button"
        onClick={togglePlayback}
        aria-label={`${isPlaying ? 'Pause' : 'Play'} message from the founder`}
        aria-pressed={isPlaying}
      >
        {isLoading ? (
          <span className="audio-spinner" aria-hidden="true" />
        ) : isPlaying ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5.5v13l10-6.5z" />
          </svg>
        )}
      </button>

      <div className="founder-content">
        <div className="founder-heading">
          <strong>A MESSAGE FROM THE FOUNDER</strong>
          <span>{formatTime(currentTime)} / {duration ? formatTime(duration) : '--:--'}</span>
        </div>
        <input
          className="founder-progress"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={seekMessage}
          disabled={!duration || audioError}
          aria-label="Seek message from the founder"
          style={{ '--audio-progress': `${progress}%` }}
        />
        <span className="founder-status" aria-live="polite">{status}</span>
      </div>
    </section>
  )
}

function TranscriptRail({ activeIndex, hasStarted, side, timeline }) {
  const sideOffset = side === 'left' ? 0 : 1
  let focusIndex = sideOffset

  if (hasStarted && activeIndex >= 0) {
    if (activeIndex % 2 === sideOffset) {
      focusIndex = activeIndex
    } else if (activeIndex + 1 < timeline.length) {
      focusIndex = activeIndex + 1
    } else {
      focusIndex = Math.max(sideOffset, activeIndex - 1)
    }
  }

  const visibleIndexes = [focusIndex - 2, focusIndex, focusIndex + 2]
    .filter((index) => index >= 0 && index < timeline.length && index % 2 === sideOffset)

  return (
    <aside className={`transcript-rail transcript-rail-${side}`} aria-hidden="true">
      <span className="transcript-label">
        {side === 'left' ? 'FOUNDER / VOICE' : 'LIVE / TRANSCRIPT'}
      </span>
      <div className="transcript-stack">
        {visibleIndexes.map((index) => {
          const cue = timeline[index]
          const isCurrent = hasStarted && index === activeIndex
          const isPast = hasStarted && index < activeIndex

          return (
            <p
              className={`transcript-line${isCurrent ? ' is-current' : ''}${isPast ? ' is-past' : ''}`}
              key={`${side}-${index}`}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {cue.text}
            </p>
          )
        })}
      </div>
    </aside>
  )
}

function CompactTranscript({ activeCue, hasStarted }) {
  return (
    <div className={`compact-transcript${hasStarted ? ' is-active' : ''}`} aria-hidden="true">
      <span>{hasStarted ? 'NOW SPEAKING' : 'FOUNDER MESSAGE'}</span>
      <p>{hasStarted && activeCue ? activeCue.text : 'Press play to follow the message.'}</p>
    </div>
  )
}

function App() {
  const [transcriptState, setTranscriptState] = useState({
    currentTime: 0,
    duration: founderRecordingDuration,
    hasStarted: false,
  })
  const timeline = useMemo(
    () => buildFounderTimeline(transcriptState.duration),
    [transcriptState.duration],
  )
  const matchedIndex = timeline.findIndex(
    (cue) => transcriptState.currentTime >= cue.start && transcriptState.currentTime < cue.end,
  )
  const activeIndex = transcriptState.hasStarted
    ? matchedIndex >= 0 ? matchedIndex : timeline.length - 1
    : -1
  const activeCue = activeIndex >= 0 ? timeline[activeIndex] : null
  const handleTranscriptEnded = useCallback(() => {
    setTranscriptState((state) => ({ ...state, currentTime: 0, hasStarted: false }))
  }, [])
  const handleTranscriptProgress = useCallback((currentTime, duration) => {
    setTranscriptState((state) => ({
      ...state,
      currentTime,
      duration: duration || state.duration,
    }))
  }, [])
  const handleTranscriptStarted = useCallback(() => {
    setTranscriptState((state) => ({ ...state, hasStarted: true }))
  }, [])

  return (
    <main className="experience">
      <MotionField />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <TranscriptRail
        activeIndex={activeIndex}
        hasStarted={transcriptState.hasStarted}
        side="left"
        timeline={timeline}
      />

      <section className="signal-shell" aria-labelledby="page-title">
        <div className="orbit orbit-a" aria-hidden="true" />
        <div className="orbit orbit-b" aria-hidden="true" />

        <article className="signal-card">
          <header className="card-meta">
            <span>SNOWS PROAM</span>
            <span>EST. 2026</span>
          </header>

          <div className="identity">
            <SpeedMark />
            <p className="eyebrow">A GLOBAL MOVEMENT BY SNOWS PROAM</p>
            <h1 id="page-title">
              <span>WORLDWIDE</span>
              <span className="accent-word">STEPS</span>
              <span>TOGETHER</span>
            </h1>

            <FounderMessage
              onEnded={handleTranscriptEnded}
              onProgress={handleTranscriptProgress}
              onStarted={handleTranscriptStarted}
            />

            <a
              className="first-step-cta"
              href="https://snowsproam.com/worldwide-steps"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join Worldwide Steps on Snows ProAm"
            >
              <span className="step-number" aria-hidden="true">01</span>
              <span className="step-copy">
                <strong>JOIN WORLDWIDE STEPS</strong>
                <small>OPEN SNOWS PROAM</small>
              </span>
              <span className="step-arrow" aria-hidden="true">
                <i />
                <i />
              </span>
            </a>
          </div>

          <footer className="launch-state">
            <div className="launch-copy">
              <span>EVERY STEP COUNTS</span>
              <strong>LIVE WORLDWIDE</strong>
            </div>
            <div className="pace-line" aria-hidden="true">
              <i /><i /><i /><i /><i /><i /><i /><i />
            </div>
            <span className="season">01 / LIVE</span>
          </footer>
        </article>
      </section>

      <TranscriptRail
        activeIndex={activeIndex}
        hasStarted={transcriptState.hasStarted}
        side="right"
        timeline={timeline}
      />
      <CompactTranscript activeCue={activeCue} hasStarted={transcriptState.hasStarted} />
      <p className="sr-only" aria-live="polite">
        {transcriptState.hasStarted && activeCue ? activeCue.text : ''}
      </p>

      <p className="corner-note corner-note-left">BUILT BY SNOWS PROAM</p>
      <p className="corner-note corner-note-right">WORLDWIDESTEPS.COM</p>
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
