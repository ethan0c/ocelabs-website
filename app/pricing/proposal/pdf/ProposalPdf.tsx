import path from 'node:path';
import {
  Document,
  Font,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';
import { STUDIO_EMAIL, type Block, type Proposal } from '@/lib/proposal';

/*
 * The proposal as a PDF, rendered on the server so the file is the same
 * whichever browser opened it and carries its own header, footer and page
 * numbers. Type and colour follow the site: one face, near-black on white,
 * hairlines, tabular figures.
 */

const fonts = (file: string) => path.join(process.cwd(), 'public', 'fonts', file);

Font.register({
  family: 'Geist',
  fonts: [
    { src: fonts('Geist-Regular.ttf'), fontWeight: 400 },
    { src: fonts('Geist-Medium.ttf'), fontWeight: 500 },
    { src: fonts('Geist-SemiBold.ttf'), fontWeight: 600 },
  ],
});

// A contract with hyphenated words at line ends reads as a draft.
Font.registerHyphenationCallback((word) => [word]);

const INK = '#111111';
const DIM = '#666666';
const LINE = '#dddddd';
const LINE_STRONG = '#999999';

const s = StyleSheet.create({
  page: {
    fontFamily: 'Geist',
    fontSize: 10,
    lineHeight: 1.55,
    color: INK,
    paddingTop: 64,
    paddingBottom: 64,
    paddingHorizontal: 60,
  },
  header: {
    position: 'absolute',
    top: 28,
    left: 60,
    right: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 8,
    color: DIM,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  wordmark: { color: INK, letterSpacing: 1.6, fontSize: 8, fontWeight: 500 },
  footer: {
    position: 'absolute',
    // Measured from the top: react-pdf drops a `bottom`-anchored fixed box
    // when the page sets a unitless lineHeight. Letter is 792pt tall.
    top: 792 - 28 - 12,
    left: 60,
    right: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: DIM,
  },
  eyebrow: {
    fontSize: 7.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: DIM,
  },
  title: { fontSize: 24, letterSpacing: -0.4, marginTop: 6, marginBottom: 16, lineHeight: 1.15 },
  facts: {
    flexDirection: 'row',
    gap: 28,
    paddingBottom: 18,
    marginBottom: 22,
    borderBottomWidth: 0.75,
    borderBottomColor: LINE,
  },
  factValue: { marginTop: 2 },
  section: { marginBottom: 16 },
  h2: {
    fontSize: 7.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: DIM,
    marginBottom: 4,
  },
  p: { marginBottom: 6 },
  strong: { fontWeight: 600 },
  muted: { color: DIM },
  table: { marginTop: 2, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 5,
    borderBottomWidth: 0.75,
    borderBottomColor: LINE,
  },
  rowTotal: {
    borderBottomWidth: 0,
    borderTopWidth: 0.75,
    borderTopColor: LINE_STRONG,
    paddingTop: 7,
    fontWeight: 500,
  },
  rowNote: { color: DIM, fontSize: 8.5 },
  amount: { textAlign: 'right' },
  sign: { flexDirection: 'row', gap: 32, marginTop: 20 },
  signCol: { flex: 1 },
  signLine: { height: 34, borderBottomWidth: 0.75, borderBottomColor: LINE_STRONG, marginBottom: 6 },
  signMeta: { color: DIM, fontSize: 8.5 },
});

/** The aperture mark, as on the site: ring open at 3 o'clock with one tick. */
function Mark({ size = 11 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20.6 8.4A10 10 0 1 0 20.6 15.6" stroke={INK} strokeWidth={1.75} fill="none" />
      <Path d="M14 12h8" stroke={INK} strokeWidth={1.75} />
    </Svg>
  );
}

function BlockView({ b }: { b: Block }) {
  if (b.kind === 'p') {
    return (
      <Text style={[s.p, b.strong ? s.strong : {}, b.muted ? s.muted : {}]}>{b.text}</Text>
    );
  }
  return (
    <View style={s.table}>
      {b.rows.map((r, i) => (
        <View key={i} style={[s.row, r.total ? s.rowTotal : {}]} wrap={false}>
          <View style={{ flex: 1 }}>
            <Text>{r.label}</Text>
            {r.note && <Text style={s.rowNote}>{r.note}</Text>}
          </View>
          <Text style={s.amount}>{r.amount}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ProposalPdf({ pr }: { pr: Proposal }) {
  return (
    <Document
      title={`OCE Labs proposal for ${pr.client}`}
      author="OCE Labs"
      subject="Proposal and agreement"
    >
      <Page size="LETTER" style={s.page}>
        <View style={s.header} fixed>
          <View style={s.brand}>
            <Mark />
            <Text style={s.wordmark}>OCE LABS</Text>
          </View>
          <Text>Proposal and agreement · {pr.client}</Text>
        </View>

        <View style={s.footer} fixed>
          <Text>
            {pr.studio} · {STUDIO_EMAIL}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

        <Text style={s.eyebrow}>Proposal and agreement</Text>
        <Text style={s.title}>{pr.client}</Text>
        <View style={s.facts}>
          <Fact label="Date" value={pr.date} />
          <Fact label="Valid until" value={pr.validUntil} />
          <Fact label="Fixed price" value={pr.total} />
          <Fact label="Timeline" value={pr.timeline} />
        </View>

        {pr.sections.map((sec) => (
          <View key={sec.n} style={s.section} wrap={sec.blocks.some((b) => b.kind === 'table')}>
            <Text style={s.h2} minPresenceAhead={40}>
              {sec.n}. {sec.title}
            </Text>
            {sec.blocks.map((b, i) => (
              <BlockView key={i} b={b} />
            ))}
          </View>
        ))}

        <View style={s.section} wrap={false}>
          <Text style={s.h2}>{pr.sections.length + 1}. Signatures</Text>
          <View style={s.sign}>
            <View style={s.signCol}>
              <View style={s.signLine} />
              <Text>{pr.studio}</Text>
              <Text style={s.signMeta}>Name, title, date</Text>
            </View>
            <View style={s.signCol}>
              <View style={s.signLine} />
              <Text>{pr.client}</Text>
              <Text style={s.signMeta}>Name, title, date</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={s.eyebrow}>{label}</Text>
      <Text style={s.factValue}>{value}</Text>
    </View>
  );
}
