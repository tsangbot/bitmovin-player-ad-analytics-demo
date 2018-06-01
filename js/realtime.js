/****************************************************************************
 *
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org>
 *
 ****************************************************************************/

var analytics, player, currentImpressionChart, lastImpression;
var onPlayTimeout, impressionPollingInterval;
var ON_PLAY_TIMEOUT_DELAY = 300;
var IMPRESSION_POLLING_INTERVAL = 3000;
var firstImpressionPollingInterval = true;
var videoStartupTimeSet = false;
var firstImpressionPollingTimeout;
var t = new Date().getTime();
var s = 0;


function handleOnSkipped(){
    setAdSkipped(s += 1);
    console.log("Ad skipped!!");

}

function handleOnReady(tableName) {
    getCurrentImpression(function (currentImpression) {
        if (currentImpression && firstImpressionPollingInterval && currentImpression.length > 0) {
            firstImpressionPollingInterval = false;
            setStaticImpressionData(currentImpression[0]);
        } else {
            window.clearTimeout(firstImpressionPollingTimeout);
            firstImpressionPollingTimeout = window.setTimeout(handleOnReady, 1000);
        }
    });
}

function handleOnPlay() {
    if (onPlayTimeout) {
        return;
    }

    onPlayTimeout = window.setTimeout(function () {
        impressionPollingInterval = window.setInterval(function () {
            getCurrentImpression(function (currentImpression) {
                var impressionDiff = getImpressionDiff(lastImpression, currentImpression);
                var series = currentImpressionChart.series[0];

                if (!videoStartupTimeSet) {
                    setVideoStartupTime(currentImpression);
                }

                insertImpressionDiffToLog(impressionDiff);

                for (var i = 0; i < impressionDiff.length; i++) {
                    if (impressionDiff[i].state.toLowerCase().indexOf('playing') < 0) {
                        continue;
                    }

                    var videoTimeStart = impressionDiff[i].videotime_start / 1000;
                    var videoTimeEnd = impressionDiff[i].videotime_end / 1000;
                    var videoBitrate = impressionDiff[i].video_bitrate;

                    series.addPoint([videoTimeStart, videoBitrate]);
                    series.addPoint([videoTimeEnd, videoBitrate]);
                }

                lastImpression = currentImpression;
            });
        }, IMPRESSION_POLLING_INTERVAL)
    }, ON_PLAY_TIMEOUT_DELAY);
}

function setStaticImpressionData(impressionRow, tableName) {
    var informationTableId = 'information-table';

    appendRowToTable(informationTableId, createKeyValueTableRow('City', impressionRow.city));
    appendRowToTable(informationTableId, createKeyValueTableRow('Browser', impressionRow.browser));
    appendRowToTable(informationTableId, createKeyValueTableRow('Browser Version', impressionRow.browser_version_major));
    appendRowToTable(informationTableId, createKeyValueTableRow('Operating System', impressionRow.operatingsystem));
    appendRowToTable(informationTableId, createKeyValueTableRow('Player Technology', impressionRow.player_tech));
    appendRowToTable(informationTableId, createKeyValueTableRow('Player Version', impressionRow.player_version));
    appendRowToTable(informationTableId, createKeyValueTableRow('Stream Format', impressionRow.stream_format));
    appendRowToTable(informationTableId, createKeyValueTableRow('Page Load Time', impressionRow.page_load_time + 'ms'));
    appendRowToTable(informationTableId, createKeyValueTableRow('Player Startup Time', impressionRow.player_startuptime + 'ms'));
}

function setVideoStartupTime(impressionRows) {
    for (var i = 0; i < impressionRows.length; i++) {
        if (impressionRows[i].startuptime > 0 && impressionRows[i].video_startuptime > 0) {
            videoStartupTimeSet = true;

            var informationTableId = 'information-table';
            appendRowToTable(informationTableId, createKeyValueTableRow('Video Startup time', impressionRows[i].video_startuptime + 'ms'));
            appendRowToTable(informationTableId, createKeyValueTableRow('Total Startup time', impressionRows[i].startuptime + 'ms'));
            break;
        }
    }
}



function setAdSkipped(noAdSkipped) {
    var informationTableId = 'ad-information-table';
    appendRowToTable(informationTableId, createKeyValueTableRow('Ad Skipped', noAdSkipped));


}

function insertImpressionDiffToLog(impressionDiff) {
    for (var i = 0; i < impressionDiff.length; i++) {
        insertImpressionLogRow(impressionDiff[i]);
        insertImpressionQueryResponseJson(impressionDiff[i]);
    }
}

function insertImpressionLogRow(impressionRow) {
    var impressionLogTableId = 'impression-log-table';

    var cells = [];
    cells.push(impressionRow.state);
    cells.push(impressionRow.player_startuptime);
    cells.push(impressionRow.video_startuptime);
    cells.push(impressionRow.duration);
    cells.push(impressionRow.buffered);
    cells.push(impressionRow.videotime_start);
    cells.push(impressionRow.videotime_end);
    cells.push(impressionRow.played);
    cells.push(impressionRow.paused);
    cells.push(impressionRow.seeked);
    cells.push(impressionRow.video_bitrate);

    appendRowToTable(impressionLogTableId, createTableRow(cells));
}

function insertImpressionQueryResponseJson(impressionRow) {
    var pre = document.createElement("pre");
    pre.style.textAlign = 'left';
    var code = document.createElement("code");
    code.className = "JSON";
    code.innerHTML = JSON.stringify(impressionRow, null, 2);
    pre.appendChild(code);

    var cellDiv = document.createElement('div');
    cellDiv.appendChild(pre);

    var keyCell = document.createElement("td");
    keyCell.appendChild(cellDiv);

    document.getElementById('backend-calls-table').getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].appendChild(keyCell);

}



