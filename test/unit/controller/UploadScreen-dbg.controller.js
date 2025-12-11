/*global QUnit*/

sap.ui.define([
	"downtimeconf/controller/UploadScreen.controller"
], function (Controller) {
	"use strict";

	QUnit.module("UploadScreen Controller");

	QUnit.test("I should test the UploadScreen controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
