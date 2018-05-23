import assert from 'assert';

import {getConfiguration} from '../utils';
import manifests from '../../bitmovin/encoding/manifests/hls/hlsManifests';
import outputs from '../../bitmovin/encoding/outputs';

let testConfiguration = getConfiguration();

const sampleManifest = {
  name        : 'Sample HLS Manifest',
  description : 'bitmovin-javascript sample hls manifest hlsManifests.test.js',
  manifestName: 'bitmovin-javascript-dash-manifest.m3u8',
  outputs     : []
};

describe('[HLS Manifests]', () => {

  let manifestsClient = manifests(testConfiguration);
  let outputsClient   = outputs(testConfiguration);

  const createOutput = () => {
    let sampleS3Output = {
      name       : 'Sample S3 Output - Bitmovin Javascript',
      description: 'Bitmovin Javascript hlsManifests.test.js',
      accessKey  : 'AKIAIOSFODNN7INVALID',
      secretKey  : 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYINVALIDKEY',
      bucketName : 'printtheworld',
      cloudRegion: 'SA_EAST_1',
      customData : {
        myList: ['a', 'b', 'c', 'd'],
        myInt : 1234
      }
    };

    return outputsClient.s3.create(sampleS3Output);
  };

  const getSampleOutput = (outputId) => {
    return {
      outputId  : outputId,
      outputPath: 'path/to/file/destination',
      acl       : [
        {
          scope     : 'string',
          permission: 'PUBLIC_READ'
        }
      ]
    };
  };

  it('should create a hls manifest', (done) => {
    let createdOutput = undefined;

    createOutput().then((output) => {
      createdOutput          = getSampleOutput(output.id);
      sampleManifest.outputs = [createdOutput];
      return manifestsClient.create(sampleManifest);
    }).then((manifest) => {
      assert((manifest.id !== null) && manifest.id !== undefined && manifest.id !== '');
      compareManifests(manifest, sampleManifest);
      done();
    }).catch((error) => {
      done(new Error(error));
    })
  });

  it('should return a list of hls manifests', (done) => {
    manifestsClient.list(5).then((response) => {
      assert((response.totalCount !== null) && response.totalCount !== undefined);
      assert((response.items !== null) && response.items !== undefined);
      done();
    }).catch((error) => {
      done(new Error(error));
    });
  });

  it('should return hls manifest details', (done) => {
    let createdOutput = undefined;

    createOutput().then((output) => {
      createdOutput          = getSampleOutput(output.id);
      sampleManifest.outputs = [createdOutput];
      return manifestsClient.create(sampleManifest);
    }).then((manifest) => {
      assert((manifest.id !== null) && manifest.id !== undefined && manifest.id !== '');
      compareManifests(manifest, sampleManifest);
      return manifestsClient(manifest.id).details();
    }).then((details) => {
      compareManifests(details, sampleManifest);
      done();
    }).catch((error) => {
      done(new Error(error));
    })
  });

  it('should delete a hls manifest', (done) => {
    let createdOutput   = undefined;
    let createdManifest = undefined;

    createOutput().then((output) => {
      createdOutput          = getSampleOutput(output.id);
      sampleManifest.outputs = [createdOutput];
      return manifestsClient.create(sampleManifest);
    }).then((manifest) => {
      createdManifest = manifest;
      assert((manifest.id !== null) && manifest.id !== undefined && manifest.id !== '');
      compareManifests(manifest, sampleManifest);
      return manifestsClient(manifest.id).delete();
    }).then((response) => {
      assert.equal(response.id, createdManifest.id);
      done();
    }).catch((error) => {
      done(new Error(error));
    })
  });

  it('should start a hls manifest creation', (done) => {
    let createdOutput   = undefined;
    let createdManifest = undefined;

    createOutput().then((output) => {
      createdOutput          = getSampleOutput(output.id);
      sampleManifest.outputs = [createdOutput];
      return manifestsClient.create(sampleManifest);
    }).then((manifest) => {
      createdManifest = manifest;
      assert((manifest.id !== null) && manifest.id !== undefined && manifest.id !== '');
      compareManifests(manifest, sampleManifest);
      return manifestsClient(manifest.id).start();
    }).then((response) => {
      assert.equal(response.id, createdManifest.id);
      done();
    }).catch((error) => {
      done(new Error(error));
    })
  });

  // TODO: weird behavior when stopping creation right after starting it... needs to be investigated
  it.skip('should stop a hls manifest creation', (done) => {
    let createdOutput   = undefined;
    let createdManifest = undefined;

    createOutput().then((output) => {
      createdOutput          = getSampleOutput(output.id);
      sampleManifest.outputs = [createdOutput];
      return manifestsClient.create(sampleManifest);
    }).then((manifest) => {
      createdManifest = manifest;
      assert((manifest.id !== null) && manifest.id !== undefined && manifest.id !== '');
      compareManifests(manifest, sampleManifest);
      return manifestsClient(manifest.id).start();
    }).then((response) => {
      return manifestsClient(response.id).stop();
    }).then((response) => {
      assert.equal(response.id, createdManifest.id);
      done();
    }).catch((error) => {
      done(new Error(error));
    })
  });

  it.skip('should retrieve hls manifest creation status', (done) => {
    let createdOutput   = undefined;
    let createdManifest = undefined;

    createOutput().then((output) => {
      createdOutput          = getSampleOutput(output.id);
      sampleManifest.outputs = [createdOutput];
      return manifestsClient.create(sampleManifest);
    }).then((manifest) => {
      createdManifest = manifest;
      assert((manifest.id !== null) && manifest.id !== undefined && manifest.id !== '');
      compareManifests(manifest, sampleManifest);
      return manifestsClient(manifest.id).start();
    }).then((response) => {
      return manifestsClient(response.id).status();
    }).then((response) => {
      assert.equal(response.id, createdManifest.id);
      done();
    }).catch((error) => {
      done(new Error(error));
    })
  });

  const compareManifests = (manifestOne, manifestTwo) => {
    assert.equal(manifestOne.name, manifestTwo.name);
    assert.equal(manifestOne.description, manifestTwo.description);
    assert.equal(manifestOne.manifestName, manifestTwo.manifestName);
    // TODO: Hack: MRS does not return ACL object inside created manifest output's object
    manifestOne.outputs.forEach((output) => {
      output.acl = undefined;
    });
    manifestTwo.outputs.forEach((output) => {
      output.acl = undefined;
    });
    // END TODO (Hack)
    assert.deepEqual(manifestOne.outputs, manifestTwo.outputs);
  };
});
