export default async function handler(req, res) {
  const popUrl = `${process.env.UPSTASH_REDIS_REST_URL}/rpop/webhook-queue`;

  for (let i = 0; i < 10; i++) {
    const result = await fetch(popUrl, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    });
    const data = await result.json();
    if (!data.result) break;

    const job = JSON.parse(data.result);
    if (Date.now() < job.sendAt) {
      // not ready, requeue
      await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/rpush/webhook-queue`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([JSON.stringify(job)]),
      });
      break;
    }

    try {
      await sendWebhook(job.url, job.embed);
    } catch (e) {
      console.error("Failed webhook job:", e);
    }
  }

  return res.status(200).send("Checked queue.");
}

async function sendWebhook(url, embed) {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(embed),
  });
}
