sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
	"sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel",
    "com/ibs/bsv/ibsappbsvstockdetails/model/formatter",
    "sap/ui/export/library"
],
function (Controller,MessageBox,MessageToast,BusyIndicator,JSONModel,formatter,down,exportLibrary) {
    "use strict";
    var that,appId,appPath,appModulePath;
    return Controller.extend("com.ibs.bsv.ibsappbsvstockdetails.controller.View1", {
        onInit: function () {

            that = this;
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteView1");
            var getRoute = oRouter.getRoute("RouteView1");
            getRoute.attachMatched(that._onRouteMatched, this);

        },
        _onRouteMatched:function(){
            BusyIndicator.show(); 
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);
            var stockist = '101486';
            var url = appModulePath + "/odata/v4/ideal-bsv-grn-srv/StockData?$filter=STOCKIST_ID eq '"+stockist+"'";
            this.stockistData(url,"GET","StockSet");
        },
        stockistData:function(url,type,mName){
            $.ajax({
                url: url,
                type: type,
                contentType: 'application/json',
                dataType:'JSON',
                success: function (oData, response) {
                    
                    BusyIndicator.hide();
                    var oModel = new JSONModel(oData.value);
                    that.getView().setModel(oModel,mName);
                },
                error:function(error){
                    BusyIndicator.hide();
                    var oXMLMsg, oXML;
                    if (that.isValidJsonString(error.responseText)) {
                        oXML = JSON.parse(error.responseText);
                        oXMLMsg = oXML.error["message"];
                    } else {
                        oXMLMsg = error.responseText
                    }
                    MessageBox.error(oXMLMsg);
                }
            })
        },
        onSearch:function(){
            var data = that.getView().byId("oSearchData").getValue();
                if(data === '')
                {
                    that._onRouteMatched();
                }
                else{
                var aFilters = [];
                var oFilter = new sap.ui.model.Filter([
                new sap.ui.model.Filter("MATERIAL_CODE", sap.ui.model.FilterOperator.Contains, data),
                new sap.ui.model.Filter("MATERIAL_DESC", sap.ui.model.FilterOperator.Contains, data),
                ], false);
                aFilters.push(oFilter);  
                that.getView().byId("idStockTable").getBinding("items").filter(aFilters);
            }
        },
        onRefresh:function(){
            that.getView().byId("oSearchData").setValue("");
            that._onRouteMatched();
        },
        

onNavigateDashboard: function (oEvent) {
    // var param = {};
    var param = {};
    var oSemantic = "dashboard";
    var hash = {};
    var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
    var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
        target: {
            semanticObject: oSemantic,
            action: "display"
        }
        ,
        params: param
    })); // generate the Hash to display a Supplier
  
    //   var hash  = "#LedgerReport-Display?sap-ui-app-id-hint=saas_approuter_com.ibs.bsv.ibsappbsvcustomerledgerreport&";
    oCrossAppNavigator.toExternal({
        target: {
            shellHash: hash
        }
    });
  }
    });
});
