/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/ibs/bsv/ibsappbsvdashboard/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("com.ibs.bsv.ibsappbsvdashboard.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                var oRootPath = jQuery.sap.getModulePath("com.ibs.bsv.ibsappbsvdashboard");
		
                var oImageModel = new sap.ui.model.json.JSONModel({
	            path : oRootPath,
                    });
		
                this.setModel(oImageModel, "imageModel");

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                // set the Property model
                this.setModel(models.propertyModel(), "PropertyModel");
            }
        });
    }
);