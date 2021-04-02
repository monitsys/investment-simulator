function rungSimulation(scenario) {

    function getRandomizedOutcome() {
        var rnd = Math.random() * 100;
        var cumProb = 0;
        for (var i = 0; i < scenario.variants.length; i++) {
            cumProb += scenario.variants[i].probability;
            if (cumProb > rnd) {
                return scenario.variants[i].outcome;
            }
        }
    }

    function createSampleResult(sum, history) {
        var lp = history.reduce(function (prev, cur) {
            return prev < cur ? prev : cur;
        }, Number.MAX_SAFE_INTEGER);
        var hp = history.reduce(function (prev, cur) {
            return prev > cur ? prev : cur;
        }, Number.MIN_SAFE_INTEGER);
        return {
            result: sum - sum * scenario.exitFee * 0.01,
            history: history,
            lowestPoint: lp,
            highestPoint: hp
        };
    }

    function simulateTradeIteration(bid) {
        var sum = 0;
        if (bid > 0) {
            var sum = 0;
            for (var i = 0; i < scenario.parallelThreads; i++) {
                sum += (bid / scenario.parallelThreads) * getRandomizedOutcome() * 0.01;
            }
            var taxOnProfit = sum > 0 ? sum * scenario.taxOnProfit * 0.01 : 0;
            sum -= sum * scenario.feeOnAccum * 0.01 + taxOnProfit;
        }
        return sum;
    }

    function calculateGoal() {
        return scenario.financialGoal / (1 - scenario.exitFee * 0.01);
    }

    function generateAccumulationSample() {
        var sum = scenario.initialAmount - scenario.entranceCost;
        var history = [];
        var conservativeStrategyOnly = false;
        var goal = calculateGoal();
        for (var i = 0; i < scenario.numberOfIteration; i++) {
            history.push(sum);
            if (i >= scenario.giveUpAtIteration && sum < scenario.giveUpThreshold) {
                conservativeStrategyOnly = true;
            }
            var bid = sum;
            var conservativePart = 0;
            if (sum > goal) {
                bid = sum - scenario.financialGoal;
                conservativePart = sum - bid;
            } else if (conservativeStrategyOnly) {
                conservativePart = sum;
                bid = 0;
            }

            if (sum > 0) {
                var conserGrow = conservativePart * scenario.conservativeAlternative
                    * 0.01 * (scenario.durationOfIteration / 365);
                sum += simulateTradeIteration(bid) + conserGrow + scenario.additionAtEachIteration;
            }
        }
        return createSampleResult(sum, history);
    }

    function generateGoalSample() {
        var sum = scenario.initialAmount - scenario.entranceCost;
        var history = [];
        var goal = calculateGoal();
        for (var i = 0; i < scenario.numberOfIteration; i++) {
            history.push(sum);
            sum += simulateTradeIteration(sum) + scenario.additionAtEachIteration;
            if (sum >= goal || sum <= scenario.giveUpThreshold) {
                break;
            }
        }
        return createSampleResult(sum, history);
    }

    function groupResults(samples, resultGroupsCount) {
        var results = [];
        var groupingChunk = Math.ceil(samples.length / resultGroupsCount);
        for (var g = 0; g < samples.length; g += groupingChunk) {
            var result = {};
            result.samples = [];
            result.average = 0;
            result.max = samples[g].result;
            var i = g;
            for (; i < g + groupingChunk && i < samples.length; i++) {
                var s = samples[i];
                result.samples.push(s);
                result.average += s.result;
            }
            result.min = samples[i - 1].result;
            result.average = result.average / (i - g);
            result.start = (1 + g).toString();
            result.stop = i.toString();
            result.percentile = 100 * i / samples.length;
            results.push(result);
        }
        return results;
    }

    function getPercentAboveAverage(samples, average) {
        var low = 0;
        var high = samples.length - 1;
        var mid = 0;
        var iterationCount = 0;
        while (low != high) {
            if (++iterationCount >= samples.length) {
                throw "getPercentAboveAverage infinite loop alert";
            }
            mid = Math.round((low + high) / 2);
            if (samples[mid].result > average) {
                low = mid;
            }
            else {
                high = mid - 1;
            }
        }

        return 100 * high / (samples.length - 1);
    }

    function generateAllSamples() {
        var samples = [];
        var sampleGenerator = scenario.simulationType === 0 ? generateAccumulationSample : generateGoalSample;
        for (var i = 0; i < scenario.numberOfSamples; i++) {
            samples.push(sampleGenerator());
        }
        samples.sort(function (a, b) { return b.result - a.result; });
        return samples;
    }

    function calculateGoalReachedStat(samples) {
        var iterNumOfReachedGoal = 0;
        var goalReachedNum = 0;
        samples.forEach(function (sample) {
            if (sample.result >= scenario.financialGoal) {
                goalReachedNum++;
                iterNumOfReachedGoal += sample.history.length;
            }
        });
        var aver = goalReachedNum === 0 ? 0 : iterNumOfReachedGoal / goalReachedNum;
        return {
            percentOfReachedGoal: 100 * goalReachedNum / samples.length,
            averIterNumberToReachGoal: aver
        }
    }

    function performSimulation() {
        var startTime = new Date();
        var samples = generateAllSamples();

        function getValueAt(percent) {
            return samples[Math.round(percent * 0.01 * samples.length)].result;
        }

        var goalStat = calculateGoalReachedStat(samples);
        var sum = samples.reduce(function (sum, currentValue) {
            return sum + currentValue.result;
        }, 0);
        var avergInterestRate = scenario.variants.reduce(function (sum, currentValue) {
            return sum + currentValue.probability * currentValue.outcome * 0.01;
        }, 0);;
        var aver = sum / scenario.numberOfSamples;
        var simulatedTime = scenario.numberOfIteration * scenario.durationOfIteration / 365;
        var consAlt = scenario.initialAmount * Math.pow(1 + scenario.conservativeAlternative * 0.01, simulatedTime);
        consAlt += scenario.additionAtEachIteration * scenario.numberOfIteration
            * Math.pow(1 + scenario.conservativeAlternative * 0.01, simulatedTime / 2);
        var totalInv = scenario.initialAmount + scenario.additionAtEachIteration * scenario.numberOfIteration;
        var simInterestRate = 100 * (Math.pow(aver / totalInv, 1 / simulatedTime) - 1);
        var execTime = (new Date().getTime() - startTime.getTime()) / 1000;
        return {
            average: aver,
            simulatedYears: simulatedTime,
            groupedResult: groupResults(samples, scenario.resultGroupsCount),
            simulatedInterestRate: simInterestRate,
            totalInvestments: totalInv,
            conservativeAlternative: consAlt,
            executionTime: execTime,
            averageInterestRate: avergInterestRate,
            percentAboveAverage: getPercentAboveAverage(samples, aver),
            percentAboveConservative: getPercentAboveAverage(samples, consAlt),
            percentOfReachedGoal: goalStat.percentOfReachedGoal,
            averIterNumberToReachGoal: goalStat.averIterNumberToReachGoal,
            top5: getValueAt(5),
            top10: getValueAt(10),
            top15: getValueAt(15),
            top25: getValueAt(25),
            median: getValueAt(50),
            bottom25: getValueAt(75),
            bottom15: getValueAt(85),
            bottom10: getValueAt(90),
            bottom5: getValueAt(95)
        }
    }

    return performSimulation();
}