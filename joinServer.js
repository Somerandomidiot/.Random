import { useState } from 'react';
import Head from 'next/head';
import forge from 'node-forge';

export default function JoinServer({ serverId }) {
  const [verified, setVerified] = useState(false);
  const [serverInfo, setServerInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleVerification = async (token) => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, serverId }),
      });

      const data = await response.json();
      if (data.success) {
        setServerInfo(data.info);
        setVerified(true);
      } else {
        setError('Verification failed.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    }
  };

  return (
    <>
      <Head>
        <title>IdiotHub</title>
        <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
      </Head>
      <div style={styles.container}>
        <h1 style={styles.title}>IdiotHub</h1>
        {!verified ? (
          <>
            <p style={styles.subtitle}>Complete the verification to get the link</p>
            <div
              className="h-captcha"
              data-sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY}
              data-callback="onVerify"
            ></div>
            <button style={styles.button} onClick={() => window.location.reload()}>
              Verify
            </button>
            <a href="https://discord.gg/idiothub" target="_blank" rel="noopener noreferrer">
              <button style={styles.button}>Join Discord</button>
            </a>
          </>
        ) : (
          <div style={styles.infoBox}>
            <h2>Server Information</h2>
            <pre>{JSON.stringify(serverInfo, null, 2)}</pre>
          </div>
        )}
        {error && <p style={styles.error}>{error}</p>}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            function onVerify(token) {
              fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, serverId: "${serverId}" })
              })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  window.location.reload();
                } else {
                  alert('Verification failed.');
                }
              })
              .catch(() => {
                alert('An error occurred during verification.');
              });
            }
          `,
        }}
      />
    </>
  );
}

export async function getServerSideProps(context) {
  const { serverId } = context.query;
  return {
    props: { serverId: serverId || null },
  };
}

const styles = {
  container: {
    background: 'linear-gradient(145deg, #000000, #2b0040)',
    color: 'white',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    overflow: 'hidden',
  },
  title: {
    fontSize: '3em',
    marginBottom: '0.2em',
    color: '#b86bff',
  },
  subtitle: {
    fontSize: '1.3em',
    marginBottom: '2em',
  },
  button: {
    background: '#b86bff',
    border: 'none',
    padding: '12px 24px',
    fontSize: '1.1em',
    color: 'white',
    borderRadius: '12px',
    cursor: 'pointer',
    margin: '10px',
  },
  infoBox: {
    backgroundColor: '#1e1e2f',
    padding: '20px',
    borderRadius: '10px',
  },
  error: {
    color: 'red',
    marginTop: '20px',
  },
};
