//import test from 'ava';

import assert from 'assert';

import c2Utilities from '../../../src/renderer/components/scripts/c2Utilities';

describe('xml addon parsing', async () => {
    let addon = await c2Utilities.getAddonInfosFromXml(`
    <c2addon>
        <type>plugin</type>
        <name>Greenworks</name>
        <version>1.0.26.6</version>
        <author>Scirra</author>
        <website>https://www.construct.net</website>
        <documentation>https://www.construct.net</documentation>
        <description>Greenworks plugin for NW.js Steam integration</description>
    </c2addon>
    `);

    it('should match type', (() => {
        assert.equal(addon['type'], 'plugin');
    }));
    it('should match name', (() => {
        assert.equal(addon['name'], 'Greenworks');
    }));
    it('should match version', (() => {
        assert.equal(addon['version'], '1.0.26.6');
    }));
    it('should match author', (() => {
        assert.equal(addon['author'], 'Scirra');
    }));
    it('should match website', (() => {
        assert.equal(addon['website'], 'https://www.construct.net');
    }));
    it('should match documentation', (() => {
        assert.equal(addon['documentation'], 'https://www.construct.net');
    }));
    it('should match description', (() => {
        assert.equal(addon['description'], 'Greenworks plugin for NW.js Steam integration');
    }));
});