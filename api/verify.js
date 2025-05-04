import forge from 'node-forge';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { token, serverId } = req.body;

  if (!token || !serverId) {
    return res.status(400).json({ success: false, error: 'Missing token or serverId' });
  }

  const verifyResponse = await fetch('https://api.hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.HCAPTCHA_SECRET}&response=${token}`,
  });

  const verifyData = await verifyResponse.json();

  if (!verifyData.success) {
    return res.status(403).json({ success: false, error: 'Captcha verification failed' });
  }

  try {
    const privateKeyPem = process.env.RSA_PRIVATE;
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const encryptedBytes = forge.util.decode64(serverId);
    const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP');
    const serverInfo = JSON.parse(decrypted);

    return res.status(200).json({ success: true, info: serverInfo });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Decryption failed' });
  }
}
