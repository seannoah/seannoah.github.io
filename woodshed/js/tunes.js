// tunes.js — the built-in tunes. Chord changes only, except where a tune is out of
// copyright in the US and its melody is included (see the note at the top of songs.js).
//
// chart:  bars between "|", chords in a bar separated by spaces, "%" repeats the bar
//         before, and a section letter may come before a line's first bar.
// melody: one string per bar, in written (lead sheet) pitch: "D5:2 E5:1 F5:1".
// from:   where the changes were taken from, shown on the tune's page.

export const TUNES = [
  {
    id: 'a-train', title: 'Take the "A" Train', by: 'Billy Strayhorn', year: 1939, key: 'C', beats: 4,
    form: 'First 8 bars', from: 'As analysed in Foundations I, pages 42 to 46.',
    chart: `
A | C6 | % | D7 | % |
  | Dm7 | G7 | C6 | Dm7 G7 |`,
  },
  {
    id: 'blue-bossa', title: 'Blue Bossa', by: 'Kenny Dorham', year: 1963, key: 'Cm', beats: 4,
    form: 'First 8 bars', from: 'As analysed in Foundations I, pages 51 to 53.',
    chart: `
A | Cm6 | % | Fm6 | % |
  | Dm7b5 | G7b9 | Cm6 | % |`,
  },
  {
    id: 'someday', title: 'Someday My Prince Will Come', by: 'Frank Churchill', year: 1937, key: 'Bb', beats: 3,
    form: '32 bars, in 3', draft: true,
    from: 'Commonly played changes, entered from memory and checked against one online chart. Compare them with the chart you play from, and make your own copy to change anything.',
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
];

// Tunes asked for that still need a chart. They show on the Songs page as invitations.
export const WANTED = [
  { title: 'Why Was I Born?', by: 'Jerome Kern', year: 1929, note: 'Out of copyright, so its melody can be included once there is a chart to work from.' },
  { title: 'Dear Lord', by: 'John Coltrane', year: 1965, note: 'Needs a chart you trust. Changes only; a melody you type in stays private.' },
];
