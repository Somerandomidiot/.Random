
import { setTimeout } from 'timers/promises';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Only GET allowed");
  }

  const {
    name,
    expire,
    luck,
    placeId,
    jobId,
    height,
  } = req.query;

  const isValidNumber = (val) => !isNaN(Number(val));
  const isValidString = (val) => typeof val === "string" && val.trim().length > 0;

  if (
    !isValidString(name) ||
    !isValidNumber(expire) ||
    !isValidNumber(luck) ||
    !isValidNumber(placeId) ||
    !isValidString(jobId) ||
    !isValidNumber(height)
  ) {
    return res.status(400).send("Invalid or missing query parameters.");
  }

  const joinLink = `https://roblox-server-join.vercel.app/?placeId=${placeId}&jobId=${jobId}`;
  const expiresUnix = Math.floor(Number(expire));
  const expireRelative = `<t:${expiresUnix}:R>`;
  const luckMulti = Number(luck);
  const heightMeters = `${Number(height)} meters`;

  const AVATAR_URL = "https://cdn.discordapp.com/attachments/998210323368652924/1363189689871241617/db57affe3770d5677254769cb16220a2.png?ex=680520d4&is=6803cf54&hm=1075fd9cf79f6c382425b0b2cd5d98697e52817eb84edbb3e24aed3dec137f09&";

  const embed = {
    username: name,
    avatar_url: AVATAR_URL,
    embeds: [
      {
        title: `${name} Found!!!`,
        description: getDescription(name),
        color: 16776963,
        thumbnail: { url: AVATAR_URL },
        fields: [
          {
            name: "Server Info",
            value: `Place ID: ${placeId}`,
            inline: false,
          },
          {
            name: "Rift Info",
            value: `Luck Multi: ${luckMulti}\nExpires: ${expireRelative}\nHeight: ${heightMeters}`,
            inline: false,
          },
          {
            name: "Join Script",
            value: `\`\`\`lua\ngame:GetService("TeleportService"):TeleportToPlaceInstance(${placeId}, "${jobId}")\n\`\`\``,
            inline: false,
          },
          {
            name: "Server Link",
            value: `[Click to Join](${joinLink})`,
            inline: false,
          },
        ],
        footer: {
          text: `Created By SomeRandomIdiot | .gg/UQSSMYuyZf  | ${new Date().toLocaleString()}`,
        },
      },
    ],
  };

  const TAG_WEBHOOKS = {
    AURA_EGG_P1: process.env.AURA_EGG_P1,
    AURA_EGG_P2: process.env.AURA_EGG_P2,
    AURA_EGG: process.env.AURA_EGG,
    ROYAL_CHEST: process.env.ROYAL_CHEST,
    X25EGG: process.env.X25EGG,
  };

  try {
    const webhookTag = determineWebhookTag(name, luckMulti);
    if (!webhookTag) return res.status(400).send("Unknown type or luck value");

    if (webhookTag === "AURA_EGG") {
      await sendWebhook(TAG_WEBHOOKS.AURA_EGG_P1, embed);
      await setTimeout(5000);
      await sendWebhook(TAG_WEBHOOKS.AURA_EGG_P2, embed);
      await setTimeout(5000);
      await sendWebhook(TAG_WEBHOOKS.AURA_EGG, embed);
    } else {
      await sendWebhook(TAG_WEBHOOKS[webhookTag], embed);
    }

    return res.status(200).send(`Webhook sent to: ${webhookTag}`);
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send("Internal Server Error");
  }
}

async function sendWebhook(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to send webhook: ${response.status}`);
  }
}

function getDescription(name) {
  if (name.toLowerCase().includes("aura")) return "An Aura Egg Has Been Found!";
  if (name.toLowerCase().includes("royal")) return "A Royal Chest Has Been Found!";
  if (name.toLowerCase().includes("egg")) return `A(n) ${name} Has Been Found!`;
  return "What the Fuck";
}

function determineWebhookTag(name, luckMulti) {
  const lower = name.toLowerCase();

  if (lower.includes("royal")) return "ROYAL_CHEST";
  if (luckMulti === 25) return "X25EGG";
  if (lower.includes("aura")) return "AURA_EGG";

  return null;
}
