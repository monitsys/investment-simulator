importScripts('simulatorRunner.js?20180429v01');
onmessage = function (e) {
    try {
        var result = rungSimulation(e.data);
        postMessage({simulationResults: result});
    } catch(err) {
        var msg = 'Error at worker.js'+err;
        console.error(msg);
        postMessage({workerError: msg});
    }
};

