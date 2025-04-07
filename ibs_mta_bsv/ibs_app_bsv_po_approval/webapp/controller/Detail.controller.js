sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "com/ibs/bsv/ibsappbsvpoapproval/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (Controller, JSONModel, MessageBox, BusyIndicator, formatter, Filter, FilterOperator) {
        "use strict";
        var that;
        var localmodel, oProductModel;
        var prno, url
        var that
        var creationDate;
        var isoString
        var itemsdata
        var sapModel;
        var UserData
        var Role;
        var login_ID;
        var PropertyModel;

        return Controller.extend("com.ibs.bsv.ibsappbsvpoapproval.controller.Detail", {
            formatter: formatter,
            onInit: function () {
                that = this;
               // 

               sapModel = that.getOwnerComponent().getModel("ZIDEAL_ODATA_SALESORDER_SRV");
               PropertyModel = that.getOwnerComponent().getModel("PropertyModel");

                this.getView().byId("idFullSc").setIcon("sap-icon://full-screen");
                // BusyIndicator.hide();
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("Detail").attachPatternMatched(this._onRouteMatched, this);

            },
            onBeforeRebindTable: function (oEvent) {

                var binding = oEvent.getParameter("bindingParams");
                binding.filters = [];
                var oFilter = new sap.ui.model.Filter("PURCHASE_REQUEST_NO", FilterOperator.EQ, prno);
                binding.filters.push(oFilter);
            },
            _onRouteMatched: function (oEvent) {

                //
                // BusyIndicator.hide();

               
                PropertyModel.setProperty("/RequestRateColumn",false);
                that._userdetails();
                // that.readAddress();

                //Refresh smart table
                //  var oView = that.getView().byId("idOrderList")
                //  oView.rebindTable();
                 
            var g = this.getView().getParent().getParent();
            g.toBeginColumnPage(this.getView());


                this.getView().byId("idFullSc").setIcon("sap-icon://full-screen");
                prno = Number(oEvent.getParameters().arguments.PURCHASE_REQUEST_NO)
                // var selectedObject =  that.getOwnerComponent().getModel("RequestModel").getData();

                // var model = new JSONModel(selectedObject);
                // that.getView().setModel(model,"requestModel")

                // var myJSONModel = new JSONModel();
                // myJSONModel.setData(selectedObject);
                // that.getView().setModel(myJSONModel, "requestModel");


                // var RequestNo = Number(oEvent.getParameters().arguments.PO_Number)

                // previousData =that.getOwnerComponent().getModel("orderDetails").getData()


                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);

                url = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/PrHeader?$filter=PURCHASE_REQUEST_NO eq " + prno + "&$expand=TO_STATUS";

                that.readUserMasterEntities(url);
                //    that.readUserMasterEntities2(url);
                that.OpenEvent();

                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url2 = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/PrItems?$filter=PURCHASE_REQUEST_NO eq " + prno + "";
                that.oDataModel = this.getOwnerComponent().getModel();

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
                       

                    },
                    error: function (e) {
                        ////
                        BusyIndicator.hide()
                        MessageBox.error(e.responseText);
                    }
                });






            },


              // added 22-10-2024
      _userdetails:function()
      {

        var url;
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);
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
                            UserData = data;
                            // data = JSON.parse(data);
                            that.readAddress(login_ID)
                            that.readgetUserAttributes();
                        },
                        error: function (oError) {
                            
                        }
                    });
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
                // Role = data.d.results[1]  // 'BSV_CFA'

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

            readUserMasterEntities: function (url) {
                //
                BusyIndicator.show(0);

                $.ajax({
                    url: url,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, responce) {
                        //
                        BusyIndicator.hide();
                        if (data.d.results[0].STATUS === 1) {

                            // that.getView().byId("idSAPDocumentNumber").setVisible(false);
                            that.getView().byId("idsapdoc").setVisible(false);
                            // that.getView().byId("idreference").setVisible(false);
                        }
                        else if (data.d.results[0].STATUS === 2) {

                            // that.getView().byId("idSAPDocumentNumber").setVisible(true);
                            that.getView().byId("idsapdoc").setVisible(true);
                            // that.getView().byId("idreference").setVisible(true);
                        }
                        if (data.d.results[0].ORDER_TYPE === 1) {
                            PropertyModel.setProperty("/RequestRateColumn",false);
                        }
                        else if (data.d.results[0].ORDER_TYPE === 3) {
                            PropertyModel.setProperty("/RequestRateColumn",true);
                        }
                        var model = new JSONModel(data);
                        that.getView().setModel(model, "stockistDetails");

                    },
                    error: function (e) {
                        //
                        BusyIndicator.hide();
                        MessageBox.error(e.responseText);
                    }
                });
            },
            onFullScreen: function () {

                if (this.getView().getModel("appView").getProperty("/layout") == "TwoColumnsMidExpanded") {
                    this.getView().getModel("appView").setProperty("/layout", "MidColumnFullScreen");
                    this.getView().byId("idFullSc").setIcon("sap-icon://exit-full-screen");
                    that.getView().byId("idTotalAmount").addStyleClass("sapUiLargeMarginBegin")
                } else {
                    this.getView().getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
                    this.getView().byId("idFullSc").setIcon("sap-icon://full-screen");
                    that.getView().byId("idTotalAmount").addStyleClass("sapUiTinyMarginBegin")

                }

            },
            onExit: function () {

                this.getView().getModel("appView").setProperty("/layout", "OneColumn");
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("MasterPage"

                );

                // that.getView().byId("sapNO").setVisible(false)
            },
            Content: function () {
                ////
                // BusyIndicator.show();
                // oDataModel.refresh(true);

                var dynamicSideContentState = this.getView().byId("DynamicSideContent").getShowSideContent();
                var iWindowWidth = window.innerWidth;
                if (dynamicSideContentState === true) {
                    this.getView().byId("DynamicSideContent").setShowSideContent(false);
                }
                else {
                    this.getView().byId("DynamicSideContent").setShowSideContent(true);
                    if (iWindowWidth < 600) {
                        this.onMainContent(false);
                    }
                }
            },
            CloseEvent: function (oEvent) {
                this.getView().byId("DynamicSideContent").setShowSideContent(false);

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
            OpenEvent: function () {
                //
                BusyIndicator.show(0);
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                // var filterString = "$filter=PURCHASE_REQUEST_NO eq '" + prno + "' and (EVENT_CODE eq '2' or EVENT_CODE eq '5')";
                // var url = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/PrEventLog?$expand=TO_EVENT_STATUS&" + filterString;

                var url = appModulePath + "/odata/v2/ideal-bsv-purchase-approval-srv/PrEventLog?$expand=TO_EVENT_STATUS&$filter=PURCHASE_REQUEST_NO eq " + prno + "";

                $.ajax({
                    url: url,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, responce) {
                        ////
                        BusyIndicator.hide();

                        // var comment = data.d.results[0].COMMENTS
                        var index = data.d.results.length-1
                        var comment = data.d.results[index].COMMENTS
                        if(comment)
                        {
                        PropertyModel.setProperty("/RemarkSection",true);
                        }
                        else if(comment === '')
                        {
                            PropertyModel.setProperty("/RemarkSection",false);
                        }

                        
                    //Comment Model
                    var com = new JSONModel(data.d.results[index]);
                    that.getView().setModel(com, "com");
                       
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

            readAddress:function(login_ID)
            {
                    // BusyIndicator.show(0);
                    // var ShipTo = "101486"
                    var shipFrom = login_ID
                // var filter = new Filter("ShipTo","EQ",ShipTo);
                var filter2 = new Filter("ShipFrom","EQ",shipFrom);
                sapModel.read("/ADDRESSSet",{
                    
                    filters: [filter2],
                    success:function(Data,response)
                    {
                        // BusyIndicator.hide();
                        var model = new JSONModel(Data.results[0]);
                        that.getView().setModel(model,"address");
                    },
                    error:function(Error)
                    {
                        // BusyIndicator.hide();
                        MessageBox.error(Error.responseText);
                    }
          
                });
            },



            printReq: function () {
                //
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                // var surl = appModulePath + "/odata/v4/ideal-purchase-creation-srv/CreatePurchase"
                var tabeldata = this.getView().getModel("itemsModel").getData();
                var headerData = this.getView().getModel("stockistDetails").getData();
                var AddressData = this.getView().getModel("address").getData();
                sessionStorage.setItem("itemsModel", JSON.stringify(tabeldata));
                sessionStorage.setItem("stockistDetails", JSON.stringify(headerData));
                sessionStorage.setItem("address", JSON.stringify(AddressData));
                // window.open("https://port8080-workspaces-ws-f2dfm.us10.applicationstudio.cloud.sap/print.html?PR_NO="  + prno )
                window.open(appModulePath + "/print.html?PR_NO=" + prno)
                // window.open( surl + "/print.html?PR_NO=" + prno);
            },
            onViewEventOpen: function () {
                var dynamicSideContentState = that.getView().byId("DynamicSideContent").getShowSideContent();
                if (dynamicSideContentState === true) {
                    that.getView().byId("DynamicSideContent").setShowSideContent(false);
                }
                else {
                    that.getView().byId("DynamicSideContent").setShowSideContent(true);
                }
            },
            onViewEventHide: function () {
                that.getView().byId("DynamicSideContent").setShowSideContent(false);
            },
          
            

            
            
            onSelectSpecialRate: function(oEvent) {
                // Get the checkbox control
                var table = that.getView().byId("idMTable")
                var items = table.getItems();
                var selectedObject = oEvent.getSource().getBindingContext("itemsModel").getObject()
               
              var selectedIndex =  oEvent.getSource().getBindingContext("itemsModel").sPath.split("/")[1]
                var oCheckBox = oEvent.getSource();
                // Get the parent ListItem (the row)
                var oListItem = oCheckBox.getParent();
            
                // Get the controls for Request Rate, From Date, and To Date columns
                var oRequestRateInput = oListItem.getCells()[10]; // Adjust the index as per your table
                var oFromDate = oListItem.getCells()[11];
                var oToDate = oListItem.getCells()[12];
            
                // Determine if the checkbox is selected
                // table.getItems()[0].mAggregations.cells[10].mProperties.visible(true)
                // table.getItems()[0].mAggregations.cells[11].mProperties.visible(true)
                // table.getItems()[0].mAggregations.cells[12].mProperties.visible(true)
                var bSelected = oCheckBox.getSelected();

                if(bSelected === true)
                    {
            

                // Toggle visibility and editability of the columns based on checkbox state
                oRequestRateInput.setVisible(bSelected);
                that.getView().byId("idReRate").setVisible(true)
                that.getView().byId("idFromDat").setVisible(true)
                that.getView().byId("idToDat").setVisible(true)
                oRequestRateInput.setEditable(bSelected);
                oFromDate.setVisible(bSelected);
                oFromDate.setEditable(bSelected);
                oToDate.setVisible(bSelected);
                oToDate.setEditable(bSelected);

                // table.getItems()[0].mAggregations.cells[10].mProperties.visible(true)
                // table.getItems()[0].mAggregations.cells[11].mProperties.visible(true)
                // table.getItems()[0].mAggregations.cells[12].mProperties.visible(true)
                }
                else if(bSelected === false)
                    {
                          // Toggle visibility and editability of the columns based on checkbox state

                          that.getView().byId("idReRate").setVisible(false)
                          that.getView().byId("idFromDat").setVisible(false)
                          that.getView().byId("idToDat").setVisible(false)
                oRequestRateInput.setVisible(bSelected);
                oRequestRateInput.setVisible(bSelected).setValue();
                oFromDate.setVisible(bSelected);
                oFromDate.setVisible(bSelected).setValue();
                oToDate.setVisible(bSelected);
                oToDate.setVisible(bSelected).setValue();
                    }
               
                    for(var i =0; i<items.length;i++)
                        {
                            var checkbox = table.getItems()[i].mAggregations.cells[9]
                            if(checkbox.getSelected() === true)
                                {
                                    that.getView().byId("idReRate").setVisible(true)
                                    that.getView().byId("idFromDat").setVisible(true)
                                    that.getView().byId("idToDat").setVisible(true)
                                }
                        }

            
                // Optional: Trigger a re-rendering of the table to ensure correct layout
                this.getView().byId("idMTable").rerender();
                itemsdata = oEvent.getSource().oPropagatedProperties.oModels.itemsModel.oData
                var selectedObject = oEvent.getSource().getBindingContext("itemsModel").getObject()
                for(var i =0; i<itemsdata.length; i++)
                    {
                        // var Material = itemsdata[i].MATERIAL_CODE
                        if(selectedObject.MATERIAL_CODE === itemsdata[i].MATERIAL_CODE)
                        {
                            selectedObject.SPECIAL_ORDER ="X"
                            itemsdata[i].SPECIAL_ORDER ="X"
                        }
                        else{
                            selectedObject.SPECIAL_ORDER ="X"
                        }
                    }
                // var selectedObject = oEvent.getSource().getBindingContext("itemsModel").getObject()
                // selectedObject.SPECIAL_ORDER ="X"; 
                


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
            finalPost: function (UserData,Role) {
                //;
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
                var headerDetails = this.getView().getModel("stockistDetails").getData();
                creationDate = headerDetails.d.results[0].CREATION_DATE
                that.formatDate(creationDate);
                var Events = this.getView().getModel("eventData").getData();
                // Access the table and get the items
                var oTable = this.getView().byId("idMTable");
                var aTableItems = oTable.getItems();
                var firstname = UserData

                // if(Role === "BSV_CFA")
                //     {
                //         var UserRole = "CFA"
                //     }
                // if(UserData.Groups[0] === "BSV_CFA")
                //     {
                //         var UserRole = "CFA"
                //     }

                oPRHeader = {
                    "PURCHASE_REQUEST_NO": headerDetails.d.results[0].PURCHASE_REQUEST_NO,
                    "SAP_SALES_ORDER_NO": null,
                    "CREATION_DATE": isoString,
                    "STOCKIST_ID": headerDetails.d.results[0].STOCKIST_ID,
                    "STOCKIST_NAME": headerDetails.d.results[0].STOCKIST_NAME,
                    "REFERENCE_ID": headerDetails.d.results[0].REFERENCE_ID,
                    "SHIP_TO": headerDetails.d.results[0].SHIP_TO,
                    "SHIP_NAME": headerDetails.d.results[0].SHIP_NAME,
                    "SHIP_FROM": headerDetails.d.results[0].SHIP_FROM,
                    "SHIP_FROM_NAME": headerDetails.d.results[0].SHIP_FROM_NAME,
                    "PAYMENT_METHOD_CODE": headerDetails.d.results[0].PAYMENT_METHOD_CODE,
                    "PAYMENT_METHOD_DESCRIPTION": headerDetails.d.results[0].PAYMENT_METHOD_DESCRIPTION,
                    "STATUS": 1,
                    "LAST_UPDATED_DATE": "2024-06-03T07:09:49.069Z",
                    "NOTIFICATION_IDS": "CFAtest@gmail.com",
                    "TOTAL_AMOUNT": headerDetails.d.results[0].TOTAL_AMOUNT,
                    "TAXES_AMOUNT": headerDetails.d.results[0].TAXES_AMOUNT,
                    "TCS_AMOUNT": headerDetails.d.results[0].TCS_AMOUNT,
                    "GRAND_TOTAL": headerDetails.d.results[0].GRAND_TOTAL
                };

                for (var i = 0; i < aTableItems.length; i++) {
                    var oTableItem = aTableItems[i];
                    var oItem = oTableItem.getBindingContext("itemsModel").getObject();
                    if(oItem.REQUEST_RATE === "")
                        {
                            oItem.REQUEST_RATE = "0.00"
                        } //added 07-11-2024
                    // Get cell positions
                    var oRequestRateInput = oTableItem.getCells()[8]; // Assuming REQUEST_RATE input is in the 9th cell (index 8)
                    var oFromDatePicker = oTableItem.getCells()[9]; // Assuming FROM_DATE DatePicker is in the 10th cell (index 9)
                    var oToDatePicker = oTableItem.getCells()[10]; // Assuming TO_DATE DatePicker is in the 11th cell (index 10)

                    // Calculate base amount
                    var baseAmount = Number(oItem.NIR_PRICE) * Number(oItem.ORDER_QUANTITY);

                    // Calculate total tax percentage
                    var totalTaxPercentage = Number(oItem.SGST_PERCENTAGE) + Number(oItem.CGST_PERCENTAGE);

                    // Calculate tax amount
                    var taxAmount = (baseAmount * totalTaxPercentage) / 100;
                    var TotalAmt = baseAmount + taxAmount;
                    var TotlAmt = parseFloat(TotalAmt).toFixed(2);

                    var from =  parseInt((oItem.FROM_DATE).match(/\d+/)[0], 10);
                    var fDate = new Date(from);
                    var fromdate = fDate.toLocaleDateString('en-GB'); // 'en-GB' for DD/MM/YYYY format

                    var parts = fromdate.split("/"); // Split the date string into day, month, and year
                    var FromformattedDate = parts[2] + "-" + parts[1] + "-" + parts[0]; // Rearrange to YYYY-MM-DD

                    

                    var ToDate =  parseInt((oItem.TO_DATE).match(/\d+/)[0], 10);
                    var TDate = new Date(ToDate);
                    var ToDateEndDate = TDate.toLocaleDateString('en-GB'); // 'en-GB' for DD/MM/YYYY format

                    var parts = ToDateEndDate.split("/"); // Split the date string into day, month, and year
                    var ToDate = parts[2] + "-" + parts[1] + "-" + parts[0]; // Rearrange to YYYY-MM-DD


                    // Create item object with static values and dynamically update the necessary fields
                    oPRItems = {
                        "MATERIAL_CODE": oItem.MATERIAL_CODE,
                        "MATERIAL_DESC": oItem.MATERIAL_DESC,
                        "HSN_CODE": oItem.HSN_CODE,
                        "UNIT_OF_MEASURE": oItem.UNIT_OF_MEASURE,
                        "ORDER_QUANTITY": Number(oItem.ORDER_QUANTITY),
                        "SCHEME_APPLIED": oItem.SCHEME_APPLIED,
                        "MRP_PRICE": oItem.MRP_PRICE,
                        "NIR_PRICE": oItem.NIR_PRICE,
                        "TOTAL_AMOUNT": TotlAmt,
                        "CGST_PERCENTAGE": oItem.CGST_PERCENTAGE,
                        "CGST_AMOUNT": oItem.CGST_AMOUNT,
                        "SGST_PERCENTAGE": oItem.SGST_PERCENTAGE,
                        "SGST_AMOUNT": oItem.SGST_AMOUNT,
                        "IGST_PERCENTAGE": oItem.IGST_PERCENTAGE,
                        "IGST_AMOUNT": oItem.IGST_AMOUNT,
                        "TAXES_AMOUNT": oItem.TAXES_AMOUNT,
                        "FREEGOODS": oItem.FREEGOODS,
                        "SPECIAL_ORDER": oItem.SPECIAL_ORDER,
                        "PURCHASE_REQUEST_NO": oItem.PURCHASE_REQUEST_NO,
                        "ITEM_NO": 1, // Ensure ITEM_NO is unique
                        "REQUEST_RATE": oItem.REQUEST_RATE, // Dynamically get REQUEST_RATE
                        "FROM_DATE": FromformattedDate, // Dynamically get FROM_DATE
                        "TO_DATE": ToDate // Dynamically get TO_DATE
                    };

                    aPRItems.push(oPRItems);
                }

                oEvents = {
                    "PURCHASE_REQUEST_NO": Events.d.results[0].PURCHASE_REQUEST_NO,
                    "EVENT_NO": 1,
                    "EVENT_CODE": "1",
                    "USER_ID": UserData.email,
                    "USER_ROLE": Role,
                    "USER_NAME": headerDetails.d.results[0].SHIP_FROM_NAME,
                    "COMMENTS": Events.d.results[0].COMMENTS,
                    "CREATION_DATE": isoString
                };

                aPRHeader.push(Object.assign({}, oPRHeader));
                aEvents.push(Object.assign({}, oEvents));

                var payload = {
                    "sAction": "APPROVE",
                    "aPrHeader": aPRHeader,
                    "aPrItems": aPRItems,
                    "aPrEvent": aEvents,
                    "oUserDetails": {
                        "USER_ROLE": Role,
                        "USER_ID": UserData.email,
                        "USER_NAME": headerDetails.d.results[0].SHIP_FROM_NAME,
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
                        MessageBox.success(result.d.CreatePurchase.OUT_SUCCESS, {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (oAction) {
                                if (oAction === 'OK') {
                                    ;
                                    that.getView().getModel("appView").setProperty("/layout", "OneColumn");
                                    var router = sap.ui.core.UIComponent.getRouterFor(that);
                                    router.navTo("MasterPage");
                                }
                            }
                        });
                        // var router = sap.ui.core.UIComponent.getRouterFor(that);
                        // router.navTo("RouteMaster");
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
            },
            onChangeRequestRate:function(oEvent)
            {
                
                var entertedRequestRate = oEvent.getSource().getValue();

                itemsdata = oEvent.getSource().oPropagatedProperties.oModels.itemsModel.oData
                var selectedObject = oEvent.getSource().getBindingContext("itemsModel").getObject()
                selectedObject.REQUEST_RATE = entertedRequestRate;

            },
            onChangeFromDate:function(oEvent)
            {
                
                var selectedFromDate = oEvent.getSource().getValue();
                var fromdate = new Date(selectedFromDate);
               var isoFromDate = fromdate.toISOString().split('T')[0];
            //    var vValidFromCon = vValidFrom.toISOString().split('T')[0];

                itemsdata = oEvent.getSource().oPropagatedProperties.oModels.itemsModel.oData
                var selectedObject = oEvent.getSource().getBindingContext("itemsModel").getObject()
                selectedObject.FROM_DATE = isoFromDate;

            },
            onChangeToDate:function(oEvent)
            {
                
                var selectedToDate = oEvent.getSource().getValue();
                var todate = new Date(selectedToDate);
                var isoToDate = todate.toISOString().split('T')[0];

                itemsdata = oEvent.getSource().oPropagatedProperties.oModels.itemsModel.oData
                var selectedObject = oEvent.getSource().getBindingContext("itemsModel").getObject()
                selectedObject.TO_DATE = isoToDate;

            },

            // Open Remark Dialog
            openRemarkDilog: function () {
                if (!this.RemarkDialog) {
                  this.RemarkDialog = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvpoapproval.view.fragments.Remark", this);
                  this.getView().addDependent(this.RemarkDialog);
                }
                that.RemarkDialog.open();
              },
              closeDialog:function()
              {
                that.RemarkDialog.close();
              },

              // on Reject
              onRejectOrder:function()
              {
                that.RejectOrderPost(UserData,Role);
              },
              RejectOrderPost:function(UserData,Role)
              {
                var remak = sap.ui.getCore().byId("idRemark").getValue()
              if(remak === "")
                {
                    sap.ui.getCore().byId("idRemark").setValueState("Error").setValueStateText("Remark is Mandatory to reject sales order")
                }
                else
                {
                BusyIndicator.show();
                that.RemarkDialog.close();
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
                var headerDetails = this.getView().getModel("stockistDetails").getData();
                creationDate = headerDetails.d.results[0].CREATION_DATE
                that.formatDate(creationDate);
                var Events = this.getView().getModel("eventData").getData();
                // Access the table and get the items
                var oTable = this.getView().byId("idMTable");
                var aTableItems = oTable.getItems();
                var firstname = UserData
                // if(Role === "BSV_CFA")
                //     {
                //         var UserRole = "CFA"
                //     }
                // if(UserData.Groups[0] === "BSV_CFA")
                //     {
                //         var UserRole = "CFA"
                //     }

                oPRHeader = {
                    "PURCHASE_REQUEST_NO": headerDetails.d.results[0].PURCHASE_REQUEST_NO,
                    "SAP_SALES_ORDER_NO": null,
                    "CREATION_DATE": isoString,
                    "STOCKIST_ID": headerDetails.d.results[0].STOCKIST_ID,
                    "STOCKIST_NAME": headerDetails.d.results[0].STOCKIST_NAME,
                    "REFERENCE_ID": headerDetails.d.results[0].REFERENCE_ID,
                    "SHIP_TO": headerDetails.d.results[0].SHIP_TO,
                    "SHIP_NAME": headerDetails.d.results[0].SHIP_NAME,
                    "SHIP_FROM": headerDetails.d.results[0].SHIP_FROM,
                    "SHIP_FROM_NAME": headerDetails.d.results[0].SHIP_FROM_NAME,
                    "PAYMENT_METHOD_CODE": headerDetails.d.results[0].PAYMENT_METHOD_CODE,
                    "PAYMENT_METHOD_DESCRIPTION": headerDetails.d.results[0].PAYMENT_METHOD_DESCRIPTION,
                    "STATUS": 1,
                    "LAST_UPDATED_DATE": "2024-06-03T07:09:49.069Z",
                    "NOTIFICATION_IDS": "CFAtest@gmail.com",
                    "TOTAL_AMOUNT": headerDetails.d.results[0].TOTAL_AMOUNT,
                    "TAXES_AMOUNT": headerDetails.d.results[0].TAXES_AMOUNT,
                    "TCS_AMOUNT": headerDetails.d.results[0].TCS_AMOUNT,
                    "GRAND_TOTAL": headerDetails.d.results[0].GRAND_TOTAL
                };

                for (var i = 0; i < aTableItems.length; i++) {
                    var oTableItem = aTableItems[i];
                    var oItem = oTableItem.getBindingContext("itemsModel").getObject();
                    if(oItem.REQUEST_RATE === "")
                        {
                            oItem.REQUEST_RATE = "0.00"
                        } 
                 
        
                    // Calculate base amount
                    var baseAmount = Number(oItem.NIR_PRICE) * Number(oItem.ORDER_QUANTITY);

                    // Calculate total tax percentage
                    var totalTaxPercentage = Number(oItem.SGST_PERCENTAGE) + Number(oItem.CGST_PERCENTAGE);

                    // Calculate tax amount
                    var taxAmount = (baseAmount * totalTaxPercentage) / 100;
                    var TotalAmt = baseAmount + taxAmount;
                    var TotlAmt = parseFloat(TotalAmt).toFixed(2);

                    var from =  parseInt((oItem.FROM_DATE).match(/\d+/)[0], 10);
                    var fDate = new Date(from);
                    var fromdate = fDate.toLocaleDateString('en-GB'); // 'en-GB' for DD/MM/YYYY format

                    var parts = fromdate.split("/"); // Split the date string into day, month, and year
                    var FromformattedDate = parts[2] + "-" + parts[1] + "-" + parts[0];

                    var remark = sap.ui.getCore().byId("idRemark").getValue();

                    var ToDate =  parseInt((oItem.TO_DATE).match(/\d+/)[0], 10);
                    var TDate = new Date(ToDate);
                    var ToDateEndDate = TDate.toLocaleDateString('en-GB');

                    var parts = ToDateEndDate.split("/");
                    var ToDate = parts[2] + "-" + parts[1] + "-" + parts[0];
                    oPRItems = {
                        "MATERIAL_CODE": oItem.MATERIAL_CODE,
                        "MATERIAL_DESC": oItem.MATERIAL_DESC,
                        "HSN_CODE": oItem.HSN_CODE,
                        "UNIT_OF_MEASURE": oItem.UNIT_OF_MEASURE,
                        "ORDER_QUANTITY": Number(oItem.ORDER_QUANTITY),
                        "SCHEME_APPLIED": oItem.SCHEME_APPLIED,
                        "MRP_PRICE": oItem.MRP_PRICE,
                        "NIR_PRICE": oItem.NIR_PRICE,
                        "TOTAL_AMOUNT": TotlAmt,
                        "CGST_PERCENTAGE": oItem.CGST_PERCENTAGE,
                        "CGST_AMOUNT": oItem.CGST_AMOUNT,
                        "SGST_PERCENTAGE": oItem.SGST_PERCENTAGE,
                        "SGST_AMOUNT": oItem.SGST_AMOUNT,
                        "IGST_PERCENTAGE": oItem.IGST_PERCENTAGE,
                        "IGST_AMOUNT": oItem.IGST_AMOUNT,
                        "TAXES_AMOUNT": oItem.TAXES_AMOUNT,
                        "FREEGOODS": oItem.FREEGOODS,
                        "SPECIAL_ORDER": oItem.SPECIAL_ORDER,
                        "PURCHASE_REQUEST_NO": oItem.PURCHASE_REQUEST_NO,
                        "ITEM_NO": 1, // Ensure ITEM_NO is unique
                        "REQUEST_RATE": oItem.REQUEST_RATE, // Dynamically get REQUEST_RATE
                        "FROM_DATE": FromformattedDate, // Dynamically get FROM_DATE
                        "TO_DATE": ToDate // Dynamically get TO_DATE
                    };

                    aPRItems.push(oPRItems);
                }

                oEvents = {
                    "PURCHASE_REQUEST_NO": Events.d.results[0].PURCHASE_REQUEST_NO,
                    "EVENT_NO": 1,
                    "EVENT_CODE": "1",
                    "USER_ID": UserData.email,
                    "USER_ROLE": Role,
                    "USER_NAME": headerDetails.d.results[0].SHIP_FROM_NAME,
                    "COMMENTS":remark,
                    "CREATION_DATE": isoString
                };

                aPRHeader.push(Object.assign({}, oPRHeader));
                aEvents.push(Object.assign({}, oEvents));

                var payload = {
                    "sAction": "REJECT",
                    "aPrHeader": aPRHeader,
                    "aPrItems": aPRItems,
                    "aPrEvent": aEvents,
                    "oUserDetails": {
                        "USER_ROLE": Role,
                        "USER_ID": UserData.email,
                        "USER_NAME": headerDetails.d.results[0].SHIP_FROM_NAME,
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
                        // ;
                        BusyIndicator.hide();
                        MessageBox.success(result.d.CreatePurchase.OUT_SUCCESS, {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (oAction) {
                                if (oAction === 'OK') {
                                    // ;
                                    sap.ui.getCore().byId("idRemark").setValue()
                                    that.getView().getModel("appView").setProperty("/layout", "OneColumn");
                                    var router = sap.ui.core.UIComponent.getRouterFor(that);
                                    router.navTo("MasterPage");
                                }
                            }
                        });
                    },
                    error: function (oError) {
                        // ;
                        BusyIndicator.hide();
                        var oXMLMsg, oXML;
                        if ((oError.responseText)) {
                            oXML = JSON.parse(oError.responseText);
                            oXMLMsg = oXML.error["message"];
                        } else {
                            oXMLMsg = oError.responseText;
                        }
                        MessageBox.error(oXMLMsg.value);
                        
                    }
                });

            }

              },
              onChangeRemark:function(oEvent)
              {
                var sValue = oEvent.getSource().getValue();
                if(sValue)
                {
                    sap.ui.getCore().byId("idRemark").setValueState("None")
                }
              }


        });
    });
