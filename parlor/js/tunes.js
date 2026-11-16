// tunes.js — chord changes to play over. Changes only: no melodies, no lyrics.
//
// chart: bars between "|", chords in a bar separated by spaces, "%" repeats the bar
//        before, and a section letter may come before a line's first bar.
// The tunes' changes are the ones Woodshed uses. The short progressions at the top are
// the movements worth being able to play in any key.

export const TUNES = [
  {
    id: 'two-five-one', title: 'Major ii–V–I', kind: 'movement', key: 'C', beats: 4, form: '4 bars',
    chart: `
A | Dm7 | G7 | C6 | % |`,
  },
  {
    id: 'minor-two-five', title: 'Minor ii–V–i', kind: 'movement', key: 'Cm', beats: 4, form: '4 bars',
    chart: `
A | Dm7b5 | G7 | Cm6 | % |`,
  },
  {
    id: 'minor-four', title: 'IV, minor iv, home', kind: 'movement', key: 'C', beats: 4, form: '4 bars',
    chart: `
A | F6 | Fm6 | C6 | % |`,
  },
  {
    id: 'turnaround', title: 'Turnaround', kind: 'movement', key: 'C', beats: 4, form: '4 bars',
    chart: `
A | C6 A7 | Dm7 G7 | C6 A7 | Dm7 G7 |`,
  },
  {
    id: 'embraceable', title: 'Embraceable You', by: 'George Gershwin', year: 1930, key: 'F', beats: 4, form: '32 bars', ballad: true,
    chart: `
A | F | Abdim7 | Gm7 | C7 |
  | Gm7 | Eb7 C7 | F | Em7b5 A7 |
B | Dm | Bm7b5 E7 | Am | Dm7 G7 |
  | Cmaj7 Dbdim7 | Dm7 G7 | Gm7 | C7 |
A | Fmaj7 | Abdim7 | Gm7 | C7 |
  | Gm7 | Eb7 C7 | Fmaj7 | Cm7 F7 |
C | Bbmaj7 | Em7b5 A7 | Dm | Bm7b5 Bm7b5 Bbm7 Eb7 |
  | F F Gm7 Am7 | Gm7b5 C7 | Fmaj7 | % |`,
  },
  {
    id: 'my-romance', title: 'My Romance', by: 'Richard Rodgers', year: 1935, key: 'Bb', beats: 4, form: 'First 8 bars', ballad: true,
    chart: `
A | Bb | Dm7 Dbdim7 | Cm7 F7 | Bb D7 |
  | Gm | Gm G7 | Cm7 F7 | Bb D7 |`,
  },
  {
    id: 'stella', title: 'Stella by Starlight', by: 'Victor Young', year: 1944, key: 'Bb', beats: 4, form: '32 bars', ballad: true,
    chart: `
A | Dbdim7 | % | Cm7 | F7 |
  | Fm7 | Bb7 | Eb | Ab7 |
B | Bb | Em7b5 A7 | Dm7 | Bbm7 Eb7 |
  | F | Gm7 C7 | Cm7 | Am7b5 D7 |
C | G7 | % | Cm7 | % |
  | Ab7 | % | Bb | % |
D | Em7b5 | A7 | Dm7b5 | G7 |
  | Cm7b5 | F7 | Bb | % |`,
  },
  {
    id: 'someday', title: 'Someday My Prince Will Come', by: 'Frank Churchill', year: 1937, key: 'Bb', beats: 3, form: '32 bars, in 3', ballad: true,
    chart: `
A | Bbmaj7 | D7#5 | Ebmaj7 | G7#5 |
  | Cm7 | G7#5 | C7 | F7 |
B | Dm7 | Dbdim7 | Cm7 | F7 |
  | Dm7 | Dbdim7 | Cm7 | F7 |
A | Bbmaj7 | D7#5 | Ebmaj7 | G7#5 |
  | Cm7 | G7#5 | C7 | F7 |
C | Fm7 | Bb7 | Ebmaj7 | Edim7 |
  | Bb/F | Cm7 F7 | Bb6 | Cm7 F7 |`,
  },
  {
    id: 'another-you', title: 'There Will Never Be Another You', by: 'Harry Warren', year: 1942, key: 'Eb', beats: 4, form: '32 bars',
    chart: `
A | Eb | % | Dm7b5 | G7 |
  | Cm | F7 | Bbm7 | Eb7 |
  | Ab | Db7 | Eb | Cm7 |
  | F7 | % | Fm7 | Bb7 |
B | Eb | % | Dm7b5 | G7 |
  | Cm | F7 | Bbm7 | Eb7 |
  | Ab | Db7 | Eb | F7 F#dim7 |
  | Eb Ab7 | Gm7 C7 | Fm7 Bb7 | Eb |`,
  },
  {
    id: 'a-train', title: 'Take the "A" Train', by: 'Billy Strayhorn', year: 1939, key: 'C', beats: 4, form: 'First 8 bars',
    chart: `
A | C6 | % | D7 | % |
  | Dm7 | G7 | C6 | Dm7 G7 |`,
  },
  {
    id: 'blue-bossa', title: 'Blue Bossa', by: 'Kenny Dorham', year: 1963, key: 'Cm', beats: 4, form: 'First 8 bars', rhythm: 'bossa',
    chart: `
A | Cm6 | % | Fm6 | % |
  | Dm7b5 | G7b9 | Cm6 | % |`,
  },
  {
    id: 'blues-bb', title: 'Blues in B♭', by: 'twelve-bar blues', key: 'Bb', beats: 4, form: '12 bars', rhythm: 'swing',
    chart: `
A | Bb7 | Eb7 | Bb7 | % |
  | Eb7 | % | Bb7 | Dm7 G7 |
  | Cm7 | F7 | Bb7 | F7 |`,
  },
  {
    id: 'blue-monk', title: 'Blue Monk', by: 'Thelonious Monk', year: 1954, key: 'Bb', beats: 4, form: '12 bars', rhythm: 'swing',
    chart: `
A | Bb7 | Eb7 | Bb7 | % |
  | Eb7 | % | Bb | Bb G7 |
  | Cm7 | F7 | Bb | F7 |`,
  },
  {
    id: 'footprints', title: 'Footprints', by: 'Wayne Shorter', year: 1966, key: 'Cm', beats: 6, form: '12 bars, in 6',
    chart: `
A | Cm11 | % | % | % |
  | Fm11 | % | Cm11 | % |
  | F#m7b5 F7#11 | E7alt A7alt | Cm11 | % |`,
  },
];
export const tuneById = (id) => TUNES.find((t) => t.id === id) || null;

// "Bb" -> { root: 10, minor: false }, "Cm" -> { root: 0, minor: true }
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function parseKey(text) {
  const m = /^([A-G])([b#♭♯]?)(m?)$/.exec(String(text || 'C').trim());
  if (!m) return { root: 0, minor: false };
  const acc = m[2] === 'b' || m[2] === '♭' ? -1 : m[2] === '#' || m[2] === '♯' ? 1 : 0;
  return { root: (LETTER_PC[m[1]] + acc + 12) % 12, minor: m[3] === 'm' };
}
