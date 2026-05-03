const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, telefon, email, nachricht, fahrtTyp, abholort, zielort, datetime, personen, hinweise } = req.body;

  const isBooking = !!fahrtTyp;
  const subject = isBooking ? 'Neue Buchungsanfrage — Taxi Brannenburg' : 'Neue Kontaktanfrage — Taxi Brannenburg';
  const text = isBooking
    ? `Fahrt-Typ: ${fahrtTyp}\nAbholort: ${abholort}\nZielort: ${zielort}\nZeit: ${datetime}\nPersonen: ${personen}\nName: ${name}\nTelefon: ${telefon}\nE-Mail: ${email || '-'}\nHinweise: ${hinweise || '-'}`
    : `Name: ${name}\nTelefon: ${telefon || '-'}\nE-Mail: ${email}\nNachricht: ${nachricht}`;

  if (process.env.RESEND_API_KEY) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `Taxi Brannenburg <noreply@${process.env.RESEND_DOMAIN || 'taxi-brannenburg.de'}>`,
          to: process.env.NOTIFY_EMAIL || 'info@taxi-raubling.de',
          subject,
          text
        })
      });
      if (!r.ok) {
        const err = await r.text();
        console.error('Resend error:', err);
        return res.status(500).json({ error: 'Mail could not be sent' });
      }
    } catch (e) {
      console.error('Resend error:', e);
      return res.status(500).json({ error: 'Mail could not be sent' });
    }
  } else {
    console.log('--- FORM SUBMISSION (no RESEND_API_KEY configured) ---');
    console.log('Subject:', subject);
    console.log('Body:', text);
    console.log('---');
  }

  res.json({ success: true });
};

module.exports = handler;
