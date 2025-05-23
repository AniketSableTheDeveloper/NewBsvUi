sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/ibs/bsv/ibsappbsvsalesorderreport/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet'
], (Controller,Filter, FilterOperator, formatter, JSONModel, BusyIndicator, MessageBox, exportLibrary, Spreadsheet) => {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    var that;
    var sapModel;
    var login_ID;
    var PropertyModel
    var UserData
    var isoString;
    var Role;
    var aSelectedObjects;
    return Controller.extend("com.ibs.bsv.ibsappbsvsalesorderreport.controller.View1", {
        formatter: formatter,
        onInit() {
            that = this;
            that.checkDevice();
            // sapModel = that.getOwnerComponent().getModel("ZIDEAL_ODATA_SALESORDER_SRV");
            PropertyModel = that.getOwnerComponent().getModel("PropertyModel");
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteView1").attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched:function(){
            that._userdetails();
            var g = this.getView().getParent().getParent();
            g.toBeginColumnPage(this.getView());
        },
        checkDevice: function () {
            if (sap.ui.Device.system.phone === true) {
                that.getView().byId("idSalesOrderCount").setVisible(false);   
            }
            else if (sap.ui.Device.system.tablet === true) {
                that.getView().byId("idSalesOrderCount").setVisible(true);
            }
            else if (sap.ui.Device.system.desktop === true) {
                that.getView().byId("idSalesOrderCount").setVisible(true);
            }
        },
        _userdetails: function () {
            var attr;
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            // login_ID = "W001";
            // that.readUserMasterEntities(login_ID)
            // that.readStockist(login_ID)
    // that.readAddress(login_ID)
           
            attr = appModulePath + "/user-api/attributes";
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: attr,
                    type: 'GET',
                    contentType: 'application/json',
                    success: function (data, response) {
                        debugger
                        login_ID = data.name
                        UserData = data
                        that.readUserMasterEntities(login_ID)
                        that.readStockist(login_ID)
            // that.readAddress(login_ID)
                        that.readgetUserAttributes();
                    },
                    error: function (oError) {
                        MessageBox.error("Error while reading User Attributes");
                    }
                });
            });
        },
        onBeforeRebindTable: function (oEvent) {
            //;
            var Ship_From = login_ID;
            var oBindingParams = oEvent.getParameter("bindingParams");

            // Expand relation for TO_STATUS
            oBindingParams.parameters["expand"] = "TO_STATUS";

            // Clear existing filters
            oBindingParams.filters = [];

            // Add filter for SHIP_FROM
            var oFilterShipFrom = new sap.ui.model.Filter("SHIP_FROM", sap.ui.model.FilterOperator.EQ, Ship_From);
            oBindingParams.filters.push(oFilterShipFrom);

            // Add filter for STATUS
            var oFilterStatus = new sap.ui.model.Filter("STATUS", sap.ui.model.FilterOperator.EQ, 1);
            oBindingParams.filters.push(oFilterStatus);

            // Get the filter values from the SmartFilterBar
            var oSmartFilterBar = this.byId("idPrHeaderSmart");
            var aFilters = oSmartFilterBar.getFilters();
            if (aFilters && aFilters.length > 0) {
                // Combine the SmartFilterBar filters with the existing filters
                oBindingParams.filters = oBindingParams.filters.concat(aFilters);
            }
            // Extract the date filter for CREATION_DATE from the SmartFilterBar
            var oCreationDateFilter = oSmartFilterBar.getFilterData()["CREATION_DATE"];
            if (oCreationDateFilter) {
                var oDateFilter = new sap.ui.model.Filter({
                    path: "CREATION_DATE",
                    operator: sap.ui.model.FilterOperator.BT,  // Between operator
                    value1: oCreationDateFilter.conditionTypeInfo.data.value1.toISOString(),  // Start date
                    value2: oCreationDateFilter.conditionTypeInfo.data.value2.toISOString()  // End date
                });
                oBindingParams.filters.push(oDateFilter);
            }
            // Apply sorter for PURCHASE_REQUEST_NO
            oBindingParams.sorter = [new sap.ui.model.Sorter({
                path: "PURCHASE_REQUEST_NO",
                descending: true
            })];
        },
        readAddress: function (login_ID) {
            // BusyIndicator.show(0);
            // var ShipTo = "101486"
            // var shipFrom = "W001"
            // var filter = new Filter("ShipTo","EQ",ShipTo);
            var filter2 = new Filter("ShipFrom", "EQ", login_ID);
            sapModel.read("/ADDRESSSet", {
                filters: [filter2],
                success: function (Data, response) {
                    // BusyIndicator.hide();
                    var model = new JSONModel(Data.results[0]);
                    that.getView().setModel(model, "address");
                },
                error: function (Error) {
                    // BusyIndicator.hide();
                    MessageBox.error(Error.responseText);
                }

            });
        },
        onNavigateToDetails(oEvent) {
            this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            var iPrNo = oEvent.getSource().getBindingContext("stockistDetails").getObject().PURCHASE_REQUEST_NO;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
            oRouter.navTo("Detail", {
                "PURCHASE_REQUEST_NO": iPrNo
            });
        },
        isValidJsonString: function (sDataString) {
            var value = null;
            var oArrObj = null;
            var sErrorMessage = "";
            try {
                if (sDataString === null || sDataString === "" || sDataString === undefined) {
                    throw "No data found.";
                }
                value = JSON.parse(sDataString);
                if (toString.call(value) === '[object Object]' && Object.keys(value).length > 0) {
                    return true;
                } else {
                    throw "Error";
                }
            } catch (errorMsg) {
                if (errorMsg === "No data found.") {
                    sErrorMessage = errorMsg;
                } else {
                    sErrorMessage = "Invalid JSON data."
                }
                return false;
            }
            return true;
        },
        readUserMasterEntities: function (login_ID) {
            BusyIndicator.show(0);
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            // login_ID = "E001";
            var url = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/PrHeader?$expand=TO_STATUS,TO_ITEMS,TO_EVENT&$filter=(SHIP_FROM eq '" + login_ID + "')";
            $.ajax({
                url: url,
                type: 'GET',
                data: null,
                contentType: 'application/json',
                success: function (data, responce) {
                    BusyIndicator.hide();
                    var model = new JSONModel(data.d.results);
                    that.getView().setModel(model, "stockistDetails");
                    var count = data.d.results.length;
                    PropertyModel.setProperty("/count", "Total Sales Order (" + count + ")");
                },
                error: function (e) {
                    //
                    BusyIndicator.hide();
                    MessageBox.error(e.responseText);
                }
            });
        },
        readgetUserAttributes: function () {
            BusyIndicator.show(0);
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            var url = appModulePath + "/odata/v2/ideal-bsv-additional-srv/getUserAttributes";
            $.ajax({
                url: url,
                type: 'GET',
                data: null,
                contentType: 'application/json',
                success: function (data, response) {
                    var model = new JSONModel(data.d.results);
                    for(var i =0; i<data.d.results.length; i++){
                        if(data.d.results[i] === "BSV_CFA"){
                            Role = "CFA";
                        }
                    }
                    BusyIndicator.hide();
                },
                error: function (e) {
                    BusyIndicator.hide();
                    MessageBox.error(e.responseText);
                }
            });
        },
        readStockist: function (login_ID) {
            BusyIndicator.show(0);
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            // login_ID = "E001";
            var url = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/CfaWiseStockistData?$filter=SHIP_FROM eq '" + login_ID + "'";
            $.ajax({
                url: url,
                type: 'GET',
                data: null,
                contentType: 'application/json',
                success: function (data, responce) {
                    BusyIndicator.hide();
                    var model = new JSONModel(data.d.results);
                    that.getView().setModel(model, "stockist");
                },
                error: function (e) {
                    //
                    BusyIndicator.hide();
                    MessageBox.error(e.responseText);
                }
            });
        },
        onSearchField: function (oEvent) {
            // Get the search query from the search field
            var sQuery = oEvent.getSource().getValue();

            // Reference the order table
            var oTable = this.getView().byId("idOrderTable");

            // Define the filter array
            var aFilters = [];

            // Check if there is a search query
            if (sQuery) {
                // Create a filter for the PURCHASE_REQUEST_NO column
                var oFilter = new sap.ui.model.Filter("PURCHASE_REQUEST_NO", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(oFilter);
            }

            // Apply the filters to the binding of the table
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);

            // Get the filtered data count and update the PropertyModel
            var iCount = oBinding.getLength(); // Get the count of filtered items
            var oPropertyModel = this.getView().getModel("PropertyModel");
            oPropertyModel.setProperty("/count", "Total Sales Order (" + iCount + ")");
        },
        onSearch: function () {
            // Get reference to the DateRangeSelection control and ComboBox
            var oDateRangeSelection = this.byId("idDateRangeSelection");
            var oStockistComboBox = this.byId("idStockistCombo");

            // Get the start and end date values
            var oStartDate = oDateRangeSelection.getDateValue(); // Start date
            var oEndDate = oDateRangeSelection.getSecondDateValue(); // End date

            // Get the selected Stockist ID from ComboBox
            // var sSelectedStockistID = oStockistComboBox.getSelectedKey();
            // var sSelectedStockistID = oStockistComboBox.getSelectedItem().mProperties.text;

            // Array to hold filters
            var aFilters = [];
            // Check if both dates are selected
            if (oStartDate && oEndDate) {
                // Convert the dates to Unix timestamp format to match backend date format
                var iStartDateTimestamp = oStartDate.getTime();
                var iEndDateTimestamp = oEndDate.getTime();
                // Create a filter for CREATION_DATE between start and end timestamps
                var oDateFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("CREATION_DATE", sap.ui.model.FilterOperator.GE, "/Date(" + iStartDateTimestamp + "+0000)/"),
                        new sap.ui.model.Filter("CREATION_DATE", sap.ui.model.FilterOperator.LE, "/Date(" + iEndDateTimestamp + "+0000)/")
                    ],
                    and: true
                });
                // Add the date filter to the filters array
                aFilters.push(oDateFilter);
            }
            else
            {
            var sSelectedStockistID = oStockistComboBox.getSelectedItem().mProperties.text;
            // Check if a Stockist is selected and add the STOCKIST_ID filter
            if (sSelectedStockistID) {
                var oStockistFilter = new sap.ui.model.Filter("STOCKIST_NAME", sap.ui.model.FilterOperator.EQ, sSelectedStockistID);
                aFilters.push(oStockistFilter);
            }
            }   
            // Get reference to the table and apply the filters
            var oTable = this.byId("idOrderTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
            // Get the updated count of visible items after filtering
            var iVisibleItemCount = oBinding.getLength();
            // Update the PropertyModel with the latest count
            var oPropertyModel = this.getView().getModel("PropertyModel");
            oPropertyModel.setProperty("/count", "Total Sales Order (" + iVisibleItemCount + ")");
        },
        onReset: function () {
            that.getView().byId("idStockistCombo").setValue()
            that.getView().byId("idDateRangeSelection").setValue()
            that.getView().byId("idSearch").setValue()
            that.readUserMasterEntities(login_ID);
            that.readStockist(login_ID)
            that.getView().getModel("stockistDetails").refresh(true);
        }
    });
});