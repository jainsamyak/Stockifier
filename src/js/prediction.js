const tf = require('@tensorflow/tfjs-node');
const stockapi = require('./stockapi');

function Normalizer(val, min, max) {
    return (val - min) / (max - min);
}

global.pred = "1234";

stockapi.getStockHistoricalDaily('TCS.NSE', (data) => {

    prices = data[0];
    let min = Math.min.apply(null, prices);
    let max = Math.max.apply(null, prices);
    prices = prices.map((el) => Normalizer(el, min, max));

    dates = data[1];
    var lookbackPrices = [];
    var targets = [];
    for (let index = 10; index < prices.length; index++) {
        lookbackPrices[index - 10] = prices.slice(index - 10, index);
        targets.push(prices[index]);
    }
    tfPrices = tf.tensor2d(lookbackPrices);
    global.pred = tf.tensor2d(lookbackPrices[0], [1, 10]);
    global.pred = tf.reshape(global.pred, [1, 10, 1]);
    tfTargets = tf.tensor1d(targets);
    tfPrices = tf.reshape(tfPrices, [prices.length - 10, 10, 1]);
    tfPrices.print();
    tfTargets.print();

    const model = tf.sequential();
    model.add(tf.layers.lstm({ units: 64, inputShape: [10, 1], returnSequences: true }));
    model.add(tf.layers.lstm({ units: 100, inputShape: [10, 1] }));
    model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
    const lr = 0.005
    const opt = tf.train.sgd(lr);
    const loss = 'meanSquaredError';
    model.compile({ optimizer: 'adam', loss: loss, metrics: ['accuracy'] });


    async function fit() {
        let loss = Infinity;
        let epochs = 0;

        const resp = await model.fit(tfPrices, tfTargets, {
            epochs: 10,
            callbacks: {
                onEpochEnd: (epoch, log) => {
                    console.log(`Epoch ${epoch}: loss = ${log.loss}`)
                    loss = log.loss;
                    epochs += 1;
                }
            },
            shuffle: true
        });


    }
    fit().then(() => {
        global.pred.print()
        model.predict(global.pred).print();
    });
});
// Optional Load the binding:
// Use '@tensorflow/tfjs-node-gpu' if running with GPU.

// Train a simple model:
/* const model = tf.sequential();
model.add(tf.layers.dense({ units: 1, activation: 'linear', inputShape: [2] }));
model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

const xs = tf.tensor2d([[0, 0],
[0, 1],
[1, 0],
[1, 1]]);
const ys = tf.tensor2d([[0], [0], [0], [1]]);

async function fit() {
    const resp = await model.fit(xs, ys, {
        epochs: 1000,
        callbacks: {
            onEpochEnd: (epoch, log) => console.log(`Epoch ${epoch}: loss = ${log.loss}`)
        },
        shuffle: true
    });

}
fit().then(() => {
    model.predict(tf.tensor2d([[1, 1]])).print()
}) */
/*
let data = [];
for (let index = 1; index <= 30; index++) {
    data.push(index);
}
let xs = [];
let ys = [];
for (let index = 0; index < 25; index++) {

    xs[index] = data.slice(index, index + 5);
    ys.push(index + 5);
}
const tfxs = tf.tensor2d(xs);
const tfxr = tf.reshape(tfxs, [25, 5, 1])
const tfys = tf.tensor1d(ys);
const tfyr = tf.reshape(tfys, [25, 1, 1])
//tfxs.print()
tfxr.print()
tfyr.print()


 */