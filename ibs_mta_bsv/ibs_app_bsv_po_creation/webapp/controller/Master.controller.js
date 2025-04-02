sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "com/ibs/bsv/ibsappbsvpocreation/model/formatter",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (Controller, JSONModel, MessageBox, BusyIndicator, formatter, exportLibrary, Spreadsheet, Sorter, Filter, FilterOperator) {
        "use strict";
        var that;
        var EdmType = exportLibrary.EdmType;
        var localmodel, oProductModel;
        var url;
        // var EdmType = library.EdmType;
        var aFilter
        var appModulePath, appId, appPath
        var sValue
        var StockistId;
        var stockist
        var sapModel

        return Controller.extend("com.ibs.bsv.ibsappbsvpocreation.controller.Master", {
            formatter: formatter,
            onInit: function () {

                that = this;

                sapModel = that.getOwnerComponent().getModel("ZIDEAL_ODATA_SALESORDER_SRV");


                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteMaster").attachPatternMatched(this._onRouteMatched, this);
            },




            _onRouteMatched: function (oEvent) {

                appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                appPath = appId.replaceAll(".", "/");
                appModulePath = jQuery.sap.getModulePath(appPath);

                var table = that.getView().byId("idPurchTable");
                table.rebindTable();

                that.StockistData();
                that.readCredit();
                // that.getView().byId("idItemsTable").removeSelections(true);

                // var id = oEvent.getParameter('arguments').loginId;
                var CustomerCode = 101486;

                var g = this.getView().getParent().getParent();
                g.toBeginColumnPage(this.getView());

                // appModulePath = jQuery.sap.getModulePath(appPath);

            },

            StockistData: function () {

                var url1 = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/getStockistData(sAction='MASTER',sStockistId=101486)";
                //    var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                //     var appPath = appId.replaceAll(".", "/");
                //     appModulePath = jQuery.sap.getModulePath(appPath);

                // var url = appModulePath + "/odata/v2/ideal-bsv-scheme-srv/getStockistData?sAction='MASTER'&sStockistId=101486";             
                // var url = "https://ibs-portal-dev-ibs-portal-dev-ideal-bsv-srv.cfapps.us10.hana.ondemand.com/odata/v2/ideal-bsv-scheme-srv/getStockistData?sAction='MASTER'&sStockistId=101486";             
                // var url = "https://port8085-workspaces-ws-zz4wp.us10.applicationstudio.cloud.sap/odata/v2/ideal-bsv-scheme-srv/getStockistData?sAction='MASTER'&sStockistId=101486";             
                $.ajax({
                    type: 'GET',
                    url: url1,
                    contentType: "application/json; charset=utf-8",
                    success: function (data, responce) {
                        // 
                        BusyIndicator.hide();
                        var count = data.value;
                        // var count = data.d.getStockistData;
                        that.getView().byId("idcount").setValue(count);

                    },
                    error: function (e) {
                        //
                        BusyIndicator.hide();
                        MessageBox.error(e.responseText);
                    }
                });
            },
            onBeforeRebindTable: function (oEvent) {
                var stockistID = "101486";
                var oBindingParams = oEvent.getParameter("bindingParams");

                // Expand TO_STATUS relationship
                oBindingParams.parameters["expand"] = "TO_STATUS";

                // Clear existing filters
                oBindingParams.filters = [];

                // Filter by STOCKIST_ID
                var oFilterStockist = new sap.ui.model.Filter("STOCKIST_ID", sap.ui.model.FilterOperator.EQ, stockistID);
                oBindingParams.filters.push(oFilterStockist);

                // Retrieve and apply SmartFilterBar filters (including STATUS)
                var oSmartFilterBar = this.byId("idPrHeaderSmart");
                var aFilters = oSmartFilterBar.getFilters();
                if (aFilters && aFilters.length > 0) {
                    oBindingParams.filters = oBindingParams.filters.concat(aFilters);
                }

                // Apply sorting by PURCHASE_REQUEST_NO
                oBindingParams.sorter = [new sap.ui.model.Sorter({
                    path: "PURCHASE_REQUEST_NO",
                    descending: true
                })];
            },


            // onBeforeRebindTable: function(oEvent) {
            //     ;
            //     var stockistID = "101486";
            //     var oBindingParams = oEvent.getParameter("bindingParams");
            //     oBindingParams.parameters["expand"] = "TO_STATUS";
            //     // oBindingParams.parameters["filter"] = "stockist";
            //     oBindingParams.filters = [];
            //     var mg = '*';
            //     var oFilter = new sap.ui.model.Filter("STOCKIST_ID", FilterOperator.EQ, stockistID);
            //     oBindingParams.filters.push(oFilter);



            //     var statuscode;
            //     var oFilter;


            //     oBindingParams.sorter = [new sap.ui.model.Sorter({ path: "PURCHASE_REQUEST_NO", descending: true })];
            // },





            onNavigateToDetails(oEvent) {

                this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
                var iPrNo = oEvent.getSource().getBindingContext().getObject().PURCHASE_REQUEST_NO;
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("Detail", {
                    "PURCHASE_REQUEST_NO": iPrNo
                });
            },
            onFilterSelect: function (oEvent) {


            },
            orderCreate: function () {
                BusyIndicator.show();
                var StockistId = "101486"; // hardcoded customer code
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("RequestCreation", {

                    "Stockist": StockistId
                });
            },
            onClickScheme: function () {
                // 
                // this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
                this.StockistDataNavi();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("Scheme");

            },
            StockistDataNavi: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);

                var url = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/getStockistData(sAction='SCHEME',sStockistId=101486)";
                $.ajax({
                    url: url,
                    type: 'GET',
                    // data: null,
                    contentType: 'application/json',
                    success: function (data, responce) {
                        // 
                        BusyIndicator.hide();
                        // var count = data.value;

                    },
                    error: function (e) {
                        //
                        BusyIndicator.hide();
                        MessageBox.error(e.responseText);
                    }
                });
            },
            
            readCredit: function () {
                BusyIndicator.show(0);
                var stockist = "101486"
                var aFilters = new Filter("StockistId", "EQ", stockist);
                sapModel.read("/STOCKISTCREDITDETAILSSet", {
                    filters: [aFilters],
                    success: function (Data, response) {
                        BusyIndicator.hide();
                        var model = new JSONModel(Data.results[0]);
                        that.getView().setModel(model, "creditdetails");
                    },
                    error: function (Error) {
                        BusyIndicator.hide();
                        MessageBox.error(Error.responseText);
                    }
                });
            },

            onBeforeExport: function (oEvent) {
                var oExportSettings = oEvent.getParameter("exportSettings");
                var aColumns = oExportSettings.workbook.columns;
                var iDocDateColumnIndex = aColumns.findIndex(function (oColumn) {
                    return oColumn.property === "CREATION_DATE";
                });
                if (iDocDateColumnIndex === 2) {
                    aColumns[iDocDateColumnIndex] = {
                        label: 'Creation Date',
                        type: EdmType.Date,
                        property: 'CREATION_DATE',
                        textAlign: 'Center',
                        format: 'dd/mm/yyyy'
                    }
                }
            }
        });
    });
