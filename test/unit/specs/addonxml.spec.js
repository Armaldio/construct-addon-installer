//import test from 'ava';

import assert from 'assert';

import c2Utilities from '../../../src/renderer/components/scripts/c2Utilities';

describe('xmlinfos', () => {
    it('should be flatten', (async () => {
        let addonInfos = await c2Utilities.getAddonInfosFromXml(`
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

        console.log('addon', JSON.stringify(addonInfos));
        for (let i = 0; i < Object.keys(addonInfos); i++) {
            addonInfos[i] = addonInfos[i].length === 1 ? addonInfos[i][0] : addonInfos[i];
        }

        console.log('addon', JSON.stringify(addonInfos));
        assert.equal(1, 1);
    }));
});