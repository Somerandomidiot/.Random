export async function enqueueWebhook(payload, delaySeconds) {
  const url = `${process.env.UPSTASH_REDIS_REST_URL}/lpush/webhook-queue`;
  const sendAt = Date.now() + delaySeconds * 1000;

  const job = {
    ...payload,
    sendAt,
  };

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([JSON.stringify(job)]),
  });
}
