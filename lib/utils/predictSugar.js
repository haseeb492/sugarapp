import "@tensorflow/tfjs-node";
import * as tf from "@tensorflow/tfjs";
import { loadTFLiteModel } from "tfjs-tflite-node";

let tfliteModel;

async function loadModel() {
  if (!tfliteModel) {
    tfliteModel = await loadTFLiteModel(
      "./sugarpredictor/regressor_model.tflite"
    );
  }
  return tfliteModel;
}

export async function predictSugar(
  currentSugar,
  calories,
  carbs,
  protein,
  fat,
  fiber
) {
  const model = await loadModel();
  const lookBack = 16;
  const seq = new Float32Array(lookBack * 7);
  for (let t = 0; t < lookBack; t++) {
    const base = t * 7;
    seq[base] = currentSugar;
    seq[base + 1] = calories;
    seq[base + 2] = carbs;
    seq[base + 3] = protein;
    seq[base + 4] = fat;
    seq[base + 5] = fiber;
    seq[base + 6] = t === lookBack - 1 ? 1 : 0;
  }
  const input = tf.tensor2d(seq, [1, 112], "float32");
  const output = model.predict(input);
  const [pred] = await output.data();
  tf.dispose([input, output]);
  return pred;
}
