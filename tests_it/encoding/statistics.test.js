import assert from 'assert';
import {getConfiguration} from '../utils';
import {getFirstDayOfTheWeekFromDate, dateToApiRequestString} from '../../bitmovin/utils/DateUtils'

import statistics from '../../bitmovin/encoding/statistics';

const testConfiguration = getConfiguration();

describe('[Statistics]', () => {

  let statisticsClient = statistics(testConfiguration);

  it('should return an overall statistics object', (done) => {
    statisticsClient.overall().then((response) => {
      assert(response.bytesEncodedTotal !== null && response.bytesEncodedTotal !== undefined);
      assert(response.timeEncodedTotal !== null && response.timeEncodedTotal !== undefined);
      done();
    }).catch((error) => {
      done(new Error(error));
    });
  });

  it('should return vod statistics', (done) => {
    statisticsClient.vod.list().then((response) => {
      assert(response !== undefined && response !== null);
      assert(response.next !== undefined && response.next !== null);
      assert(response.previous !== undefined && response.previous !== null);
      done();
    }).catch((error) => {
      done(new Error(error));
    });
  });

  it('should return vod statistics with limit offset', (done) => {
    statisticsClient.vod.list(10, 5).then((response) => {
      assert(response !== undefined && response !== null);
      assert(response.next !== undefined && response.next !== null);
      assert(response.previous !== undefined && response.previous !== null);
      done();
    }).catch((error) => {
      done(new Error(error));
    });
  });

  it('should return vod statistics within specific dates', (done) => {
    const from = dateToApiRequestString(getFirstDayOfTheWeekFromDate());
    const to = dateToApiRequestString(new Date());

    statisticsClient.vod.list({from, to}, 10, 5).then((response) => {
      assert(response !== undefined && response !== null);
      assert(response.next !== undefined && response.next !== null);
      assert(response.previous !== undefined && response.previous !== null);
      done();
    }).catch((error) => {
      done(new Error(error));
    });
  });

  it('should return error because of wrong time format for vod statistics within specific dates', (done) => {
    const from = dateToApiRequestString(getFirstDayOfTheWeekFromDate());
    const to = new Date();

    statisticsClient.vod.list({from, to}, 10, 5).then((response) => {
      done(new Error('Should not be reached'));
    }).catch((error) => {
      done();
    });
  });

  it('should return live statistics', (done) => {
    statisticsClient.live.list().then((response) => {
      assert(response !== undefined && response !== null);
      assert(response.next !== undefined && response.next !== null);
      assert(response.previous !== undefined && response.previous !== null);
      done();
    }).catch((error) => {
      done(new Error(error));
    });
  });

  it('should return live statistics with limit offset', (done) => {
    statisticsClient.live.list(10, 5).then((response) => {
      assert(response !== undefined && response !== null);
      assert(response.next !== undefined && response.next !== null);
      assert(response.previous !== undefined && response.previous !== null);
      done();
    }).catch((error) => {
      done(new Error(error));
    });
  });

  it('should return live statistics within specific dates', (done) => {
    const from = dateToApiRequestString(getFirstDayOfTheWeekFromDate());
    const to = dateToApiRequestString(new Date());

    statisticsClient.live.list({from, to}, 10, 5).then((response) => {
      assert(response !== undefined && response !== null);
      assert(response.next !== undefined && response.next !== null);
      assert(response.previous !== undefined && response.previous !== null);
      done();
    }).catch((error) => {
      done(new Error(error));
    });
  });

  it('should return error because of wrong time format for live statistics for specific dates', (done) => {
    const from = dateToApiRequestString(getFirstDayOfTheWeekFromDate());
    const to = new Date();

    statisticsClient.live.list({from, to}, 10, 5).then((response) => {
      done(new Error('Should not be reached'));
    }).catch((error) => {
      done();
    });
  });

});
