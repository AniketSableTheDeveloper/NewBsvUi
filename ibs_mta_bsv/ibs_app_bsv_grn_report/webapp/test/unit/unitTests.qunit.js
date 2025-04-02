/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comibsbsv/ibs_app_bsv_grn_report/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
