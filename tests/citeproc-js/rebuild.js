/*
 * Copyright (c) 2009-2013 Frank G. Bennett, Jr. All Rights
 * Reserved.
 *
 * The contents of this file are subject to the Common Public
 * Attribution License Version 1.0 (the “License”); you may not use
 * this file except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://bitbucket.org/fbennett/citeproc-js/src/tip/LICENSE.
 *
 * The License is based on the Mozilla Public License Version 1.1 but
 * Sections 1.13, 14 and 15 have been added to cover use of software over a
 * computer network and provide for limited attribution for the
 * Original Developer. In addition, Exhibit A has been modified to be
 * consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an “AS IS”
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is the citation formatting software known as
 * "citeproc-js" (an implementation of the Citation Style Language
 * [CSL]), including the original test fixtures and software located
 * under the ./tests subdirectory of the distribution archive.
 *
 * The Original Developer is not the Initial Developer and is
 * __________. If left blank, the Original Developer is the Initial
 * Developer.
 *
 * The Initial Developer of the Original Code is Frank G. Bennett,
 * Jr. All portions of the code written by Frank G. Bennett, Jr. are
 * Copyright (c) 2009-2013 Frank G. Bennett, Jr. All Rights Reserved.
 *
 * Alternatively, the contents of this file may be used under the
 * terms of the GNU Affero General Public License (the [AGPLv3]
 * License), in which case the provisions of [AGPLv3] License are
 * applicable instead of those above. If you wish to allow use of your
 * version of this file only under the terms of the [AGPLv3] License
 * and not to allow others to use your version of this file under the
 * CPAL, indicate your decision by deleting the provisions above and
 * replace them with the notice and other provisions required by the
 * [AGPLv3] License. If you do not delete the provisions above, a
 * recipient may use your version of this file under either the CPAL
 * or the [AGPLv3] License.”
 */

dojo.provide("citeproc_js.rebuild");

var mycsl = "<style>"
	  + "<citation disambiguate-add-givenname=\"true\">"
	  + "  <layout delimiter=\"; \" prefix=\"(\" suffix=\")\">"
	  + "    <names variable=\"author\">"
	  + "    <name form=\"short\" initialize-with=\". \"/>"
	  + "    </names>"
	  + "    <date variable=\"issued\" form=\"text\" date-parts=\"year\" prefix=\" \"/>"
	  + "  </layout>"
	  + "</citation>"
	  + "<bibliography>"
      + "  <sort>"
      + "    <key variable=\"author\"/>"
      + "  </sort>"
	  + "  <layout>"
	  + "    <names variable=\"author\">"
	  + "    <name form=\"short\" initialize-with=\". \"/>"
	  + "    </names>"
	  + "    <date variable=\"issued\" form=\"text\" date-parts=\"year\" prefix=\" \"/>"
	  + "  </layout>"
	  + "</bibliography>"
	+ "</style>";


var ITEM1 = {
	"id": 1,
	"type": "book",
	"author": [
		{
			"family": "Doe",
			"given": "John"
		},
		{
			"family": "Roe",
			"given": "Jane"
		}
	]
};

var ITEM2 = {
	"id": 2,
	"type": "book",
	"author": [
		{
			"family": "Doe",
			"given": "John"
		},
		{
			"family": "Roe",
			"given": "Richard"
		}
	]
};

var ITEM3 = {
	"id": 3,
	"type": "book",
	"author": [
		{
			"family": "Wallbanger",
			"given": "Harvey"
		},
		{
			"family": "Smith",
			"given": "Horatio"
		}
	],
	"issued": {
		"date-parts": [
			[
				1999
			]
		]
	}
};


var CITATION1 = {
	"citationID": "CITATION-1",
	"citationItems": [
		{
			"id": 1
		}
	],
	"properties": {
		"index": 0,
		"noteIndex": 1
	}
};

var CITATION2 = {
	"citationID": "CITATION-2",
	"citationItems": [
		{
			"id": 2
		}
	],
	"properties": {
		"index": 1,
		"noteIndex": 3
	}
};

var CITATION4 = {
	"citationID": "CITATION-4",
	"citationItems": [
		{
			"id": 3
		}
	],
	"properties": {
		"index": 2,
		"noteIndex": 4
	}
};



doh.register("citeproc_js.rebuild", [
	function testRebuild() {
		var sys = new RhinoTest([ITEM1,ITEM2,ITEM3]);
        var citations = [CITATION1,CITATION2,CITATION4];
		var style = new CSL.Engine(sys,mycsl);
		var res = style.rebuildProcessorState(citations, "html");
        // First citation
		doh.assertEqual("CITATION-1", res[0][0]);
		doh.assertEqual("1", res[0][1]);
		doh.assertEqual("(Doe, J. Roe)", res[0][2]);
        // Second citation
		doh.assertEqual("CITATION-2", res[1][0]);
		doh.assertEqual("3", res[1][1]);
		doh.assertEqual("(Doe, R. Roe)", res[1][2]);
        // Third citation
		doh.assertEqual("CITATION-4", res[2][0]);
		doh.assertEqual("4", res[2][1]);
		doh.assertEqual("(Wallbanger, Smith 1999)", res[2][2]);
	},
	function testRebuildCitationsWithUncitedItems() {
		var sys = new RhinoTest([ITEM1,ITEM2,ITEM3]);
        var citations = [CITATION1,CITATION4];
        var uncitedItemIDs = {}
        uncitedItemIDs[ITEM2.id] = true;
		var style = new CSL.Engine(sys,mycsl);
		var res = style.rebuildProcessorState(citations, "html", uncitedItemIDs);
        // First citation
		doh.assertEqual("CITATION-1", res[0][0]);
		doh.assertEqual("1", res[0][1]);
		doh.assertEqual("(Doe, J. Roe)", res[0][2]);
        // Second citation
		doh.assertEqual("CITATION-4", res[1][0]);
		doh.assertEqual("4", res[1][1]);
		doh.assertEqual("(Wallbanger, Smith 1999)", res[1][2]);
	},
	function testRebuildBibliographyWithUncitedItems() {
		var sys = new RhinoTest([ITEM1,ITEM2,ITEM3]);
        var citations = [CITATION1,CITATION4];
        var uncitedItemIDs = {}
        uncitedItemIDs[ITEM2.id] = true;
		var style = new CSL.Engine(sys,mycsl);
		style.rebuildProcessorState(citations, "html",uncitedItemIDs);
        var bib = style.makeBibliography();

        // bib count
        doh.assertEqual(3, bib[1].length)
        // First entry
        var bibzero = bib[1][0].replace(/^\s*(.*?)\s*$/,"$1")
		doh.assertEqual("<div class=\"csl-entry\">Doe, J. Roe</div>", bibzero);

        var bibone = bib[1][1].replace(/^\s*(.*?)\s*$/,"$1")
		doh.assertEqual("<div class=\"csl-entry\">Doe, R. Roe</div>", bibone);

        var bibtwo = bib[1][2].replace(/^\s*(.*?)\s*$/,"$1")
		doh.assertEqual("<div class=\"csl-entry\">Wallbanger, Smith 1999</div>", bibtwo);
	}
]);
