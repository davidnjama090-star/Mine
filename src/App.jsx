import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  ArrowDown,
  ArrowRight,
  CalendarHeart,
  Check,
  Heart,
  Lightbulb,
  LockKeyhole,
  Music,
  Quote,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'

// Replace `photo` paths with files in `public/photos/` (e.g., '/photos/first-chat.jpg')
// Adjust `objectPosition` per item ('center top', 'center 25%', 'center 88%', etc.) if a subject sits high or low.
const memories = [
  {
    date: 'CHAPTER 01 · THE BEGINNING',
    title: 'The first conversation that stayed with me',
    note: 'Somehow, a simple hello turned into the kind of conversation I kept thinking about long after it ended.',
    tag: 'A little more than a hello',
    photo: '/photos/memory-1.jpg',
    caption: 'Where it quietly started',
    objectPosition: 'center 25%',
  },
  {
    date: 'CHAPTER 02 · A FAVORITE LITTLE THING',
    title: 'The joke that is still ours',
    note: 'It probably would not make sense to anyone else. That is part of why I love that it belongs to us.',
    tag: 'Our very own punchline',
    photo: '/photos/memory-2.jpg',
    caption: 'Still makes me smile every time',
    objectPosition: 'center 25%',
  },
  {
    date: 'CHAPTER 03 · ONE ORDINARY DAY',
    title: 'When an ordinary day felt different',
    note: 'Nothing grand happened. I just realized that having you there made the whole day feel a little brighter.',
    tag: 'The small things, kept close',
    photo: '/photos/memory-3.jpg',
    caption: 'A regular day turned golden',
    objectPosition: 'center 88%',
  },
  {
    date: 'CHAPTER 04 · LATE NIGHT THOUGHTS',
    title: 'The conversations that ran past midnight',
    note: 'Time always seemed to move faster whenever we were talking—whether about big dreams or random everyday things.',
    tag: 'One more minute turned into hours',
    photo: '/photos/memory-4.jpg',
    caption: 'Easy talks that stayed with me',
    objectPosition: 'center 25%',
  },
  {
    date: 'CHAPTER 05 · LOOKING AHEAD',
    title: 'All the places we have not been yet',
    note: 'Every coffee spot, road trip, rainy afternoon, and quiet laugh waiting ahead feels a little more exciting with you in mind.',
    tag: 'Pages still waiting to be written',
    photo: '/photos/memory-5.jpg',
    caption: 'Future favorites in the making',
    objectPosition: 'center 35%',
  },
]

const reasons = [
  'You make the everyday feel like a story I want to remember.',
  'I can be completely myself around you, and that is rarer than it sounds.',
  'You make listening feel like its own kind of kindness.',
  'Even a quiet moment feels full when I get to share it with you.',
  'The way you see the world makes me want to pay closer attention to mine.',
  'You bring a warmth into a room that lingers long after.',
  'Even the simplest plans feel special when they involve you.',
]

const promises = [
  {
    title: 'On the hard days',
    detail: 'I will make room for the whole truth of how you feel, not rush you toward a brighter one.',
  },
  {
    title: 'On the ordinary days',
    detail: 'I will keep finding small ways to remind you that being with you is never ordinary to me.',
  },
  {
    title: 'When life gets loud',
    detail: 'I will listen first, show up steadily, and ask what kind of support you actually want.',
  },
  {
    title: 'For all the laughter',
    detail: 'I will keep collecting the silly little things that make us laugh until our cheeks hurt.',
  },
]

