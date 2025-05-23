sap.ui.define(
  [
      "sap/ui/core/mvc/Controller"
  ],
    function(BaseController) {
      "use strict";
      var that;
      return BaseController.extend("com.ibs.bsv.ibsappbsvgrn.controller.App", {
        onInit: function() {
          that = this;
          var oRouter = this.getOwnerComponent().getRouter().getRoute("RouteApp");
          // oRouter.attachPatternMatched(that.handleRouteMatched, this);
          this.handleRouteMatched();
        },
        getRouter: function () {
          return sap.ui.core.UIComponent.getRouterFor(this);
        },
        handleRouteMatched: function (oEvent) {
          var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          var appModulePath = jQuery.sap.getModulePath(appPath);
          var oCloud = true;
          var oPremise = true;
          var url = appModulePath + "/odata/v4/ideal-bsv-additional-srv/checkServiceAvailability(cloudSrv=" + oCloud + ",onPremiseSrv=" + oPremise + ")";
          
          $.ajax({
            url: url,
            type: 'GET',
            contentType: 'application/json',
            success: function (data, response) {
              
              if(oCloud === true && oPremise === true && data.value[0].cloudSrv !== null) {
                that.getRouter().navTo("RouteView1");
              }
              else if(oCloud === true && oPremise === false && data.value[0].cloudSrv !== null) {
                that.getRouter().navTo("RouteView1");
              }
              else if(oCloud === false && oPremise === true) {
                that.getRouter().navTo("RouteView1");
              }
              else {
                that.getRouter().navTo("ServicePage");
              }
            },
            error: function (oError) {
              that.getRouter().navTo("ServicePage");
          }
          });
        }
      });
    }
  );
  