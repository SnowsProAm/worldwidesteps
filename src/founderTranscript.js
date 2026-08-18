export const founderRecordingDuration = 119.166667

// These cues follow the words in the recorded message, rather than the longer
// written manifesto. Keeping the source timestamps here makes seeking accurate.
export const founderTranscript = [
  { start: 0, end: 3.2, text: 'This isn’t just about sport. It’s about the climb.' },
  { start: 3.2, end: 6.52, text: 'The early mornings. The empty pitches.' },
  { start: 6.52, end: 8.01, text: 'The sessions nobody sees.' },
  { start: 8.01, end: 10.16, text: 'The loss that you carry home with you.' },
  { start: 10.16, end: 13.03, text: 'The days when your body is tired and your confidence is gone.' },
  { start: 13.03, end: 15.4, text: 'And nobody’s there to tell you to keep going.' },
  { start: 15.4, end: 18.24, text: 'You go anyway, because every athlete knows this feeling.' },
  { start: 18.24, end: 22.56, text: 'Amateur or professional. Unknown or celebrated.' },
  { start: 22.56, end: 24.25, text: 'At the beginning of the journey.' },
  { start: 24.25, end: 26.55, text: 'Or standing at the very top. The struggle speaks the same language.' },
  { start: 26.55, end: 27.08, text: 'Discipline.' },
  { start: 27.08, end: 30, text: 'You become great through the work nobody sees.' },
  { start: 30, end: 33.3, text: 'Through the repetition. Through the sacrifice.' },
  { start: 33.3, end: 35.07, text: 'Through showing up when there is no applause.' },
  { start: 35.07, end: 38.4, text: 'No recognition and no guarantee that any of it will pay off.' },
  { start: 38.4, end: 40.64, text: 'That’s what Snows ProAm represents.' },
  { start: 40.64, end: 42.6, text: 'A place to show the work. A place where the amateur can stand.' },
  { start: 42.6, end: 46.2, text: 'On the same battlefield as the professional and say: I’m coming.' },
  { start: 46.2, end: 49.29, text: 'Maybe you’ve got no contract yet. Maybe you’ve got no followers.' },
  { start: 49.29, end: 51.09, text: 'Maybe nobody knows your name.' },
  { start: 51.09, end: 51.53, text: 'Yet.' },
  { start: 51.53, end: 54.64, text: 'But you’ve got something more important.' },
  { start: 54.64, end: 58.25, text: 'You’ve got the willingness to suffer for something you believe you can become.' },
  { start: 58.25, end: 60.24, text: 'Because talent can introduce you to the game.' },
  { start: 60.24, end: 63.3, text: 'But discipline decides how far you go.' },
  { start: 63.3, end: 65.36, text: 'And the journey was never meant to be walked alone.' },
  { start: 65.36, end: 69.36, text: 'Every athlete needs people beside them. People who understand the sacrifice.' },
  { start: 69.36, end: 72.37, text: 'People who know what it feels like to lose, recover, return.' },
  { start: 72.37, end: 75.64, text: 'And try again. A team. A rival. A training partner.' },
  { start: 75.64, end: 80.88, text: 'A community willing to struggle with you. Snows ProAm. Where Athletes Belong.' },
  { start: 80.88, end: 84.56, text: 'Because there’s something powerful about looking at somebody ahead of you and thinking: Why not me?' },
  { start: 84.56, end: 85.56, text: 'Why can’t I get there?' },
  { start: 85.56, end: 90.4, text: 'Why can’t I become stronger, faster, better? Why can’t the amateur become the professional?' },
  { start: 90.4, end: 92.28, text: 'That journey is the heart of Snows ProAm.' },
  { start: 92.28, end: 96.57, text: 'One person competing with another. One community challenging another.' },
  { start: 96.57, end: 98.72, text: 'And ultimately, you against the person you were yesterday.' },
  { start: 98.72, end: 101.7, text: 'There’ll be setbacks. There’ll be doubt.' },
  { start: 101.7, end: 104.52, text: 'Cross it anyway. One session. One game. One rep. One more day.' },
  { start: 104.52, end: 107.01, text: 'We’re going to struggle. We’re going to learn.' },
  { start: 107.01, end: 109.24, text: 'And we’re going to keep moving. Together.' },
  { start: 109.24, end: 112.28, text: 'Until amateurs become professionals.' },
  { start: 112.28, end: founderRecordingDuration, text: 'This is bigger than an app. This is the climb. And we’re only getting started.' },
]

export function buildFounderTimeline(duration) {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : founderRecordingDuration
  const timingScale = safeDuration / founderRecordingDuration

  return founderTranscript.map((cue, index) => ({
    end: cue.end * timingScale,
    index,
    side: index % 2 === 0 ? 'left' : 'right',
    start: cue.start * timingScale,
    text: cue.text,
  }))
}
