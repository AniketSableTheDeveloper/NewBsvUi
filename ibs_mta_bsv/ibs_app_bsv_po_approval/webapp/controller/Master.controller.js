sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/ibs/bsv/ibsappbsvpoapproval/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet'
],
    function (Controller, Filter, FilterOperator, formatter, JSONModel, BusyIndicator, MessageBox, exportLibrary, Spreadsheet) {
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
        return Controller.extend("com.ibs.bsv.ibsappbsvpoapproval.controller.Master", {
            formatter: formatter,
            onInit: function () {

                that = this;
                that.checkDevice();
                sapModel = that.getOwnerComponent().getModel("ZIDEAL_ODATA_SALESORDER_SRV");
                PropertyModel = that.getOwnerComponent().getModel("PropertyModel");

                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("MasterPage").attachPatternMatched(this._onRouteMatched, this);
                // that.readUserMasterEntities()
                // that.readStockist()

            },

            _onRouteMatched: function (oEvent) {

                //

                PropertyModel.setProperty("/ApproveBtton", false);
                that._userdetails();

                var g = this.getView().getParent().getParent();
                g.toBeginColumnPage(this.getView());
            },


            // Device funtion check (Phone/Tablet/Desktop)
            checkDevice: function () {

                if (sap.ui.Device.system.phone === true) {

                    that.getView().byId("idSalesOrderCount").setVisible(false);
                
                    // PropertyModel.setProperty("/Menu", true);
                    // that.getView().byId("idShipFrom").addStyleClass("sapUiSmallMarginEnd")
                    // that.getView().byId("idShipTo").addStyleClass("sapUiSmallMarginEnd")
                    // PropertyModel.setProperty("/HBOx", false);

                    // that.getView().byId("idTotAmtObjStatus").addStyleClass("sapMObjectStatusTiny");
                    // that.getView().byId("idTaxAmtObjStatus").addStyleClass("sapMObjectStatusTiny");
                    // that.getView().byId("idGrdAmtObjStatus").addStyleClass("sapMObjectStatusTiny");


                    
                    // that.getView().byId("idTotAmtVLayout").addStyleClass("sapUiSmallMarginEnd");
                    // that.getView().byId("idTotTaxVLayout").addStyleClass("sapUiSmallMarginEnd");
                    // that.getView().byId("idGrdAmtVLayout").addStyleClass("sapUiSmallMarginEnd");

                   
                    
                }
                else if (sap.ui.Device.system.tablet === true) {

                    that.getView().byId("idSalesOrderCount").setVisible(true);
                 
                    // that.getView().byId("idShipFrom").addStyleClass("sapUiLargeMarginBegin")
                    // that.getView().byId("idShipTo").addStyleClass("sapUiLargeMarginBegin")
                    
                   
                    
                    // that.getView().byId("idTotAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    // that.getView().byId("idTaxAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    // that.getView().byId("idGrdAmtObjStatus").addStyleClass("sapMObjectStatusLarge");


                    // that.getView().byId("idTotAmtVLayout").addStyleClass("sapUiSmallMarginBegin");
                    // that.getView().byId("idTotTaxVLayout").addStyleClass("sapUiSmallMarginBegin");
                    // that.getView().byId("idGrdAmtVLayout").addStyleClass("sapUiSmallMarginBegin");

                   
                }

                else if (sap.ui.Device.system.desktop === true) {

                    that.getView().byId("idSalesOrderCount").setVisible(true);

                    // that.getView().byId("idShipFrom").addStyleClass("sapUiLargeMarginBegin")
                    // that.getView().byId("idShipTo").addStyleClass("sapUiLargeMarginBegin")
                    
                    // that.getView().byId("idTotAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    // that.getView().byId("idTaxAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    // that.getView().byId("idGrdAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                   
                    // that.getView().byId("idTotAmtVLayout").addStyleClass("sapUiSmallMarginBegin");
                    // that.getView().byId("idTotTaxVLayout").addStyleClass("sapUiSmallMarginBegin");
                    // that.getView().byId("idGrdAmtVLayout").addStyleClass("sapUiSmallMarginBegin");

                   
                }
            },
    
            // added 22-10-2024
            _userdetails: function () {

                var url;
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);

                // login_ID = "W001";
                // that.readUserMasterEntities(login_ID)
                // that.readStockist(login_ID)
                // that.readAddress(login_ID)
               
                url = appModulePath + "/user-api/attributes";
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: url,
                        type: 'GET',
                        contentType: 'application/json',
                        success: function (data, response) {
                            ;
                            login_ID = data.name // fetching login_name value to name property
                            // login_ID = data.login_name[0]; // commented on 26-11-2024 
                            UserData = data
                            that.readUserMasterEntities(login_ID)
                            that.readStockist(login_ID)
                            that.readAddress(login_ID)
                            that.readgetUserAttributes();
                        },
                        error: function (oError) {
                            
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

            onNavigateToDetails(oEvent) {

                this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
                var iPrNo = oEvent.getSource().getBindingContext("stockistDetails").getObject().PURCHASE_REQUEST_NO;
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("Detail", {
                    "PURCHASE_REQUEST_NO": iPrNo
                });
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
            onSelectRow: function (oEvent) {

                ;
                aSelectedObjects = []
                var Table = this.getView().byId("idOrderTable");
                var aSelectedItems = Table.getSelectedItems();
                var bIsRowSelected = aSelectedItems.length > 0;
                this.getView().getModel("PropertyModel").setProperty("/ApproveBtton", bIsRowSelected);

                // Clear the array first to avoid accumulating previously selected items
                aSelectedObjects = [];

                // Loop through all selected items and push each selected object into the array
                aSelectedItems.forEach(function (oItem) {
                    var selectedObject = oItem.getBindingContext("stockistDetails").getObject();
                    aSelectedObjects.push(selectedObject);
                }.bind(this));  // Use .bind(this) to maintain the scope

                for(var i =0; i<aSelectedObjects.length; i++)
                {

                if(aSelectedObjects[i].ORDER_TYPE === 3)
                {
                    MessageBox.information("Please check the Special Request Order Type once, before approving");
                    break;
                }
            }
            },






            readUserMasterEntities: function (login_ID) {
                //
                BusyIndicator.show(0);

                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                // login_ID = "E001";

                var url = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/PrHeader?$expand=TO_STATUS,TO_ITEMS,TO_EVENT&$filter=(SHIP_FROM eq '" + login_ID + "') and (STATUS eq 1)";


                $.ajax({
                    url: url,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, responce) {
                        //
                        BusyIndicator.hide();

                        var model = new JSONModel(data.d.results);
                        that.getView().setModel(model, "stockistDetails");

                        var count = data.d.results.length;
                        PropertyModel.setProperty("/count", "Total Sales Order (" + count + ")");



                        // that.readLineModel(PRNo);

                    },
                    error: function (e) {
                        //
                        BusyIndicator.hide();
                        MessageBox.error(e.responseText);
                    }
                });
            },
            readStockist: function (login_ID) {
                //
                BusyIndicator.show(0);

                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                // login_ID = "E001";

                var url = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/CfaWiseStockistData?$filter=SHIP_FROM eq '" + login_ID + "'";
                // var url = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/PrHeader?$expand=TO_STATUS,TO_ITEMS,TO_EVENT&$filter=(SHIP_FROM eq '" + login_ID + "') and (STATUS eq 1)";


                $.ajax({
                    url: url,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, responce) {
                        //
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

            readLineModel: function (PRNo) {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url2 = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/PrItems?$filter=PURCHASE_REQUEST_NO eq " + PRNo + "";
                // that.oDataModel = this.getOwnerComponent().getModel();

                $.ajax({
                    url: url2,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, responce) {
                        // //
                        BusyIndicator.hide();
                        var tableitems = new JSONModel(data.d.results);
                        data.d.results.forEach(function (item) {
                            // Format the ORDER_QUANTITY to have two decimal places
                            item.ORDER_QUANTITY = parseFloat(item.ORDER_QUANTITY).toFixed(2);

                        });
                        //    data.ORDER_QUANTITY

                        tableitems.setSizeLimit(data.d.results.length);
                        that.getView().setModel(tableitems, "itemsModel");

                        // that.OpenEvent(PRNo);


                    },
                    error: function (e) {
                        ////
                        BusyIndicator.hide()
                        MessageBox.error(e.responseText);
                    }
                });
            },


            OpenEvent: function (PRNo) {
                //
                BusyIndicator.show(0);
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/PrEventLog?$expand=TO_EVENT_STATUS&$filter=PURCHASE_REQUEST_NO eq " + PRNo + "";

                $.ajax({
                    url: url,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, responce) {
                        ////
                        BusyIndicator.hide();

                        var eventLog = new JSONModel(data);
                        that.getView().setModel(eventLog, "eventData");

                    },
                    error: function (e) {
                        ////
                        BusyIndicator.hide()
                        MessageBox.error(e.responseText);
                    }
                });
            },
            onApproveOrdr: function () {
                // 

                MessageBox.confirm("Do you want to Approve this request?", {
                    actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction === 'YES') {

                            that.finalPost(UserData,Role);
                        }
                    }
                })
            },

            formatDate: function (creationDate) {
                // let creationDate = "/Date(1723635218145+0000)/";

                // Extract the timestamp using a regular expression
                let timestampMatch = creationDate.match(/\/Date\((\d+)\+\d+\)\//);
                if (timestampMatch) {
                    let timestamp = parseInt(timestampMatch[1], 10);

                    // Convert the timestamp to a Date object
                    let date = new Date(timestamp);

                    // Convert the Date object to an ISO string
                    isoString = date.toISOString();

                    // // Use the ISO string in your payload
                    // console.log(isoString);
                }
            },
            finalPost0511: function (UserData) {
                ;
                BusyIndicator.show();
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var surl = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/CreatePurchase";
                var oPRHeader;
                var aPRHeader = [];
                var oPRItems;
                var aPRItems = [];
                var oEvents;
                var aEvents = [];
                var headerDetails = that.getView().getModel("stockistDetails").getData();
                var increment = 0;

                for (var i = 0; i < headerDetails.d.results.length; i++) {

                    if (headerDetails.d.results[i].PURCHASE_REQUEST_NO) {

                        increment++;

                        var creationDate = headerDetails.d.results[i].CREATION_DATE
                        var timestampMatch = creationDate.match(/\/Date\((\d+)\+\d+\)\//);
                        if (timestampMatch) {
                            var timestamp = parseInt(timestampMatch[1], 10);

                            // Convert the timestamp to a Date object
                            var date = new Date(timestamp);

                            // Convert the Date object to an ISO string
                            var isoString = date.toISOString();

                            oPRHeader = {
                                "PURCHASE_REQUEST_NO": headerDetails.d.results[i].PURCHASE_REQUEST_NO,
                                "SAP_SALES_ORDER_NO": null,
                                "CREATION_DATE": isoString,
                                "STOCKIST_ID": headerDetails.d.results[i].STOCKIST_ID,
                                "STOCKIST_NAME": headerDetails.d.results[i].STOCKIST_NAME,
                                "REFERENCE_ID": headerDetails.d.results[i].REFERENCE_ID,
                                "SHIP_TO": headerDetails.d.results[i].SHIP_TO,
                                "SHIP_NAME": headerDetails.d.results[i].SHIP_NAME,
                                "SHIP_FROM": headerDetails.d.results[i].SHIP_FROM,
                                "SHIP_FROM_NAME": headerDetails.d.results[i].SHIP_FROM_NAME,
                                "PAYMENT_METHOD_CODE": headerDetails.d.results[i].PAYMENT_METHOD_CODE,
                                "PAYMENT_METHOD_DESCRIPTION": headerDetails.d.results[i].PAYMENT_METHOD_DESCRIPTION,
                                "STATUS": 1,
                                "LAST_UPDATED_DATE": "2024-06-03T07:09:49.069Z",
                                "NOTIFICATION_IDS": "CFAtest@gmail.com",
                                "TOTAL_AMOUNT": headerDetails.d.results[i].TOTAL_AMOUNT,
                                "TAXES_AMOUNT": headerDetails.d.results[i].TAXES_AMOUNT,
                                "TCS_AMOUNT": headerDetails.d.results[i].TCS_AMOUNT,
                                "GRAND_TOTAL": headerDetails.d.results[i].GRAND_TOTAL
                            };
                            aPRHeader.push(oPRHeader);

                            for (var j = 0; j < headerDetails.d.results[i].TO_ITEMS.results.length; j++) {
                                var oTableItem = headerDetails.d.results[i].TO_ITEMS.results[j]

                                var from = parseInt((oTableItem.FROM_DATE).match(/\d+/)[0], 10);
                                var fDate = new Date(from);
                                var fromdate = fDate.toLocaleDateString('en-GB');
                                var parts = fromdate.split("/");
                                var FromformattedDate = parts[2] + "-" + parts[1] + "-" + parts[0];
                                var ToDate = parseInt((oTableItem.TO_DATE).match(/\d+/)[0], 10);
                                var TDate = new Date(ToDate);
                                var ToDateEndDate = TDate.toLocaleDateString('en-GB');
                                var parts = ToDateEndDate.split("/");
                                var ToDate = parts[2] + "-" + parts[1] + "-" + parts[0];
                                oPRItems = {
                                    "MATERIAL_CODE": oTableItem.MATERIAL_CODE,
                                    "MATERIAL_DESC": oTableItem.MATERIAL_DESC,
                                    "HSN_CODE": oTableItem.HSN_CODE,
                                    "UNIT_OF_MEASURE": oTableItem.UNIT_OF_MEASURE,
                                    "ORDER_QUANTITY": Number(oTableItem.ORDER_QUANTITY),
                                    "SCHEME_APPLIED": oTableItem.SCHEME_APPLIED,
                                    "MRP_PRICE": oTableItem.MRP_PRICE,
                                    "NIR_PRICE": oTableItem.NIR_PRICE,
                                    "TOTAL_AMOUNT": oTableItem.TOTAL_AMOUNT,
                                    "CGST_PERCENTAGE": oTableItem.CGST_PERCENTAGE,
                                    "CGST_AMOUNT": oTableItem.CGST_AMOUNT,
                                    "SGST_PERCENTAGE": oTableItem.SGST_PERCENTAGE,
                                    "SGST_AMOUNT": oTableItem.SGST_AMOUNT,
                                    "IGST_PERCENTAGE": oTableItem.IGST_PERCENTAGE,
                                    "IGST_AMOUNT": oTableItem.IGST_AMOUNT,
                                    "TAXES_AMOUNT": oTableItem.TAXES_AMOUNT,
                                    "FREEGOODS": oTableItem.FREEGOODS,
                                    "SPECIAL_ORDER": oTableItem.SPECIAL_ORDER,
                                    "PURCHASE_REQUEST_NO": oTableItem.PURCHASE_REQUEST_NO,
                                    "ITEM_NO": 1, // Ensure ITEM_NO is unique
                                    "REQUEST_RATE": oTableItem.REQUEST_RATE, // Dynamically get REQUEST_RATE
                                    "FROM_DATE": FromformattedDate, // Dynamically get FROM_DATE
                                    "TO_DATE": ToDate // Dynamically get TO_DATE
                                };

                            }
                            // aPRHeader.push(oPRHeader);
                            aPRItems.push(oPRItems);

                            oEvents = {
                                "PURCHASE_REQUEST_NO": headerDetails.d.results[i].PURCHASE_REQUEST_NO,
                                "EVENT_NO": 1,
                                "EVENT_CODE": "1",
                                "USER_ID": "guwahati.cfa@bsvgroup.com",
                                "USER_ROLE": "CFA",
                                "USER_NAME": headerDetails.d.results[i].SHIP_FROM_NAME,
                                "COMMENTS": headerDetails.d.results[i].TO_EVENT.results[0].COMMENTS,
                                "CREATION_DATE": isoString
                            };



                            aPRHeader.push(Object.assign({}, oPRHeader));
                            aEvents.push(Object.assign({}, oEvents));

                            var firstname = UserData

                            //  if(UserData.Groups[0] === "BSV_CFA")
                            //      {
                            //          var UserRole = "CFA"
                            //      }

                            var payload = {
                                "sAction": "APPROVE",
                                "aPrHeader": aPRHeader,
                                "aPrItems": aPRItems,
                                "aPrEvent": aEvents,
                                "oUserDetails": {
                                    "USER_ROLE": "CFA",
                                    // "USER_NAME": headerDetails.d.results[0].SHIP_FROM_NAME,
                                    "USER_ID": "guwahati.cfa@bsvgroup.com"
                                }
                            };


                            var payloadstring = JSON.stringify(payload);
                            $.ajax({
                                type: "POST",
                                url: surl,
                                data: payloadstring,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (result) {
                                    ;
                                    BusyIndicator.hide();
                                    increment--;
                                    if (increment === 0) {


                                        MessageBox.success(result.d.CreatePurchase.OUT_SUCCESS, {
                                            actions: [MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                            onClose: function (oAction) {
                                                if (oAction === 'OK') {
                                                    ;

                                                    var table = that.getView().byId("idPurchTable");
                                                    table.rebindTable();
                                                }
                                            }
                                        });
                                    }

                                },
                                error: function (oError) {
                                    ;
                                    BusyIndicator.hide();
                                    var oXMLMsg, oXML;
                                    if ((oError.responseText)) {
                                        oXML = JSON.parse(oError.responseText);
                                        oXMLMsg = oXML.error["message"];
                                    } else {
                                        oXMLMsg = oError.responseText;
                                    }
                                    MessageBox.error(oXMLMsg.value);
                                    // MessageBox.error(oError.responseText);
                                }
                            });



                        }

                    }
                }
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
                  //      Role = data.d.results[1]  // 'BSV_CFA'
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



            finalPost: async function (UserData,Role) {
                BusyIndicator.show();
                var that = this;
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var surl = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/CreatePurchase";
                // if(aSelectedObjects)
                var headerDetails = aSelectedObjects
                var aPayloads = [];
                var userData = UserData
                // if (Role === 'BSV_CFA') {
                //     var userRole = "CFA"
                // }
                // if (UserData.Groups[0] === 'BSV_CFA') {
                //     var userRole = "CFA"
                // }
                // var userRole = "CFA"

                // Constructing the payloads array
                for (var i = 0; i < headerDetails.length; i++) {
                    if (headerDetails[i].PURCHASE_REQUEST_NO) {
                        var creationDate = headerDetails[i].CREATION_DATE;
                        var timestampMatch = creationDate.match(/\/Date\((\d+)\+\d+\)\//);
                        var isoString = "";
                        if (timestampMatch) {
                            var timestamp = parseInt(timestampMatch[1], 10);
                            isoString = new Date(timestamp).toISOString();
                        }

                        var oPRHeader = {
                            "PURCHASE_REQUEST_NO": headerDetails[i].PURCHASE_REQUEST_NO,
                            "SAP_SALES_ORDER_NO": null,
                            "CREATION_DATE": isoString,
                            "STOCKIST_ID": headerDetails[i].STOCKIST_ID,
                            "STOCKIST_NAME": headerDetails[i].STOCKIST_NAME,
                            "REFERENCE_ID": headerDetails[i].REFERENCE_ID,
                            "SHIP_TO": headerDetails[i].SHIP_TO,
                            "SHIP_NAME": headerDetails[i].SHIP_NAME,
                            "SHIP_FROM": headerDetails[i].SHIP_FROM,
                            "SHIP_FROM_NAME": headerDetails[i].SHIP_FROM_NAME,
                            "PAYMENT_METHOD_CODE": headerDetails[i].PAYMENT_METHOD_CODE,
                            "PAYMENT_METHOD_DESCRIPTION": headerDetails[i].PAYMENT_METHOD_DESCRIPTION,
                            "STATUS": 1,
                            "LAST_UPDATED_DATE": "2024-06-03T07:09:49.069Z",
                            "NOTIFICATION_IDS": "CFAtest@gmail.com",
                            "TOTAL_AMOUNT": headerDetails[i].TOTAL_AMOUNT,
                            "TAXES_AMOUNT": headerDetails[i].TAXES_AMOUNT,
                            "TCS_AMOUNT": headerDetails[i].TCS_AMOUNT,
                            "GRAND_TOTAL": headerDetails[i].GRAND_TOTAL
                        };

                        var aPRItems = headerDetails[i].TO_ITEMS.results.map((oTableItem) => {
                            var fromDate = new Date(parseInt((oTableItem.FROM_DATE).match(/\d+/)[0], 10)).toLocaleDateString('en-GB').split("/").reverse().join("-");
                            var toDate = new Date(parseInt((oTableItem.TO_DATE).match(/\d+/)[0], 10)).toLocaleDateString('en-GB').split("/").reverse().join("-");

                            if (oTableItem.REQUEST_RATE === "") {
                                oTableItem.REQUEST_RATE = "0.00"
                            } //added 07-11-2024
                            return {
                                "MATERIAL_CODE": oTableItem.MATERIAL_CODE,
                                "MATERIAL_DESC": oTableItem.MATERIAL_DESC,
                                "HSN_CODE": oTableItem.HSN_CODE,
                                "UNIT_OF_MEASURE": oTableItem.UNIT_OF_MEASURE,
                                "ORDER_QUANTITY": Number(oTableItem.ORDER_QUANTITY),
                                "SCHEME_APPLIED": oTableItem.SCHEME_APPLIED,
                                "MRP_PRICE": oTableItem.MRP_PRICE,
                                "NIR_PRICE": oTableItem.NIR_PRICE,
                                "TOTAL_AMOUNT": oTableItem.TOTAL_AMOUNT,
                                "CGST_PERCENTAGE": oTableItem.CGST_PERCENTAGE,
                                "CGST_AMOUNT": oTableItem.CGST_AMOUNT,
                                "SGST_PERCENTAGE": oTableItem.SGST_PERCENTAGE,
                                "SGST_AMOUNT": oTableItem.SGST_AMOUNT,
                                "IGST_PERCENTAGE": oTableItem.IGST_PERCENTAGE,
                                "IGST_AMOUNT": oTableItem.IGST_AMOUNT,
                                "TAXES_AMOUNT": oTableItem.TAXES_AMOUNT,
                                "FREEGOODS": oTableItem.FREEGOODS,
                                "SPECIAL_ORDER": oTableItem.SPECIAL_ORDER,
                                "PURCHASE_REQUEST_NO": oTableItem.PURCHASE_REQUEST_NO,
                                "ITEM_NO": 1,
                                "REQUEST_RATE": oTableItem.REQUEST_RATE,
                                "FROM_DATE": fromDate,
                                "TO_DATE": toDate
                            };
                        });

                        var oEvents = {
                            "PURCHASE_REQUEST_NO": headerDetails[i].PURCHASE_REQUEST_NO,
                            "EVENT_NO": 1,
                            "EVENT_CODE": "1",
                            "USER_ID": UserData.email, //"guwahati.cfa@bsvgroup.com"
                            "USER_ROLE": Role,
                            "USER_NAME": headerDetails[i].SHIP_FROM_NAME,
                            "COMMENTS": headerDetails[i].TO_EVENT.results[0].COMMENTS,
                            "CREATION_DATE": isoString
                        };

                        var payload = {
                            "sAction": "APPROVE",
                            "aPrHeader": [oPRHeader],
                            "aPrItems": aPRItems,
                            "aPrEvent": [oEvents],
                            "oUserDetails": {
                                "USER_ROLE": Role,
                                "USER_ID": UserData.email //"guwahati.cfa@bsvgroup.com" 
                            }
                        };
                        aPayloads.push(payload);
                    }
                }

                // Process each payload sequentially
                try {
                    for (let payload of aPayloads) {
                        await $.ajax({
                            type: "POST",
                            url: surl,
                            data: JSON.stringify(payload),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json"
                        });
                    }

                    MessageBox.success("Selected Sales Order Approved successfully.");
                    that.getView().getModel("stockistDetails").refresh(true);
                    that.readUserMasterEntities(login_ID);
                    PropertyModel.setProperty("/ApproveBtton", false);
                    // var table = that.getView().byId("idPurchTable");
                    // table.rebindTable();
                } catch (oError) {
                    var oXMLMsg;
                    if ((oError.responseText)) {
                        var oXML = JSON.parse(oError.responseText);
                        oXMLMsg = oXML.error["message"];
                    } else {
                        oXMLMsg = oError.responseText;
                    }
                    MessageBox.error(oXMLMsg.value);
                } finally {
                    BusyIndicator.hide();
                }
            },

            onSearchField: function (oEvent) {
                ;
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

            onDownloadExcel: function () {
                

                var aCols, oRowBinding, oSettings, oSheet, oTable;

                var oModel = that.getView().getModel("stockistDetails").getData();

                // Loop through each item in the model and format the CREATION_DATE
                for (var i = 0; i < oModel.length; i++) {
                    if (oModel[i].CREATION_DATE) {
                        var timestamp = parseInt(oModel[i].CREATION_DATE.match(/\d+/)[0], 10);
                        var date = new Date(timestamp);
                        oModel[i].Formatted_Creation_Date = date.toLocaleDateString('en-GB');
                    }
                    if (oModel[i].ORDER_TYPE === 1) {
                        oModel[i].ORDER_TYPE_DESC = "ORDER WITH SCHEME"
                    }
                    else if (oModel[i].ORDER_TYPE === 3) {
                        oModel[i].ORDER_TYPE_DESC = "ORDER WITH SPECIAL RATE"
                    }

                    // Format GRAND_TOTAL with comma separator
                    if (oModel[i].GRAND_TOTAL) {
                        oModel[i].GRAND_TOTAL_Format = parseFloat(oModel[i].GRAND_TOTAL).toLocaleString('en-US');
                    }
                }

                if (!this._oTable) {
                    this._oTable = this.byId('idOrderTable');
                }

                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');
                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oModel,  // Pass the updated model with formatted dates
                    fileName: 'Sales Orders.xlsx',
                    worker: false // Disable worker for MockServer as OData Service
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },

            createColumnConfig: function () {
                var aCols = [];

                aCols.push({
                    label: 'Sales Order Number',
                    property: ['PURCHASE_REQUEST_NO'],
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Stockist',
                    type: EdmType.String,
                    property: ['STOCKIST_NAME'],
                    scale: 0
                });

                // aCols.push({
                //     property: 'CREATION_DATE',
                //     type: EdmType.String,
                //     label: "Sales Order Date",
                //     delimiter: true
                // });
                aCols.push({
                    property: 'Formatted_Creation_Date', // Use the new formatted date property
                    type: EdmType.String,
                    label: "Sales Order Date"
                });

                aCols.push({
                    property: 'ORDER_TYPE_DESC',
                    type: EdmType.String,
                    label: "Order Type",
                    valueMap: {
                        "1": "SCHEME",
                        "2": "WITH RATE"
                        // Add more mappings as necessary
                    },
                    format: function (value) {
                        // Return description based on code
                        return this.valueMap[value] || "Unknown";
                    }

                });

                aCols.push({
                    property: 'GRAND_TOTAL_Format',
                    type: EdmType.String,
                    label: "Grand Total",
                    format: function (value) {
                        return parseFloat(value).toLocaleString('en-IN', {

                        });
                    }

                });


                // aCols.push({
                //     property: 'TO_STATUS/DESC',
                //     type: EdmType.String,
                //     label:"Status"
                // });

                return aCols;
            },



            //filterBar Go function
            // onSearch:function()
            // {
            //     


            // },
            onSearch: function () {
                ;

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
