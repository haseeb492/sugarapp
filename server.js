import express, { urlencoded } from "express";
import mqtt from "mqtt";
import { Expo } from "expo-server-sdk";
import connectMongoDB from "./db/connectToMongoDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import sugarRoutes from "./routes/sugarRoutes.js";

const app = express();
const PORT = process.env.PORT || 8000;

/* ───── MIDDLEWARE ───── */
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/sugar", sugarRoutes);

/* ───── EXPO PUSH CONFIG ───── */
const expo = new Expo();
const pushTokens = new Set(); // memory only

app.post("/register-token", (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ error: "token required" });
  if (!Expo.isExpoPushToken(token))
    return res.status(400).json({ error: "invalid Expo token" });

  pushTokens.add(token);
  console.log("✅ Push token registered:", token);
  return res.json({ success: true });
});

/* ───── MQTT CONFIG ───── */
const mqttTopic = "test/topic";
const brokerUrl = `mqtts://${process.env.HIVEMQ_HOST}:${process.env.HIVEMQ_PORT}`;
const mqttOptions = {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};

const mqttClient = mqtt.connect(brokerUrl, mqttOptions);

mqttClient.on("connect", () => {
  console.log(`🔌 Connected to HiveMQ broker at: ${brokerUrl}`);

  mqttClient.subscribe(mqttTopic, (err) => {
    if (err) console.error(`❌ Failed to subscribe:`, err);
    else console.log(`📡 Subscribed to "${mqttTopic}"`);
  });
});

mqttClient.on("error", (err) => {
  console.error("MQTT Error:", err);
});

mqttClient.on("message", async (topic, buffer) => {
  const message = buffer.toString();
  console.log(`Received message on topic "${topic}": ${message}`);

  if (pushTokens.size === 0) {
    console.log("Message reciened but no device registered: ", message);
    return;
  }

  const messages = [...pushTokens].map((token) => ({
    to: token,
    sound: "default",
    title: "MQTT Message",
    body: message, // RAW message
    data: { raw: message },
  }));

  for (const chunk of expo.chunkPushNotifications(messages)) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.forEach((ticket, i) => {
        if (ticket.status === "error") {
          console.warn("Expo push error:", ticket);
          if (ticket.details?.error === "DeviceNotRegistered") {
            pushTokens.delete(chunk[i].to);
          }
        }
      });
    } catch (err) {
      console.error("Expo push failure:", err);
    }
  }
});

/* ───── MQTT PUBLISH ENDPOINT (Optional) ───── */
app.post("/publish", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  mqttClient.publish(mqttTopic, message, (err) => {
    if (err) {
      console.error("❌ MQTT Publish error:", err);
      return res.status(500).json({ error: "MQTT publish failed" });
    }

    console.log(`🛰  MQTT → ${mqttTopic}: ${message}`);
    res.json({ success: true });
  });
});

/* ───── START SERVER ───── */
app.listen(PORT, async () => {
  console.log(`🌐 Server running on PORT ${PORT}`);
  await connectMongoDB();
});
