import express, { urlencoded } from "express";
import mqtt from "mqtt";
import connectMongoDB from "./db/connectToMongoDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import sugarRoutes from "./routes/sugarRoutes.js";

const app = express();

const PORT = 8000;

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/sugar", sugarRoutes);

const mqttTopic = "test/topic";

// MQTT configuration
const brokerUrl = `mqtts://${process.env.HIVEMQ_HOST}:${process.env.HIVEMQ_PORT}`;
const mqttOptions = {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};

// connect to mqtt broker
const mqttClient = mqtt.connect(brokerUrl, mqttOptions);

mqttClient.on("connect", () => {
  console.log(`Connected to HiveMQ broker at: ${brokerUrl}`);

  // subscribe to the topic
  mqttClient.subscribe(mqttTopic, (err) => {
    if (err) {
      console.error(`Failed to subscribe to topic "${mqttTopic}":`, err);
    } else {
      console.log(`Successfully subscribed to topic "${mqttTopic}"`);
    }
  });
});

mqttClient.on("error", (error) => {
  console.error("MQTT Client Error:", error);
});

mqttClient.on("message", (topic, messageBuffer) => {
  const message = messageBuffer.toString();
  console.log(`Received message on topic "${topic}": ${message}`);
});

// POST endpoint to publish message
app.post("/publish", (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "No message provided in the request body",
      });
    }
    // publish message
    mqttClient.publish(mqttTopic, message, (err) => {
      if (err) {
        console.error("Failed to publish message:", err);
        return res.status(500).json({ error: "Failed to publish message" });
      }

      console.log(`Published message to "${mqttTopic}": ${message}`);
      return res.json({
        success: true,
        publishedMessage: message,
      });
    });
  } catch (error) {
    console.log("Error publishing message: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on PORT ${PORT}`);
  await connectMongoDB();
});
