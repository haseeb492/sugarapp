import "@tensorflow/tfjs-node";
import * as tf from "@tensorflow/tfjs";
import { loadTFLiteModel } from "tfjs-tflite-node";

let tfliteModel = null;

async function loadModel() {
  if (!tfliteModel) {
    tfliteModel = await loadTFLiteModel("./sugarpredictor/lstm_model.tflite");
  }
  return tfliteModel;
}

export async function predictSugar(calories, currentSugar, insulinDosage = 0) {
  const model = await loadModel();

  const seq = new Float32Array(5 * 12);

  for (let t = 0; t < 5; t++) {
    const base = t * 12;
    seq[base + 0] = calories;
    seq[base + 1] = currentSugar;
    seq[base + 2] = insulinDosage;
  }

  const inputTensor = tf.tensor3d(seq, [1, 5, 12], "float32");

  const outputTensor = model.predict(inputTensor);
  const outputData = await outputTensor.data();

  tf.dispose([inputTensor, outputTensor]);
  return outputData[0];
}
