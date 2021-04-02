function createSimulator() {

    var defaultScenario = {
        numberOfIteration: 10,
        durationOfIteration: 60,
        numberOfSamples: 10000,
        initialAmount: 50000,
        additionAtEachIteration: 0,
        resultGroupsCount: 100,
        conservativeAlternative: 5,
        financialGoal: 100 * 1000 * 1000,
        iterFee: 0,
        feeOnAccum: 0,
        taxOnProfit: 0,
        exitFee: 0,
        entranceCost: 0,
        giveUpAtIteration: 1,
        giveUpThreshold: 0,
        simulationType: 0,
        parallelThreads: 1,
        variants: [
            {
                name: 'Idealistic',
                probability: 5,
                outcome: 75
            },
            {
                name: 'Optimistic',
                probability: 20,
                outcome: 35
            },
            {
                name: 'Basic',
                probability: 50,
                outcome: 25
            },
            {
                name: 'Pesimistic',
                probability: 20,
                outcome: -25
            },
            {
                name: 'Catastrophic',
                probability: 5,
                outcome: -50
            },
        ]
    };

    function getAverageInterestRate(scenario) {
        return scenario.variants.reduce(function (sum, currentValue) {
            return sum + currentValue.probability * currentValue.outcome * 0.01;
        }, 0);;
    }

    function getTotalPercentage(scenario) {
        return scenario.variants.reduce(function (sum, currentValue) {
            return sum + currentValue.probability;
        }, 0);;
    }

    var browserHistoryStateObject = new Date().getTime();
    function setScenarioToUrl(scenario) {
        var url = '?';
        for (var key in scenario) {
            var field = scenario[key];
            if (typeof field === 'number') {
                url += key + '=' + Math.round(field) + '&';
            }
        }
        url += 'variants=';
        scenario.variants.forEach(function (variant) {
            var vs = '';
            for (var key in variant) {
                vs += key + ':' + variant[key] + '_';
            }
            url += vs.slice(0, -1) + ';';
        });
        url = url.slice(0, -1);
        history.pushState(browserHistoryStateObject, "Investments strategy simulator", url);
    }

    function deserializeFromUrl(scenario) {
        function deserializeVariantFromStr(variantsStr) {
            var deserializedVariant = {};
            variantsStr.split('_').forEach(function (varStr) {
                var kv = varStr.split(':');
                if (kv.length > 1) {
                    deserializedVariant[kv[0]] = kv[1];
                }
            });
            deserializedVariant.probability = +deserializedVariant.probability;
            deserializedVariant.outcome = +deserializedVariant.outcome;
            if (!deserializedVariant.name || isNaN(deserializedVariant.probability) || isNaN(deserializedVariant.outcome)) {
                return;
            }
            scenario.variants.forEach(function (variant) {
                if (deserializedVariant && variant.name === deserializedVariant.name) {
                    for (var k in deserializedVariant) {
                        variant[k] = deserializedVariant[k];
                    }
                    deserializedVariant = null;
                }
            });
            if (deserializedVariant) {
                scenario.variants.push(deserializedVariant);
            }
        }

        var url = window.location.href;
        var parts = url.split('?');
        if (parts.length !== 2 || parts[1].length < 10) {
            return;
        }
        parts[1].split('&').forEach(function (keyField) {
            var p = keyField.split('=');
            if (p.length < 2) {
                return;
            }
            if (p[0] === 'variants') {
                p[1].split(';').forEach(deserializeVariantFromStr);
            } else {
                var d = +p[1];
                if (!isNaN(d)) {
                    scenario[p[0]] = d;
                }
            }
        });
    }

    function generateTemplate(scenario) {
        var tags = [];

        function pushFiled(name, description, isFloat) {
            var floatAttr = !!(isFloat || false);
            var val = scenario[name];
            val = floatAttr ? val.toFixed(2) : val;
            tags.push('<label for="invsim-' + name + '">' + description + '</label>');
            tags.push('<input type="text" name="' + name + '" id="invsim-' + name + '" value="' + val + '" isFloat="' + floatAttr + '" isObservable></input>');
        }

        tags.push('<div id="invsim-inner-root">');
        tags.push('<div id="invsim-setting-from">');
        tags.push('<a href="#" id="invsim-defaultButton">Default scenario</a>');
        tags.push('<div class="invsim-vertical-divider"></div>');
        tags.push('<table id="invsim-scenarious-tabel">');
        tags.push('<tr><td></td><td>Probability %</td><td>Outcome %</td></tr>');
        scenario.variants.forEach(function (variant) {
            tags.push('<tr>');
            tags.push('<td>' + variant.name + '</td>');
            tags.push('<td><input type="text" id="invsim-prob-' + variant.name + '" value="' + variant.probability.toFixed(2) + '" isFloat="true"></input></td>');
            tags.push('<td><input type="text" id="invsim-outcome-' + variant.name + '" value="' + variant.outcome + '"></input></td>');
            tags.push('</tr>');
        });
        tags.push('<tr><td>Total</td>');
        tags.push('<td id="invsim-probability-check">' + getTotalPercentage(scenario).toFixed(2) + '</td>');
        tags.push('<td id="invsim-outcome-check">' + getAverageInterestRate(scenario).toFixed(2) + '</td>');
        tags.push('</tr>');
        tags.push('</table>');
        tags.push('<div class="invsim-vertical-divider"></div>');
        tags.push('<div style="clear:both">');
        tags.push('<div style="float:left">');
        pushFiled('initialAmount', 'Initial Amount $');
        tags.push('<label for="invsim-simulation-type">Strategy Type</label>');
        tags.push('<select name="invsim-simulation-type" id="invsim-simulation-type">');
        tags.push('<option value="0">Accumulation</option>');
        if (scenario.simulationType === 1) {
            tags.push('<option value="1" selected>Reaching goal</option>');
        } else {
            tags.push('<option value="1">Reaching goal</option>');
        }
        tags.push('</select>');
        pushFiled('financialGoal', 'Financial Goal $');
        pushFiled('numberOfIteration', 'Number Of Iteration');
        pushFiled('parallelThreads', 'Parallel Threads');
        pushFiled('durationOfIteration', 'Duration of Iteration (days)');
        pushFiled('additionAtEachIteration', 'Addition At Iteration $');
        pushFiled('numberOfSamples', 'Number Of Samples');
        pushFiled('resultGroupsCount', 'Result Groups Count');
        tags.push('</div>');
        tags.push('<div style="float:left; padding-left:30px;">');
        pushFiled('entranceCost', 'Entrance Cost $');
        pushFiled('iterFee', 'Iteration Fee $');
        pushFiled('feeOnAccum', 'Fee on accumulated resources %', true);
        pushFiled('taxOnProfit', 'Tax on profit %', true);
        pushFiled('exitFee', 'Exit fee %', true);
        pushFiled('conservativeAlternative', 'Conservative interest rate %', true);
        pushFiled('giveUpAtIteration', 'Give up at iteration');
        pushFiled('giveUpThreshold', 'Give up threshold');
        tags.push('</div>');
        tags.push('</div>');
        tags.push('<div style="clear:both"></div>');
        tags.push('<div id="invsim-error-message" style="display:none">Please, correct probabilities.</div>');
        tags.push('<a href="#" id="invsim-rungButton" class="invsim-blue-button">Generate Prognosis</a>');
        tags.push('<div class="invsim-vertical-divider"></div>');
        tags.push('</div>');
        tags.push('<div id="invsim-results"></div>');
        tags.push('</div>');

        return tags.join('');
    }

    function subscribeForEvents(scenario) {
        function getEl(elementId) {
            return document.getElementById(elementId);
        }

        var isAllValid = true;
        function checkPercentages() {
            var sum = getTotalPercentage(scenario);
            isAllValid = sum === 100;
            getEl("invsim-probability-check").innerText = sum.toFixed(2);
            scenario.variants.forEach(function (variant) {
                var element = getEl('invsim-prob-' + variant.name);
                if (isAllValid) {
                    element.classList.remove('invsim-error-input');
                } else {
                    element.classList.add('invsim-error-input');
                }
            });
        }

        function getElementValue(elementId, defaultValue) {
            var el = getEl(elementId);
            var isFloat = el.getAttribute('isFloat') === 'true';
            var parser = isFloat ? parseFloat : parseInt;
            if (el && el.value !== undefined) {
                var d = el.value === '' ? 0 : parser(el.value);
                if (isNaN(d)) {
                    d = defaultValue;
                }
                el.value = isFloat ? d.toFixed(2) : d;
                return d;
            }
            return defaultValue;
        }

        scenario.variants.forEach(function (variant) {
            var probInputId = 'invsim-prob-' + variant.name;
            getEl(probInputId).addEventListener("change", function () {
                variant.probability = getElementValue(probInputId, variant.probability);
                checkPercentages();
                setScenarioToUrl(scenario);
            });

            var outcomeInputId = 'invsim-outcome-' + variant.name;
            getEl(outcomeInputId).addEventListener("change", function () {
                variant.outcome = getElementValue(outcomeInputId, variant.outcome);
                setScenarioToUrl(scenario);
                getEl("invsim-outcome-check").innerText = getAverageInterestRate(scenario).toFixed(2);
            });
        });

       var obsrvArr = Array.prototype.slice.call(document.querySelectorAll("input[isObservable]"), 0);
       obsrvArr.forEach(function(element) {
            element.addEventListener("change", function () {
                scenario[element.name] = getElementValue(element.id, scenario[element.name]);
                setScenarioToUrl(scenario);
            });
        });

        var simulatedTypeElement = getEl('invsim-simulation-type');
        simulatedTypeElement.addEventListener("change", function (event) {
            var simType = simulatedTypeElement.value;
            simType = +simType;
            if (!isNaN(simType)) {
                scenario.simulationType = simType;
                setScenarioToUrl(scenario);
            }
        });

        getEl('invsim-defaultButton').addEventListener("click", function (event) {
            event.preventDefault();
            var ar = window.location.href.split('?');
            if (ar.length === 2) {
                window.location.href = ar[0];
            }
        });

        function performSimulation() {
            var compCount = scenario.numberOfIteration * scenario.numberOfSamples * scenario.parallelThreads;
            if (compCount > 1000*1000 && typeof (Worker) !== "undefined") {
                performSimulationInSeparateThread();
            } else {
                performSimulationAsync();
            }
        }

        function performSimulationAsync() {
            setTimeout(function () {
                try {
                    renderOutput(rungSimulation(scenario), 'invsim-results')
                }
                catch (err) {
                    getEl('invsim-results').innerHTML = '<b>Error, sorry. Try something else...</b>';
                    console.error(err);
                }
            }, 0);
        }

        var worker = null;
        function performSimulationInSeparateThread() {
            worker = new Worker('worker.js?20180429v01');
            worker.onmessage = function (e) {
                try {
                    if (e.data.workerError === undefined) {
                        renderOutput(e.data.simulationResults, 'invsim-results');
                    } else {
                        getEl('invsim-results').innerHTML = '<b>Error, sorry. Try something else...</b>';
                    }
                }
                catch (err) {
                    getEl('invsim-results').innerHTML = '<b>Error, sorry. Try something else...</b>';
                    console.error(err);
                }
                getEl('invsim-rungButton').innerText = 'Generate Prognosis';
                worker.terminate();
                worker = null;
            };
            worker.onerror = function (e) {
                console.error(e);
            }
            worker.postMessage(scenario);
            getEl('invsim-rungButton').innerText = 'Cancel';
        }

        getEl('invsim-rungButton').addEventListener("click", function (event) {
            if (worker !== null) {
                worker.terminate();
                worker = null;
                getEl('invsim-rungButton').innerText = 'Generate Prognosis';
                getEl('invsim-results').innerHTML = '';
                return;
            }
            event.preventDefault();
            if (isAllValid) {
                getEl('invsim-error-message').style.display = 'none';
                getEl('invsim-results').innerHTML = '<b>Processing...</b>';
                performSimulation();
            } else {
                getEl('invsim-error-message').style.display = 'block';
            }
        });
    }

    return {
        init: function (initialData) {
            if (initialData) {
                for (var propName in initialData) {
                    if (typeof defaultScenario[propName] !== 'undefined') {
                        defaultScenario[propName] = initialData[propName];
                    }
                }
            }
            return this;
        },

        generateAt: function (tagId) {
            var rootEl = document.getElementById(tagId);
            if (!rootEl) {
                console.error('generateTemplate failed. Root element was not found.');
                return;
            }
            deserializeFromUrl(defaultScenario);
            rootEl.innerHTML = generateTemplate(defaultScenario);;
            setTimeout(function () {
                subscribeForEvents(defaultScenario);
            }, 0);
        }
    }
}