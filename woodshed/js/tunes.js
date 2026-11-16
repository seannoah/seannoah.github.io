// tunes.js — the built-in tunes. Chord changes only, except where a tune is out of
// copyright in the US and its melody is included (see the note at the top of songs.js).
//
// chart:  bars between "|", chords in a bar separated by spaces, "%" repeats the bar
//         before, and a section letter may come before a line's first bar.
// melody: one string per bar, in written (lead sheet) pitch: "D5:2 E5:1 F5:1".
// from:   where the changes were taken from, shown on the tune's page.

export const TUNES = [
  {
    id: 'embraceable', title: 'Embraceable You', by: 'George Gershwin', year: 1930, key: 'F', beats: 4,
    form: '32 bars', from: 'Changes and melody as on the lead sheet in the Embraceable You MetaScore (Standards Series, Unit 1). The song is out of copyright in the US, so its melody is included.',
    chart: `
A | F | Abdim7 | Gm7 | C7 |
  | Gm7 | Eb7 C7 | F | Em7b5 A7 |
B | Dm | Bm7b5 E7 | Am | Dm7 G7 |
  | Cmaj7 Dbdim7 | Dm7 G7 | Gm7 | C7 |
A | Fmaj7 | Abdim7 | Gm7 | C7 |
  | Gm7 | Eb7 C7 | Fmaj7 | Cm7 F7 |
C | Bbmaj7 | Em7b5 A7 | Dm | Bm7b5 Bm7b5 Bbm7 Eb7 |
  | F F Gm7 Am7 | Gm7b5 C7 | Fmaj7 | % |`,
    melody: [
      'r:1 D4:1 E4:1 F4:1', 'r:1 D4:1 E4:1 F4:1', 'G4:0.5 r:1 C4:0.5 C4:1 C4:1', 'C4:4',
      'r:1 G4:1 A4:1 Bb4:1', 'r:1 G4:1 A4:1 Bb4:1', 'C5:0.5 r:1 F4:0.5 F4:1 F4:1', 'F4:4',
      'A4:1 F4:1 G4:1 F4:1', 'A4:1 F4:1 G4:1 F4:1', 'A4:0.5 r:1 E4:0.5 E4:1 E4:1', 'E4:4',
      'G4:1 E4:1 F4:1 E4:1', 'F4:1 G4:1 A4:1 B4:1', 'C5:0.5 r:1 C4:0.5 C4:1 C4:1', 'C4:4',
      'r:1 D4:1 E4:1 F4:1', 'r:1 D4:1 E4:1 F4:1', 'G4:0.5 r:1 C4:0.5 C4:1 C4:1', 'C4:4',
      'r:1 G4:1 A4:1 Bb4:1', 'r:1 G4:1 A4:1 Bb4:1', 'C5:0.5 r:1 F4:0.5 F4:1 F4:1', 'F4:4',
      'r:1 C5:1 Bb4:1 A4:1', 'Bb4:1 A4:1 G4:1 A4:1', 'r:1 F4:0.5 F4:0.5 F4:0.5 F4:0.5 F4:0.5 F4:0.5', 'F4:0.5 F4:0.5 A4:3',
      'r:1 A4:1 Bb4:1 C5:1', 'Db5:0.5 r:1 F4:0.5 E4:2', 'F4:4', 'F4:2 r:2',
    ],
  },
  {
    id: 'stella', title: 'Stella by Starlight', by: 'Victor Young', year: 1944, key: 'Bb', beats: 4,
    form: '32 bars', from: 'Changes as on the lead sheets in Standards Series, Unit 4, with A♭7 in bar 21. Bars 14 and 15 follow lessons 4.5 to 4.9; the earlier lead sheets print Em7♭5 A7 and E♭ there. Most fake books begin with Em7♭5 and A7 where these open on D♭dim7.',
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
    id: 'another-you', title: 'There Will Never Be Another You', by: 'Harry Warren', year: 1942, key: 'Eb', beats: 4,
    form: '32 bars', from: 'Changes as on the lead sheet in the There Will Never Be Another You Metascore (Standards Series, Unit 2). Bar 22 is left blank there; F7 is used, as in bar 6 and in the recorded performance.',
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
    id: 'blues-bb', title: 'Blues in B♭', by: 'the changes of Bags’ Groove', key: 'Bb', beats: 4,
    form: '12 bars', from: 'The blues changes used throughout Standards Series, Unit 3.',
    chart: `
A | Bb7 | Eb7 | Bb7 | % |
  | Eb7 | % | Bb7 | Dm7 G7 |
  | Cm7 | F7 | Bb7 | F7 |`,
  },
  {
    id: 'blue-monk', title: 'Blue Monk', by: 'Thelonious Monk', year: 1954, key: 'Bb', beats: 4,
    form: '12 bars', from: 'Changes as charted in Standards 3.3.',
    chart: `
A | Bb7 | Eb7 | Bb7 | % |
  | Eb7 | % | Bb | Bb G7 |
  | Cm7 | F7 | Bb | F7 |`,
  },
  {
    id: 'footprints', title: 'Footprints', by: 'Wayne Shorter', year: 1966, key: 'Cm', beats: 6,
    form: '12 bars, in 6', from: 'Changes as charted in Standards 3.4.',
    chart: `
A | Cm11 | % | % | % |
  | Fm11 | % | Cm11 | % |
  | F#m7b5 F7#11 | E7alt A7alt | Cm11 | % |`,
  },
  {
    id: 'my-romance', title: 'My Romance', by: 'Richard Rodgers', year: 1935, key: 'Bb', beats: 4,
    form: 'First 8 bars', from: 'Changes as charted in "My Romance: Introduction to Chord Melody Improvisation".',
    chart: `
A | Bb | Dm7 Dbdim7 | Cm7 F7 | Bb D7 |
  | Gm | Gm G7 | Cm7 F7 | Bb D7 |`,
  },
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