const petals = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37 + 8) % 100}%`,
  delay: `${(index % 7) * -1.8}s`,
  duration: `${14 + (index % 5) * 2}s`,
  size: `${9 + (index % 3) * 4}px`,
}))

// Update this date to when you first met or started talking (YYYY-MM-DD)
const SPECIAL_START_DATE = '2025-09-07'
// Optional passcode (case-insensitive) for the hidden note
const SECRET_PASSCODE = 'carol'

function getDaysSince(dateString) {
  const start = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(start.getTime())) return null
  const diffMs = Date.now() - start.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

function SectionHeading({ eyebrow, children }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{children}</h2>
    </div>
  )
}

function SongAndAmbientPlayer({ songUrl = '/music/our-song.mp3', songTitle = 'Our Song' }) {
  const [playing, setPlaying] = useState(false)
  const [usingFallbackSynth, setUsingFallbackSynth] = useState(false)
  const audioElRef = useRef(null)
  const synthRef = useRef(null)

  function stopSynth() {
    synthRef.current?.nodes.forEach((node) => {
      try {
        node.stop()
      } catch {
        // Ignore already-stopped nodes
      }
    })
    synthRef.current?.context.close().catch(() => {})
    synthRef.current = null
    setUsingFallbackSynth(false)
  }

  function startSynth() {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const context = new AudioContext()
    const master = context.createGain()
    master.gain.setValueAtTime(0.0001, context.currentTime)
    master.gain.exponentialRampToValueAtTime(0.04, context.currentTime + 1.4)
    master.connect(context.destination)

    const nodes = [196, 246.94, 293.66, 369.99].map((frequency, index) => {
      const oscillator = context.createOscillator()
      const voiceGain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      voiceGain.gain.value = index === 0 ? 0.42 : 0.18
      oscillator.connect(voiceGain)
      voiceGain.connect(master)
      oscillator.start()
      return oscillator
    })

    synthRef.current = { nodes, context }
    setUsingFallbackSynth(true)
  }

  async function toggle() {
    if (playing) {
      if (audioElRef.current) {
        audioElRef.current.pause()
      }
      stopSynth()
      setPlaying(false)
      return
    }

    const audio = audioElRef.current
    if (audio && songUrl) {
      try {
        audio.volume = 0.65
        await audio.play()
        setUsingFallbackSynth(false)
        setPlaying(true)
        return
      } catch {
        // If no song file is in public/music yet, fall back to gentle ambient chords
        startSynth()
        setPlaying(true)
      }
    } else {
      startSynth()
      setPlaying(true)
    }
  }

  useEffect(() => {
    return () => {
      if (audioElRef.current) {
        audioElRef.current.pause()
      }
      stopSynth()
    }
  }, [])

  return (
    <div className="music-widget" aria-live="polite">
      <audio ref={audioElRef} src={songUrl} loop preload="metadata" onError={() => setUsingFallbackSynth(true)} />
      <button
        className="sound-toggle"
        onClick={toggle}
        aria-label={playing ? 'Pause background music' : 'Play background music'}
      >
        <span className="sound-icon">
          {playing ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </span>
        <span className="sound-copy">
          <strong>{playing ? (usingFallbackSynth ? 'Ambient notes' : songTitle) : 'Play our song'}</strong>
          <small>{playing ? 'Playing gently' : 'Sound off'}</small>
        </span>
        <span className={`sound-status${playing ? ' is-playing' : ''}`} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
    </div>
  )
}

function MemoryPhotoCard({ memory, onOpenLightbox }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="memory-photo">
      {!imgFailed && memory.photo ? (
        <button
          type="button"
          className="photo-button"
          onClick={() => onOpenLightbox(memory)}
          aria-label={`View larger photo for ${memory.title}`}
        >
          <img
            src={memory.photo}
            alt={memory.title}
            loading="lazy"
            style={{ objectPosition: memory.objectPosition || 'center' }}
            onError={() => setImgFailed(true)}
          />
          <span className="photo-caption-pill">{memory.caption}</span>
        </button>
      ) : (
        <div className="photo-placeholder">
          <div className="photo-orbit">
            <Heart size={20} strokeWidth={1.2} />
          </div>
          <span>A photo belongs here</span>
          <small>Add {memory.photo || '/photos/photo.jpg'}</small>
        </div>
      )}
    </div>
  )
}

function SecretNoteBox() {
  const [passcode, setPasscode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (passcode.trim().toLowerCase() === SECRET_PASSCODE.toLowerCase()) {
      setUnlocked(true)
      setError('')
      confetti({
        particleCount: 35,
        spread: 65,
        origin: { y: 0.75 },
        colors: ['#b54b62', '#e3b976', '#f4cbd0'],
      })
    } else {
      setError(`Hint: type "${SECRET_PASSCODE}" (or customize SECRET_PASSCODE in code)`)
    }
  }

  return (
    <motion.div
      className="secret-box"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55 }}
    >
      <div className="secret-header">
        <LockKeyhole size={16} />
        <span>A TUCKED-AWAY NOTE</span>
      </div>

      {!unlocked ? (
        <form onSubmit={handleSubmit} className="secret-form">
          <p>Enter the little key word to unlock one extra note just for you.</p>
          <div className="secret-row">
            <input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Type the key word..."
              aria-label="Secret note key word"
            />
            <button type="submit" className="text-button">
              Unlock <ArrowRight size={14} />
            </button>
          </div>
          {error && <small className="secret-error">{error}</small>}
        </form>
      ) : (
        <motion.div
          className="secret-unlocked"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>
            Even on days I don't say it out loud enough, you're one of my favorite thoughts, Carol.
            Thank you for just being you.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

function App() {
  const [reasonIndex, setReasonIndex] = useState(0)
  const [flipped, setFlipped] = useState([])
  const [answer, setAnswer] = useState('')
  const [activePhoto, setActivePhoto] = useState(null)

  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  })

  const daysTogether = getDaysSince(SPECIAL_START_DATE)

  function sayYes() {
    setAnswer('yes')
    const colors = ['#b54b62', '#e3b976', '#f4cbd0', '#fff8ef']
    const end = Date.now() + 2600
    const burst = () => {
      confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.72 }, colors, scalar: 1.05 })
      confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.72 }, colors, scalar: 1.05 })
      if (Date.now() < end) requestAnimationFrame(burst)
    }
    burst()
  }

  function flipCard(index) {
    setFlipped((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    )
  }

  return (
    <main>
      <motion.div className="scroll-progress" style={{ scaleX: smoothProgress }} aria-hidden="true" />
      <SongAndAmbientPlayer songUrl="/music/our-song.mp3" songTitle="Our Song" />

      <section className="hero" id="top">
        <div className="hero-image" role="img" aria-label="Soft pink garden roses in warm evening light" />
        <div className="hero-wash" />
        <div className="petals" aria-hidden="true">
          {petals.map((petal, index) => (
            <span
              key={index}
              style={{
                '--left': petal.left,
                '--delay': petal.delay,
                '--duration': petal.duration,
                '--size': petal.size,
              }}
            />
          ))}
        </div>

        <div className="hero-content">
          <motion.span
            className="hero-kicker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            A LITTLE NOTE, JUST FOR YOU
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.12 }}
          >
            For <em>Carol.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            There is something I have been wanting to tell you.
          </motion.p>
          {daysTogether !== null && (
            <motion.div
              className="hero-counter"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <CalendarHeart size={15} />
              <span>{daysTogether.toLocaleString()} days since {SPECIAL_START_DATE}</span>
            </motion.div>
          )}
          <motion.a
            className="scroll-link"
            href="#story"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Take your time <ArrowDown size={15} strokeWidth={1.6} />
          </motion.a>
        </div>

        <div className="hero-caption">
          <span>01</span>
          <span>A chapter, if you want it</span>
          <span className="caption-line" />
        </div>
        <div className="hero-mark" aria-hidden="true">
          <Heart size={16} fill="currentColor" strokeWidth={1} />
        </div>
      </section>

      <section className="story section-pad" id="story">
        <div className="section-shell">
          <div className="story-intro">
            <SectionHeading eyebrow="THE LITTLE THINGS I KEEP">
              Some moments
              <br />
              stay with you.
            </SectionHeading>
            <p className="section-lede">
              Not because they were perfect. Because they were ours, in all the quiet, funny, wonderfully ordinary ways.
            </p>
          </div>

          <div className="timeline">
            {memories.map((memory, index) => (
              <motion.article
                className={`memory memory-${index + 1}`}
                key={memory.date}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.65, delay: index * 0.08 }}
              >
                <div className="memory-marker">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="memory-copy">
                  <span className="memory-date">{memory.date}</span>
                  <h3>{memory.title}</h3>
                  <p>{memory.note}</p>
                  <span className="memory-tag">
                    <Heart size={12} /> {memory.tag}
                  </span>
                </div>
                <MemoryPhotoCard memory={memory} onOpenLightbox={setActivePhoto} />
              </motion.article>
            ))}
          </div>

          <SecretNoteBox />

          <p className="personal-note">
            <Music size={13} /> Drop your song at <code>public/music/our-song.mp3</code> and photos in <code>public/photos/</code>.
          </p>
        </div>
      </section>

      <section className="reasons-section section-pad" id="reasons">
        <div className="section-shell">
          <SectionHeading eyebrow="WHY IT'S YOU">
            You make life feel
            <br />
            <em>more like itself.</em>
          </SectionHeading>

          <div className="reasons-layout">
            <p className="reasons-lede">
              I don't want to fit you into a list of reasons. I just want you to know the little things I notice, and how much they mean to me.
            </p>
            <motion.div
              className="reason-card"
              key={reasonIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Quote className="quote-mark" size={21} strokeWidth={1.3} />
              <p>{reasons[reasonIndex]}</p>
              <div className="reason-footer">
                <span>
                  {String(reasonIndex + 1).padStart(2, '0')} <i>/</i> {String(reasons.length).padStart(2, '0')}
                </span>
                <button
                  className="text-button"
                  onClick={() => setReasonIndex((reasonIndex + 1) % reasons.length)}
                >
                  Another reason <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          </div>

          <div className="belong-grid">
            <motion.article
              className="belong-card"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 18 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="belong-number">01</span>
              <Sparkles size={18} />
              <h3>You brighten the in-between.</h3>
              <p>
                A kind message, a shared look, your laugh from across the room. You have a way of making the unremarkable parts of a day feel like the parts I want to keep.
              </p>
            </motion.article>

            <motion.article
              className="belong-card"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 18 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="belong-number">02</span>
              <Heart size={18} />
              <h3>Being with you feels easy.</h3>
              <p>
                Not because every day would be effortless, but because I can be honest and unguarded beside you. That kind of ease is something I don't take lightly.
              </p>
            </motion.article>

            <motion.article
              className="belong-card"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 18 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="belong-number">03</span>
              <Lightbulb size={18} />
              <h3>I can picture a next chapter.</h3>
              <p>
                I don't know every page ahead. I do know I'd be glad to write the next one with you, with care, curiosity, and room for both of us to be ourselves.
              </p>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="promises-section section-pad" id="promises">
        <div className="section-shell">
          <div className="promises-heading">
            <SectionHeading eyebrow="NOT GRAND GESTURES">
              The small ways
              <br />
              I'd show up.
            </SectionHeading>
            <p className="section-lede">
              Tap a card. These are the kinds of promises I want to make in the everyday, not just the easy parts.
            </p>
          </div>

          <div className="promise-grid">
            {promises.map((promise, index) => (
              <button
                className={`promise-card${flipped.includes(index) ? ' is-flipped' : ''}`}
                key={promise.title}
                onClick={() => flipCard(index)}
                aria-pressed={flipped.includes(index)}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    className="promise-face"
                    key={flipped.includes(index) ? 'back' : 'front'}
                    initial={{ opacity: 0, rotateY: -10 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 10 }}
                    transition={{ duration: 0.24 }}
                  >
                    {flipped.includes(index) ? (
                      <>
                        <span className="promise-icon">
                          <Heart size={17} />
                        </span>
                        <span className="promise-detail">{promise.detail}</span>
                        <span className="promise-tap">Tap to turn back</span>
                      </>
                    ) : (
                      <>
                        <span className="promise-index">0{index + 1}</span>
                        <span className="promise-title">{promise.title}</span>
                        <span className="promise-tap">
                          Read my promise <ArrowRight size={14} />
                        </span>
                      </>
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="finale section-pad" id="the-question">
        <div className="finale-glow" />
        <div className="finale-inner">
          <span className="eyebrow">ONE THING LEFT TO ASK</span>
          <motion.div
            className="letter"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span className="letter-flower">
              <Heart size={17} fill="currentColor" strokeWidth={1} />
            </span>
            <p>Carol,</p>
            <p>
              It takes a little courage to put this into words. But I think it would take more courage than I have to walk away without ever telling you how much you mean to me.
            </p>
            <p>
              I love the person I get to be around you. I love the way the small moments add up. And I'd like the chance to find out what we could be, one honest, unhurried step at a time.
            </p>
            <p>There is no perfect way to ask, so I'll just ask from the heart.</p>
            <span className="letter-signoff">
              With all my heart, <i>me</i>
            </span>
          </motion.div>

          <div className="question-block">
            <span className="question-overline">SO, CAROL...</span>
            <h2>
              Will you give us
              <br />a real chance to date?
            </h2>
            <div className="answer-actions">
              <button className="yes-button" onClick={sayYes}>
                <Heart size={17} fill="currentColor" /> Yes, absolutely
              </button>
              <button className="think-button" onClick={() => setAnswer('think')}>
                Let me think <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <footer className="footer">
          <span>Made with care, for Carol</span>
          <Heart size={13} fill="currentColor" />
          <a href="#top">Back to the beginning ↑</a>
        </footer>
      </section>

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            className="answer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="presentation"
            onClick={() => setActivePhoto(null)}
          >
            <motion.div
              className="lightbox-modal"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="lightbox-close"
                onClick={() => setActivePhoto(null)}
                aria-label="Close photo preview"
              >
                <X size={18} />
              </button>
              <img src={activePhoto.photo} alt={activePhoto.title} />
              <div className="lightbox-meta">
                <span className="eyebrow">{activePhoto.date}</span>
                <h3>{activePhoto.title}</h3>
                <p>{activePhoto.note}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {answer && (
          <motion.div
            className="answer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="presentation"
            onClick={() => setAnswer('')}
          >
            <motion.div
              className="answer-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="answer-title"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              {answer === 'yes' ? (
                <>
                  <span className="modal-icon">
                    <Heart size={24} fill="currentColor" />
                  </span>
                  <span className="eyebrow">A NEW LITTLE BEGINNING</span>
                  <h2 id="answer-title">
                    You just made
                    <br />
                    <em>my whole heart</em> smile.
                  </h2>
                  <p>
                    Thank you for giving us a chance, Carol. Screenshot this and send it to me so I can keep this moment forever.
                  </p>
                  <button className="modal-close" onClick={() => setAnswer('')}>
                    <Check size={16} /> I'll send it
                  </button>
                </>
              ) : (
                <>
                  <span className="modal-icon">
                    <Heart size={24} />
                  </span>
                  <span className="eyebrow">TAKE ALL THE TIME YOU NEED</span>
                  <h2 id="answer-title">
                    No rush.
                    <br />
                    <em>Really.</em>
                  </h2>
                  <p>
                    Whatever you decide, I meant every word. You can take your time and tell me honestly when you're ready.
                  </p>
                  <button className="modal-close" onClick={() => setAnswer('')}>
                    Thank you for understanding
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default App