function createTableRow(cells) {
    var row = document.createElement("tr");

    for (var i = 0; i < cells.length; i++) {
        var cell = document.createElement("td");
        var cellText = document.createTextNode(cells[i]);
        cell.appendChild(cellText);
        row.appendChild(cell);
    }

    return row;
}

function getImpressionDiff(lastImpression, currentImpression) {
    if (!lastImpression) {
        return currentImpression;
    }

    var impressionDiff = [];

    for (var i = 0; i < currentImpression.length; i++) {
        var clientTime = currentImpression[i].client_time;
        var found = false;
        for (var j = 0; j < lastImpression.length; j++) {
            if (lastImpression[j].client_time === clientTime) {
                found = true;
                break;
            }
        }
        if (!found) {
            impressionDiff.push(currentImpression[i]);
        }
    }

    return impressionDiff;
}

function getVideoStatistics(videoId, tableName) {
    if (!videoId) {
        return;
    }

    getImpressionStatistics(videoId, tableName);
    getAvgStartupDelay(videoId, tableName);
    getAvgRebuffering(videoId, tableName);
}

function getImpressionStatistics(videoId, tableName) {
    var now = new Date();
    var query = {
        start: new Date(now.getTime() - 1000 * 60 * 60 * 1000).toISOString(),
        end: now.toISOString(),
        dimension: 'IMPRESSION_ID',
        filters: [{
            name: 'VIDEO_ID',
            operator: 'EQ',
            value: videoId
        }, {
            name: 'PLAYED',
            operator: 'GT',
            value: 0
        }]
    };

    doQuery('count', query, function (analyticsResponse) {
        appendRowToTable(tableName, createKeyValueTableRow('Impressions', analyticsResponse.rows[0][0]));
    });
}

function getAvgStartupDelay(videoId, tableName) {
    var now = new Date();
    var query = {
        start: new Date(now.getTime() - 1000 * 60 * 60 * 1000).toISOString(),
        end: now.toISOString(),
        dimension: 'STARTUPTIME',
        filters: [{
            name: 'VIDEO_ID',
            operator: 'EQ',
            value: videoId
        }, {
            name: 'STARTUPTIME',
            operator: 'GT',
            value: 0
        }]
    };

    doQuery('avg', query, function (analyticsResponse) {
        appendRowToTable(tableName, createKeyValueTableRow('Average Total Startup time', Math.floor(analyticsResponse.rows[0][0]) + 'ms'));
    });
}

function getAvgRebuffering(videoId, tableName) {
    var now = new Date();
    var query = {
        start: new Date(now.getTime() - 1000 * 60 * 60 * 1000).toISOString(),
        end: now.toISOString(),
        dimension: 'BUFFERED',
        filters: [{
            name: 'VIDEO_ID',
            operator: 'EQ',
            value: videoId
        }, {
            name: 'BUFFERED',
            operator: 'GT',
            value: 0
        }, {
            name: 'VIDEOTIME_END',
            operator: 'GT',
            value: 0
        }]
    };

    doQuery('avg', query, function (analyticsResponse) {
        appendRowToTable(tableName, createKeyValueTableRow('Average Rebuffering', Math.floor(analyticsResponse.rows[0][0]) + 'ms'));
    });
}

function getCurrentImpression(callback) {
    var currentImpressionid = analytics.getCurrentImpressionId();
    if (!currentImpressionid) {
        if (callback) {
            callback();
        }
        return;
    }

    var xhr = new XMLHttpRequest();
    var url = 'https://api.bitmovin.com/v1/analytics/impressions/' + currentImpressionid;
    xhr.open('GET', url, true);

    xhr.setRequestHeader('X-Api-Key', BITMOVIN_API_KEY);

    xhr.onload = function () {
        if (callback) {
            var bitmovinResponse = JSON.parse(this.responseText);
            var analyticsResponse = bitmovinResponse.data.result;
            callback(analyticsResponse);
        }
    };

    xhr.send();
}

function doQuery(queryFunction, query, callback) {
    var xhr = new XMLHttpRequest();
    var url = 'https://api.bitmovin.com/v1/analytics/queries/' + queryFunction;
    xhr.open('POST', url, true);

    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('X-Api-Key', BITMOVIN_API_KEY);

    xhr.onload = function () {
        if (callback) {
            var bitmovinResponse = JSON.parse(this.responseText);
            var analyticsResponse = bitmovinResponse.data.result;
            callback(analyticsResponse);
        }
    };

    xhr.send(JSON.stringify(query));
}

function initCurrentImpressionChart(divId) {
    currentImpressionChart = Highcharts.chart(divId, {
        title: {
            text: ''
        },
        yAxis: {
            title: {
                text: 'Bitrate'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'bitrate',
            data: []
        }]
    });
}

function scheduleAd(noAdSkipped) {
    var informationTableId = 'ad-information-table';
    appendRowToTable(informationTableId, createKeyValueTableRow('Ad Scheduled', noAdSkipped));

}

function appendRowToTable(tableId, row) {
    document.getElementById(tableId).getElementsByTagName('tbody')[0].appendChild(row);
}

function createKeyValueTableRow(key, value) {
    var row = document.createElement("tr");

    var keyCell = document.createElement("td");
    var keyCellText = document.createTextNode(key);
    keyCell.appendChild(keyCellText);
    row.appendChild(keyCell);

    var valueCell = document.createElement("td");
    var valueCellText = document.createTextNode(value);
    valueCell.appendChild(valueCellText);
    row.appendChild(valueCell);

    return row;
}