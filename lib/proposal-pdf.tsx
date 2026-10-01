import path from 'node:path';
import {
  Document,
  Font,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';
import { LOCKUP_WIDTH, LOGO_SIZE, MARK_PATH, WORDMARK_PATH } from '@/lib/logo';
import { STUDIO_EMAIL, type Block, type Proposal } from '@/lib/proposal';

/**
 * The e-signature record appended as the last page once a proposal is
 * signed: who, when, from where, and the hash of the document they saw.
 */
export type Signature = {
  signerName: string;
  signerEmail: string;
  signedAt: Date;
  ip: string;
  userAgent: string;
  docHash: string;
  /** Who accepts on the studio's side. */
  studioSigner: string;
};

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
  eyebrow: { fontSize: 9, color: DIM },
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
  h2: { fontSize: 10.5, fontWeight: 500, marginBottom: 4 },
  p: { marginBottom: 6 },
  list: { marginBottom: 8 },
  listItem: { flexDirection: 'row', marginBottom: 3 },
  bullet: { width: 10, color: DIM },
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
  cert: { marginTop: 18, paddingTop: 14, borderTopWidth: 0.75, borderTopColor: LINE },
  certRow: { flexDirection: 'row', gap: 12, paddingVertical: 4, borderBottomWidth: 0.75, borderBottomColor: LINE },
  certKey: { width: 110, color: DIM, fontSize: 8.5 },
  certVal: { flex: 1, fontSize: 8.5 },
  signed: { fontSize: 13, marginBottom: 2 },
});

/** The logo, as on the site: mark and lettering from the same outlines. */
function Lockup({ size = 10 }: { size?: number }) {
  return (
    <Svg
      width={(size * LOCKUP_WIDTH) / LOGO_SIZE}
      height={size}
      viewBox={`0 0 ${LOCKUP_WIDTH} ${LOGO_SIZE}`}
    >
      <Path d={MARK_PATH} fill={INK} />
      <Path d={WORDMARK_PATH} fill={INK} />
    </Svg>
  );
}

function BlockView({ b }: { b: Block }) {
  if (b.kind === 'p') {
    return (
      <Text style={[s.p, b.strong ? s.strong : {}, b.muted ? s.muted : {}]}>{b.text}</Text>
    );
  }
  if (b.kind === 'list') {
    return (
      <View style={s.list}>
        {b.items.map((t) => (
          <View key={t} style={s.listItem} wrap={false}>
            <Text style={s.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{t}</Text>
          </View>
        ))}
      </View>
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

export default function ProposalPdf({ pr, sig }: { pr: Proposal; sig?: Signature }) {
  return (
    <Document
      title={`OCE Labs proposal for ${pr.client}`}
      author="OCE Labs"
      subject="Proposal and agreement"
    >
      <Page size="LETTER" style={s.page}>
        <View style={s.header} fixed>
          <Lockup />
          <Text>Proposal and agreement · {pr.client}</Text>
        </View>

        <View style={s.footer} fixed>
          <Text>
            {pr.studio} ·{' '}
            {/* Clickable in any PDF viewer; same colour as the line so it stays quiet. */}
            <Link src={`mailto:${STUDIO_EMAIL}`} style={{ color: DIM, textDecoration: 'none' }}>
              {STUDIO_EMAIL}
            </Link>
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
              {sig ? <Text style={s.signed}>{sig.studioSigner}</Text> : <View style={s.signLine} />}
              <Text>{pr.studio}</Text>
              <Text style={s.signMeta}>
                {sig ? `Accepted electronically, ${stamp(sig.signedAt)}` : 'Name, title, date'}
              </Text>
            </View>
            <View style={s.signCol}>
              {sig ? <Text style={s.signed}>{sig.signerName}</Text> : <View style={s.signLine} />}
              <Text>{pr.client}</Text>
              <Text style={s.signMeta}>
                {sig ? `Signed electronically, ${stamp(sig.signedAt)}` : 'Name, title, date'}
              </Text>
            </View>
          </View>
        </View>

        {sig && (
          <View style={s.cert} wrap={false}>
            <Text style={s.h2}>Electronic signature record</Text>
            {[
              ['Signer', `${sig.signerName} <${sig.signerEmail}>`],
              ['Signed at', `${stamp(sig.signedAt)} (UTC)`],
              ['IP address', sig.ip],
              ['Browser', sig.userAgent],
              ['Document hash', `SHA-256 ${sig.docHash}`],
              ['Method', 'Typed name and express consent on the proposal page, after reading the full agreement. Both parties received a copy by email.'],
            ].map(([k, v]) => (
              <View key={k} style={s.certRow}>
                <Text style={s.certKey}>{k}</Text>
                <Text style={s.certVal}>{v}</Text>
              </View>
            ))}
          </View>
        )}
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

function stamp(d: Date) {
  return d.toISOString().replace('T', ' ').slice(0, 16);
}

/** The PDF bytes. Deterministic for a given proposal, so its hash is stable. */
export async function renderProposalPdf(pr: Proposal, sig?: Signature): Promise<Buffer> {
  return renderToBuffer(<ProposalPdf pr={pr} sig={sig} />);
}
