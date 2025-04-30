sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], (BaseController,JSONModel) => {
  "use strict";
  var that;
  return BaseController.extend("com.ibs.bsv.ibsappbsvsalesorderreport.controller.App", {
      onInit() {
        that = this;
        var oViewModel = new JSONModel({
          layout: "OneColumn",
          previousLayout: "",
          actionButtonsInfo: {
            midColumn: {
              fullScreen: false
            }
          }
        });
        this.getView().setModel(oViewModel, "appView");
      }
  });
});