sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
function (Controller,JSONModel,BusyIndicator,MessageBox,Filter,FilterOperator) {
    "use strict";
    var that;
    return Controller.extend("com.ibs.bsv.ibsappbsvstockdetails.controller.ServicePage", {
        onInit: function () {
            that = this;
        }
    })
});
