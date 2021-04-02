function renderOutput(result, tagId) {
    function isMobile() {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            return true;
        }
        return false;
    }

    function fc(num) {
        return Math.round(num).toLocaleString();
    }

    var tags = [];
    function pushResult(description, value, units) {
        var valAndUnits = '';
        switch (units) {
            case '%':
                valAndUnits = value.toFixed(2) + units;
                break;
            case '$':
                valAndUnits = units + fc(value);
                break;
            default:
                valAndUnits = value + ' ' + units;
        };
        tags.push('<tr><td>' + description + '</td><td>' + valAndUnits + '</td></tr>');
    }
    var gnWidth = isMobile() ? 70 : 40;
    tags.push('<table id="invsim-general-result" width="' + gnWidth + '%"><col width="75%"><col width="25%">');
    pushResult('Simulated Time', result.simulatedYears.toFixed(2), 'years');
    pushResult('Average Interest Rate', result.averageInterestRate, '%');
    pushResult('Simulated Average Wealth', result.average, '$');
    pushResult('Total investments', result.totalInvestments, '$');
    pushResult('Simulated Average Interest Rate', result.simulatedInterestRate, '%');
    pushResult('Percent of reached the goal', result.percentOfReachedGoal, '%');
    pushResult('Average iteration needed to reach the goal', result.averIterNumberToReachGoal.toFixed(2), 'iterations');
    pushResult('Top 5% has more', result.top5, '$');
    pushResult('Top 10% has more', result.top10, '$');
    pushResult('Top 15% has more', result.top15, '$');
    pushResult('Top 25% has more', result.top25, '$');
    pushResult('Median wealth', result.median, '$');
    pushResult('Bottom 25% has less', result.bottom25, '$');
    pushResult('Bottom 15% has less', result.bottom15, '$');
    pushResult('Bottom 10% has less', result.bottom10, '$');
    pushResult('Bottom 5% has less', result.bottom5, '$');
    pushResult('Percent above average', result.percentAboveAverage, '%');
    pushResult('Accumulated conservative strategy', result.conservativeAlternative, '$');
    pushResult('Percent above conservative', result.percentAboveConservative, '%');
    pushResult('Execution Time', result.executionTime.toFixed(3), 'seconds');
    tags.push('</table>');

    tags.push('<div class="invsim-vertical-divider"></div>');
    tags.push('<table id="invsim-result-table"');
    if (isMobile()) {
        tags.push(' style="width:100%"');
    }
    tags.push('><col width="15%"><col width="17%"><col width="17%"><col width="17%"><col width="17%"><col width="17%">');
    tags.push('<tr>');
    tags.push('<td>Percentile</td>');
    tags.push('<td>Range</td>');
    tags.push('<td>Maximum</td>');
    tags.push('<td>Average</td>');
    tags.push('<td>Minimum</td>');
    tags.push('<td>All data</td>');
    tags.push('</tr>');
    for (var i = 0; i < result.groupedResult.length; i++) {
        var r = result.groupedResult[i];
        tags.push('<tr>');
        tags.push('<td>' + r.percentile + '</td>');
        tags.push('<td>' + r.start + ' - ' + r.stop + '</td>');
        tags.push('<td>' + fc(r.max) + '</td>');
        tags.push('<td>' + fc(r.average) + '</td>');
        tags.push('<td>' + fc(r.min) + '</td>');
        tags.push('<td><div class="invsim-expander" id="invsim-expander-' + i + '">Expand</div></td>');
        tags.push('</tr>');
        tags.push('<tr><td style="display:none" colspan="6" id="invsim-expandible-' + i + '"></td></tr>');
    }
    tags.push('</table>');
    document.getElementById(tagId).innerHTML = tags.join('');

    function toggleDatails(index) {
        var expander = document.getElementById('invsim-expander-' + index);
        var element = document.getElementById('invsim-expandible-' + index);
        if (expander.innerText === 'Collapse') {
            expander.innerText = 'Expand';
            element.style.display = 'none';
            return;
        } else if (element.innerHTML.length > 0) {
            element.style.display = 'table-cell';
            expander.innerText = 'Collapse';
            return;
        }
        expander.innerText = 'Collapse';

        var nodes = [];
        var samples = result.groupedResult[index].samples;
        nodes.push('<table>');
        if (samples.length > 0) {
            nodes.push('<tr>');
            nodes.push('<td>Sample number</td>');
            nodes.push('<td>Iteration count</td>');
            nodes.push('<td>Lowest point</td>');
            nodes.push('<td>Highest Point</td>');
            nodes.push('<td>Path</td>');
            nodes.push('<td>Result</td>');
            nodes.push('</tr>');
        }
        var number = samples.length * index + 1;
        samples.forEach(function (s) {
            nodes.push('<tr>');
            nodes.push('<td>' + number++ + '</td>');
            nodes.push('<td>' + s.history.length + '</td>');
            nodes.push('<td>' + fc(s.lowestPoint) + '</td>');
            nodes.push('<td>' + fc(s.highestPoint) + '</td>');
            var historyStr = s.history.map(function (h) { return Math.round(h); }).join('; ');
            nodes.push('<td>' + historyStr + '</td>');
            nodes.push('<td>' + fc(s.result) + '</td>');
            nodes.push('</tr>');
        });
        nodes.push('</table');

        element.innerHTML = nodes.join('');
        element.style.display = 'table-cell';
    }

    setTimeout(function () {
        for (var i = 0; i < result.groupedResult.length; i++) {
            document.getElementById('invsim-expander-' + i).addEventListener("click", toggleDatails.bind(null, i));
        }
    }, 0);
}
