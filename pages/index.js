// pages/index.js // This Next.js page renders a front-end form protected by hCaptcha

import { useState, useRef } from 'react'; import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function JoinServer() { // Ref to control the hCaptcha widget instance const captchaRef = useRef(null); // State to hold the hCaptcha token once user completes the challenge const [token, setToken] = useState(null); // Loading and error states for UX feedback const [loading, setLoading] = useState(false); const [error, setError] = useState('');

// Called when hCaptcha challenge is successfully completed const onVerify = (token) => { setToken(token); setError(''); };

// Called when the hCaptcha token expires const onExpire = () => { setToken(null); };

// Handle form submission: send captcha token to our Vercel API route const handleSubmit = async (e) => { e.preventDefault(); if (!token) { setError('Please complete the captcha'); return; } setLoading(true); try { // Example: replace with actual serverId retrieval logic const serverId = 'REPLACE_WITH_ENCRYPTED_SERVER_ID'; // Call the joinServer API, passing captchaToken and serverId const res = await fetch( /api/joinServer?serverId=${encodeURIComponent(serverId)}&captchaToken=${token}, { method: 'GET' } ); const data = await res.json(); if (!res.ok) throw new Error(data.message || 'Verification failed'); // On success, display or process returned GUI data console.log('Verified, server info:', data); } catch (err) { setError(err.message); } finally { setLoading(false); // Reset captcha widget for potential retry captchaRef.current.resetCaptcha(); } };

return ( <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black text-white p-4"> <h1 className="text-3xl mb-6">IdiotHub Verification</h1> <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4"> {/* hCaptcha widget using sitekey from environment */} <HCaptcha
sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY}
onVerify={onVerify}
onExpire={onExpire}
ref={captchaRef}
/> {error && <p className="text-red-500">{error}</p>} <button
type="submit"
disabled={loading}
className="px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-700 disabled:opacity-50"
> {loading ? 'Verifying...' : 'Verify'} </button> </form> </div> ); }

