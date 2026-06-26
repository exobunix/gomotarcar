const crypto = require('crypto');

const QR_SECRET = process.env.QR_SECRET || 'qr-secret-key-gomotarcar';

const generateQRPayload = (vehicleId, customerId) => {
  const timestamp = Date.now();
  const payload = {
    v: 1,
    vid: vehicleId.toString(),
    cid: customerId.toString(),
    ts: timestamp,
  };

  const signature = crypto
    .createHmac('sha256', QR_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  payload.sig = signature;

  return Buffer.from(JSON.stringify(payload)).toString('base64url');
};

const verifyQRPayload = (encodedPayload) => {
  try {
    const json = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const payload = JSON.parse(json);

    const { sig, ...data } = payload;
    const expectedSig = crypto
      .createHmac('sha256', QR_SECRET)
      .update(JSON.stringify(data))
      .digest('hex');

    if (sig !== expectedSig) {
      return { valid: false, error: 'Invalid signature' };
    }

    const age = Date.now() - data.ts;
    if (age > 2 * 365 * 24 * 60 * 60 * 1000) {
      return { valid: false, error: 'QR code expired' };
    }

    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: 'Invalid QR format' };
  }
};

module.exports = { generateQRPayload, verifyQRPayload };
