/*global QUnit*/

sap.ui.define([
	"comibsbsv/ibs_app_bsv_orderhistory/controller/Master.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Master Controller");

	QUnit.test("I should test the Master controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
