sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime info for the device the UI5 app is running on as JSONModel
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },
        headerModel:function()
        {
            var localObject ={
                "local":"a"
            }
            var omodel = new JSONModel(localObject);
            return omodel;
        },
        lineitemModel:function()
        {
            var lineObject ={
                "local":"a"
            }
            var omodel = new JSONModel(lineObject);
            return omodel;
        },
        EventsmModel:function()
        {
            var eventsobject ={
                "local":"a"
            }
            var omodel = new JSONModel(eventsobject);
            return omodel;
        },

        PropertyModel:function()
        {
            var object ={
                "local":"a"
            }
            var omodel = new JSONModel(object);
            return omodel;
        } 
    };

});