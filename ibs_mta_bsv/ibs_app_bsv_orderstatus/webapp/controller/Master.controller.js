sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "com/ibs/bsv/ibsappbsvorderstatus/model/formatter",
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
        var appModulePath, appId, appPath
        var sapModel
        var login_ID;
        var PropertyModel;
        var oDataModel;
        return Controller.extend("com.ibs.bsv.ibsappbsvorderstatus.controller.Master", {
            formatter: formatter,
            onInit: function () {
                that = this;
                oDataModel = that.getOwnerComponent().getModel();


                //Hide Filters and Hide Filter Bar button from the smart filter bar : 16.09.2024
                var oFilterBar = that.getView().byId("idPrHeaderSmart");
                var oToolbar = oFilterBar._oToolbar;
                if (oToolbar) {
                    var aToolbarItems = oToolbar.getContent();
                    if (aToolbarItems[6].getText() === "Filters") {
                        aToolbarItems[6].setVisible(false);
                    }

                    if (aToolbarItems[3].getText() === "Hide Filter Bar") {
                        aToolbarItems[3].setVisible(false);
                    }
                }

                sapModel = that.getOwnerComponent().getModel("ZIDEAL_ODATA_SALESORDER_SRV");
                PropertyModel = that.getOwnerComponent().getModel("PropertyModel");
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteMaster").attachPatternMatched(this._onRouteMatched, this);
            },


            _onRouteMatched: function (oEvent) {
                that.checkDevice();
                var pattern = oEvent.getSource()._oConfig.pattern; //:OrderStatus:
                if (pattern === ":OrderStatus:") {
                    that.getView().byId("idPlaceOrderButton").setVisible(true);
                }
                else if (pattern === "") {
                    that.getView().byId("idPlaceOrderButton").setVisible(false);
                }
                appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                appPath = appId.replaceAll(".", "/");
                appModulePath = jQuery.sap.getModulePath(appPath);
                that._userdetails();
                var g = this.getView().getParent().getParent();
                g.toBeginColumnPage(this.getView());
            },

            // added 22-10-2024
            _userdetails: function () {
                var url;
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                url = appModulePath + "/user-api/attributes";

                // login_ID = "101486";
                // var table = that.getView().byId("idPurchTable");
                // table.rebindTable(); // When Locall

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: url,
                        type: 'GET',
                        contentType: 'application/json',
                        success: function (data, response) {
                            ;
                            login_ID = data.name // fetching login_name value to name property
                            // login_ID = data.login_name[0]; // commented on 26-11-2024 
                            // data = JSON.parse(data);
                            var table = that.getView().byId("idPurchTable");
                            table.rebindTable();
                        },
                        error: function (oError) {
                            
                        }
                    });
                });


            },
            onBeforeRebindTable: function (oEvent) {
            
                var stockistID = login_ID
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "TO_STATUS";
                oBindingParams.filters = [];
                var oFilterStockist = new sap.ui.model.Filter("STOCKIST_ID", sap.ui.model.FilterOperator.EQ, stockistID);
                oBindingParams.filters.push(oFilterStockist);
                var oSmartFilterBar = this.byId("idPrHeaderSmart");
                var aFilters = oSmartFilterBar.getFilters();
                if (aFilters && aFilters.length > 0) {
                    oBindingParams.filters = oBindingParams.filters.concat(aFilters);
                }
                oBindingParams.sorter = [new sap.ui.model.Sorter({
                    path: "PURCHASE_REQUEST_NO",
                    descending: true
                })];
            },

            onNavigateToDetails(oEvent) {
                this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
                var iPrNo = oEvent.getSource().getBindingContext().getObject().PURCHASE_REQUEST_NO;
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                BusyIndicator.show(0);
                oRouter.navTo("Detail", {
                    "PURCHASE_REQUEST_NO": iPrNo
                });
            },

            orderCreate: function () {
                BusyIndicator.show();
                var StockistId = login_ID;
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RequestCreation", {
                    "Stockist": StockistId
                });
            },
            onClickScheme: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("Scheme");

            },

            readCredit: function () {
                BusyIndicator.show(0);
                var stockist = login_ID
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
            },

            onNavigateOrderCreation: function (oEvent) {
                var param = {};
                var oSemantic = "procreation";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    }
                    ,
                    params: param
                })) || ""; // generate the Hash to display a Supplier
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },
            onNavigateOrderHistory: function (oEvent) {
                var param = {};
                var oSemantic = "orderhistory";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    }
                    ,
                    params: param
                })) || "";
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            onNavigateDashboard: function (oEvent) {
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
                }));
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            onNavigateGRNReport: async function (oEvent) {
                var param = {};
                var oSemantic = "grn_report";
                try {
                    const oCrossAppNavigator = await sap.ushell.Container.getServiceAsync("CrossApplicationNavigation");
                    if (oCrossAppNavigator) {
                        var hash = oCrossAppNavigator.hrefForExternal({
                            target: {
                                semanticObject: oSemantic,
                                action: "display"
                            },
                            params: param
                        });
                        oCrossAppNavigator.toExternal({
                            target: {
                                shellHash: hash
                            }
                        });
                    } else {
                        console.error("CrossApplicationNavigation service is not available.");
                    }
                } catch (error) {
                    console.error("Error during cross-app navigation:", error);
                }
            },
            onNavigateGRN: function (oEvent) {
                var param = {};
                var oSemantic = "grn";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    }
                    ,
                    params: param
                }));
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            onNavigateLedger: function (oEvent) {
                var param = {};
                var oSemantic = "customer_ledger";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "Display"
                    }
                    ,
                    params: param
                })) || "";
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            onNavigateScheme: function (oEvent) {
                var param = {};
                var oSemantic = "dashboard";
                var hash = {};
                var additionalHash = "&/Scheme"
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    }
                    ,
                    params: param
                }));
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash + additionalHash
                    }
                });
            },

            // Device funtion check (Phone/Tablet/Desktop)
            checkDevice: function () {
                if (sap.ui.Device.system.phone === true) {
                    PropertyModel.setProperty("/Menu", true);
                    PropertyModel.setProperty("/HBOx", false);
                }
                else if (sap.ui.Device.system.tablet === true) {
                    PropertyModel.setProperty("/Menu", true);
                    PropertyModel.setProperty("/HBOx", false);
                }
                else if (sap.ui.Device.system.desktop === true) {
                    PropertyModel.setProperty("/Menu", false);
                    PropertyModel.setProperty("/HBOx", true);
                }
            },

            onNavigateOrderStatus: function (oEvent) {
                var param = { "OrderStatus": "OST" };
                var oSemantic = "orderstatustracking";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    }
                    ,
                    params: param
                }));
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },


            readUserMasterEntities: function () {
                BusyIndicator.show(0);
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrHeader";
                $.ajax({
                    url: url,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, responce) {
                        BusyIndicator.hide();
                        var model = new JSONModel(data.d.results);
                        that.getView().setModel(model, "stockistDetails");
                    },
                    error: function (e) {
                        BusyIndicator.hide();
                        MessageBox.error(e.responseText);
                    }
                });
            },

            onSelectRow: function (oEvent) {
                
            }

        });
    });