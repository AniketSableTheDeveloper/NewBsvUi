sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "com/ibs/bsv/ibsappbsvpoapproval/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox"
],
    function (Controller, Filter, FilterOperator, formatter, JSONModel, BusyIndicator, MessageBox) {
        "use strict";
        var that;
        var sapModel;
        var login_ID;
        var PropertyModel
        var UserData
        var isoString;

        return Controller.extend("com.ibs.bsv.ibsappbsvpoapproval.controller.Master", {
            formatter: formatter,
            onInit: function () {

                that = this;
                sapModel = that.getOwnerComponent().getModel("ZIDEAL_ODATA_SALESORDER_SRV");
                PropertyModel = that.getOwnerComponent().getModel("PropertyModel");

                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("MasterPage").attachPatternMatched(this._onRouteMatched, this);
                // that.readUserMasterEntities0511()

            },

            _onRouteMatched: function (oEvent) {

                //

                PropertyModel.setProperty("/ApproveBtton", false);

                that._userdetails();

                // var table = that.getView().byId("idPurchTable");
                // table.rebindTable();



                var g = this.getView().getParent().getParent();
                g.toBeginColumnPage(this.getView());
            },

            // added 22-10-2024
            _userdetails: function () {

                var url;
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);


                // login_ID = "W001";

                // var table = that.getView().byId("idPurchTable");
                // table.rebindTable();


                url = appModulePath + "/user-api/attributes";
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: url,
                        type: 'GET',
                        contentType: 'application/json',
                        success: function (data, response) {
                            ;
                            login_ID = data.login_name[0];
                             UserData = data

                            var table = that.getView().byId("idPurchTable");
                           table.rebindTable();



                            that.readAddress(login_ID)

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
                var iPrNo = oEvent.getSource().getBindingContext().getObject().PURCHASE_REQUEST_NO;
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

            onSelectRow: function (oEvent) {
                var oTable = this.byId("idPrheaderTbl");
                var aSelectedItems = oTable.getSelectedItems();
                var bIsRowSelected = aSelectedItems.length > 0;
                var messageDisplayedForOrderType3 = false;

                this.getView().getModel("PropertyModel").setProperty("/ApproveBtton", bIsRowSelected);

                // Collect all PURCHASE_REQUEST_NO values from selected rows
                var aPRNos = aSelectedItems.map(function (oItem) {
                    return oItem.getBindingContext().getObject().PURCHASE_REQUEST_NO;
                });
                var aOrderType = aSelectedItems.map(function (oItem) {
                    return oItem.getBindingContext().getObject().ORDER_TYPE;
                });
                for(var i = 0; i<aOrderType.length;i++)
                {
                    if(aOrderType[i] === 3)
                    {
                        MessageBox.information("Please check the Special Request Order Type once, before approving")
                        messageDisplayedForOrderType3 = true; // Set the flag to true
                        break;
                    }
                }
            


                if (aPRNos.length > 0) {
                    this.readUserMasterEntities(aPRNos); // Pass array of PRNos
                }

                console.log("Total Selected Items:", aSelectedItems.length);
            },

            readUserMasterEntities: function (aPRNos) {
                BusyIndicator.show(0);

                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);

                // Construct the OData query with multiple PURCHASE_REQUEST_NO values
                var filterString = aPRNos.map(function (PRNo) {
                    return "PURCHASE_REQUEST_NO eq '" + PRNo + "'";
                }).join(" or "); // Join with "or" to filter multiple entries

                var url = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/PrHeader?$filter=" + filterString + "&$expand=TO_STATUS,TO_ITEMS,TO_EVENT";

                var that = this; // Retain reference to 'this' in AJAX success/error callbacks

                $.ajax({
                    url: url,
                    type: 'GET',
                    contentType: 'application/json',
                    success: function (data) {
                        BusyIndicator.hide();

                        // Set data to stockistDetails model
                        var model = new JSONModel(data);
                        that.getView().setModel(model, "stockistDetails");

                        // Optional: Process the returned data if needed, e.g., grouping by PRNo
                        var headerDetails = data.d.results;
                        console.log("Retrieved data for selected PURCHASE_REQUEST_NO(s):", headerDetails);
                    },
                    error: function (e) {
                        BusyIndicator.hide();
                        MessageBox.error(e.responseText);
                    }
                });
            },


            onSelectRow0511: function (oEvent) {
                // Retrieve the table instance
                var oTable = this.byId("idPrheaderTbl");



                // Get selected items from the table
                var aSelectedItems = oTable.getSelectedItems();

                // Update isRowSelected property based on whether any rows are selected
                var bIsRowSelected = aSelectedItems.length > 0;
                that.getView().getModel("PropertyModel").setProperty("/ApproveBtton", bIsRowSelected);

                // Loop through selected items and retrieve data
                aSelectedItems.forEach(function (oItem) {
                    var oContext = oItem.getBindingContext();
                    var oData = oContext.getObject();

                    // Access specific data fields, e.g., PURCHASE_REQUEST_NO and STOCKIST_NAME
                    var PRNo = oData.PURCHASE_REQUEST_NO;
                    that.readUserMasterEntities(PRNo);
                    console.log("Selected Stockist:", oData.STOCKIST_NAME);
                    // Add additional data retrieval as needed
                });

                // Check the total number of selected items (optional)
                console.log("Total Selected Items:", aSelectedItems.length);
            },

            readUserMasterEntities0511: function () {
                //
                BusyIndicator.show(0);

                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                login_ID = "W001";
    
                var url = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/PrHeader?$filter=SHIP_FROM eq '" + login_ID + "'";


                $.ajax({
                    url: url,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, responce) {
                        //
                        BusyIndicator.hide();

                        var headerDetails = that.getView().getModel("stockistDetails").getData().d.results[0];

                        var lineModel = headerDetails.d.results[0].TO_ITEMS.results
                        var Events = headerDetails.d.results[0].TO_EVENT.results

                        var model = new JSONModel(data);
                        that.getView().setModel(model, "stockistDetails");

                        // that.readLineModel(PRNo);

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

                            that.finalPost(UserData);
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

                    if(headerDetails.d.results[i].PURCHASE_REQUEST_NO)
                    {

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

                        for(var j =0; j<headerDetails.d.results[i].TO_ITEMS.results.length;j++)
                        {
                            var oTableItem =  headerDetails.d.results[i].TO_ITEMS.results[j]

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
                                if (increment === 0)
                                {

                                
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



            finalPost: async function(UserData) {
                BusyIndicator.show();
                var that = this;
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var surl = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/CreatePurchase";
                var headerDetails = that.getView().getModel("stockistDetails").getData();
                var aPayloads = [];
                var userData = UserData
                if(UserData.Groups[0] === 'BSV_CFA')
                {
                    var userRole = "CFA"
                }
                
                // Constructing the payloads array
                for (var i = 0; i < headerDetails.d.results.length; i++) {
                    if (headerDetails.d.results[i].PURCHASE_REQUEST_NO) {
                        var creationDate = headerDetails.d.results[i].CREATION_DATE;
                        var timestampMatch = creationDate.match(/\/Date\((\d+)\+\d+\)\//);
                        var isoString = "";
                        if (timestampMatch) {
                            var timestamp = parseInt(timestampMatch[1], 10);
                            isoString = new Date(timestamp).toISOString();
                        }
            
                        var oPRHeader = {
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
            
                        var aPRItems = headerDetails.d.results[i].TO_ITEMS.results.map((oTableItem) => {
                            var fromDate = new Date(parseInt((oTableItem.FROM_DATE).match(/\d+/)[0], 10)).toLocaleDateString('en-GB').split("/").reverse().join("-");
                            var toDate = new Date(parseInt((oTableItem.TO_DATE).match(/\d+/)[0], 10)).toLocaleDateString('en-GB').split("/").reverse().join("-");

                            if(oTableItem.REQUEST_RATE === "")
                            {
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
                            "PURCHASE_REQUEST_NO": headerDetails.d.results[i].PURCHASE_REQUEST_NO,
                            "EVENT_NO": 1,
                            "EVENT_CODE": "1",
                            "USER_ID": UserData.email,
                            "USER_ROLE": userRole,
                            "USER_NAME": headerDetails.d.results[i].SHIP_FROM_NAME,
                            "COMMENTS": headerDetails.d.results[i].TO_EVENT.results[0].COMMENTS,
                            "CREATION_DATE": isoString
                        };
            
                        var payload = {
                            "sAction": "APPROVE",
                            "aPrHeader": [oPRHeader],
                            "aPrItems": aPRItems,
                            "aPrEvent": [oEvents],
                            "oUserDetails": {
                                "USER_ROLE": userRole,
                                "USER_ID": UserData.email
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
                    var table = that.getView().byId("idPurchTable");
                    table.rebindTable();
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
            }
            



                });
    });
