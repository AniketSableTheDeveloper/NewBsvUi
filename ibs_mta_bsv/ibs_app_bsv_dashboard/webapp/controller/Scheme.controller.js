sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "com/ibs/bsv/ibsappbsvdashboard/model/formatter",
    "com/ibs/bsv/ibsappbsvdashboard/model/down",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (Controller, JSONModel, BusyIndicator, MessageBox, formatter, down, Filter, FilterOperator) {
        "use strict";
        var that, appId, appPath, appModulePath;
        var PropertyModel;
        return Controller.extend("com.ibs.bsv.ibsappbsvdashboard.controller.Scheme", {
            formatter: formatter,
            onInit: function (oEvent) {
                that = this;
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("Scheme").attachPatternMatched(this._onRouteMatched, this);
                PropertyModel = that.getOwnerComponent().getModel("PropertyModel");
            },

            _onRouteMatched: function (oEvent) {
                that.checkDevice();
            },

            // New code 29-11-2024
            onBeforeRebindTable: function (oEvent) {
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.sorter = [new sap.ui.model.Sorter({ path: "REFERENCE_ID", descending: true })];
                var oTypeFilter = new sap.ui.model.Filter("TYPE", sap.ui.model.FilterOperator.EQ, "Scheme");
                if (oBindingParams.filters.length > 0) {
                    oBindingParams.filters.push(oTypeFilter);
                } else {
                    var vDate = new Date();
                    var vStartDate = new Date(vDate.getFullYear(), vDate.getMonth(), 1);
                    var vEndDate = new Date(vDate.getFullYear(), vDate.getMonth() + 1, 0);
                    var oDateFilter = new sap.ui.model.Filter("CREATION_DATE", sap.ui.model.FilterOperator.BT, vStartDate, vEndDate);
                    oBindingParams.filters = [oTypeFilter, oDateFilter];
                }
            },
            

            // //Smart Table control
            // onBeforeRebindTable: function (oEvent) {
            //     var oBindingParams = oEvent.getParameter("bindingParams");
            //     if (oBindingParams.filters.length > 0) {
            //         oBindingParams.sorter = [new sap.ui.model.Sorter({ path: "REFERENCE_ID", descending: true })];
            //     }
            //     else {
            //         var vDate = new Date();
            //         var vStartDate = new Date(vDate.getFullYear(), vDate.getMonth(), 1);
            //         var vEndDate = new Date(vDate.getFullYear(), vDate.getMonth() + 1, 0);
            //         oBindingParams.filters = [new sap.ui.model.Filter("CREATION_DATE", sap.ui.model.FilterOperator.BT, vStartDate, vEndDate)];
            //         oBindingParams.sorter = [new sap.ui.model.Sorter({ path: "REFERENCE_ID", descending: true })];
            //     }
            // },

            // Comment pop-up close button
            CommentCloseButton: function (oEvent) {
                sap.ui.getCore().byId("myPopover").close();
            },

            //To Open Comment pop-up
            onComment: async function (oEvent) {
                BusyIndicator.show();
                appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                appPath = appId.replaceAll(".", "/");
                appModulePath = jQuery.sap.getModulePath(appPath);
                var vReferenceId = Number(oEvent.getSource().getParent().getAggregation('cells')[0].mProperties.text);
                await this.ReadCommentData(vReferenceId);
                var oButton = oEvent.getSource();
                if (!this.onCommentFrag) {
                    this.onCommentFrag = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvdashboard.view.fragments.onComments", this);
                    this.getView().addDependent(that.onCommentFrag);
                }
                this.onCommentFrag.openBy(oButton);
            },

            //Read SchemeHeader function
            ReadCommentData: function (vReferenceId) {
                var vUrlReferenceId = "(REFERENCE_ID eq " + vReferenceId + ")";
                var path = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/SchemeHeader?$filter=" + vUrlReferenceId;
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: path,
                        type: 'GET',
                        contentType: 'application/json',
                        success: function (data, responce) {
                            var oModel = new JSONModel(data.d.results[0]);
                            that.getView().setModel(oModel, "sCommentJson");
                            BusyIndicator.hide();
                            resolve(data);
                        },
                        error: function (error) {
                            BusyIndicator.hide();
                            var oXMLMsg, oXML;
                            if (that.isValidJsonString(error.responseText)) {
                                oXML = JSON.parse(error.responseText);
                                oXMLMsg = oXML.error["message"];
                            } else {
                                oXMLMsg = error.responseText;
                            }
                            MessageBox.error(oXMLMsg);
                        }
                    });
                });
            },

            //To download scheme attachment
            onDownload: function (oEvent) {
                BusyIndicator.show();
                appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                appPath = appId.replaceAll(".", "/");
                appModulePath = jQuery.sap.getModulePath(appPath);
                var vReferenceId = Number(oEvent.getSource().getParent().getAggregation('cells')[0].mProperties.text);
                var vFile_Id = 1;
                var path = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/SchemeAttachment(REFERENCE_ID=" + vReferenceId + ",FILE_ID=" + vFile_Id + ")/$value";
                $.ajax({
                    url: path,
                    type: 'GET',
                    contentType: 'application/json',
                    success: function (data, responce) {
                        that.fileType(vReferenceId, data);
                    },
                    error: function (error) {
                        BusyIndicator.hide();
                        var oXMLMsg, oXML;
                        if (that.isValidJsonString(error.responseText)) {
                            oXML = JSON.parse(error.responseText);
                            oXMLMsg = oXML.error["message"];
                        } else {
                            oXMLMsg = error.responseText;
                        }
                        MessageBox.error(oXMLMsg);
                    }
                });
            },

            fileType: function (vReferenceId, data) {
                var vReferenceId = "(REFERENCE_ID eq " + vReferenceId + ")";
                var path = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/SchemeAttachment?$filter=" + vReferenceId;
                var FILE_CONTENT = data;
                $.ajax({
                    url: path,
                    type: 'GET',
                    contentType: 'application/json',
                    success: function (data, responce) {
                        if (data.d.results.length > 0) {
                            that.downloadFileContent(data.d.results[0].FILE_TYPE || null, data.d.results[0].FILE_NAME, data.d.results[0].FILE_MIMETYPE, FILE_CONTENT);
                        } else {
                            MessageBox.error("Attachments are empty.");
                        }
                    },
                    error: function (error) {
                        BusyIndicator.hide();
                        var oXMLMsg, oXML;
                        if (that.isValidJsonString(error.responseText)) {
                            oXML = JSON.parse(error.responseText);
                            oXMLMsg = oXML.error["message"];
                        } else {
                            oXMLMsg = error.responseText;
                        }
                        MessageBox.error(oXMLMsg);
                    }
                });
            },

            downloadFileContent: function (iFILE_TYPE, sFILE_NAME, sFILE_MIMETYPE, sFILE_CONTENT) {
                this.downloadAttachment(sFILE_CONTENT, sFILE_NAME, sFILE_MIMETYPE);
            },

            downloadAttachment: function (content, fileName, mimeType) {
                download("data:application/octet-stream;base64," + content, fileName, mimeType);
                var HttpRequest = new XMLHttpRequest();
                HttpRequest.responseType = 'blob';
                HttpRequest.onload = function (e) {
                    download(HttpRequest.response, fileName, mimeType);
                }
                BusyIndicator.hide();
                HttpRequest.send();

            },

            //To Navigate Home / Dashboard screen
            onNavigateDashboard: function (oEvent) {
                var router = sap.ui.core.UIComponent.getRouterFor(that);
                router.navTo("RouteMaster");
            },

            //To Navigate Stokist Ledger App
            onNavigateLedger: function (oEvent) {
                var param = {};
                var oSemantic = "customer_ledger";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
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

            // To Navigate Order Status App
            onNavigateOrderStatus: function (oEvent) {
                var param = { "OrderStatus": "OST" };
                var oSemantic = "orderstatustracking";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
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

            // To Navigate New Sales Order App
            onNavigateOrderCreation: function (oEvent) {
                var param = {};
                var oSemantic = "procreation";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
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

            //To Navigate GRN App
            onNavigateGRN: function (oEvent) {
                var param = {};
                var oSemantic = "grn";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    },
                    params: param
                }));
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            },

            //To Navigate GRN Report App
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

            //To Navigate Scheme
            onNavigateScheme: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Scheme");
            },

            //To Navigate Order History App
            onNavigateOrderHistory: function (oEvent) {
                var param = {};
                var oSemantic = "orderhistory";
                var hash = {};
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
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
            }
        });
    });
