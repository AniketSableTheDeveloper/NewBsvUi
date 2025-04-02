sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "com/ibs/bsv/ibsappbsvorderstatus/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
function (Controller,JSONModel,MessageBox,BusyIndicator,formatter,Filter,FilterOperator) {
    "use strict";
    var that;
    var localmodel, oProductModel;
    var prno, url
    var Role;
    var sapModel;
    var selectedSchemeCode
    var stockist;
    var ordertype
    var SapNo;
    var PropertyModel;
    var MaterialCode
    var ShipTo
    var ShipFrom
    var Order_Type
    var UserData;
    var MinQty
    var comment
    var checkOrdQtyFlag = 0;
    return Controller.extend("com.ibs.bsv.ibsappbsvorderstatus.controller.Detail", {
        formatter : formatter,
        onInit: function () {
            that = this;
            //

            sapModel = that.getOwnerComponent().getModel("ZIDEAL_ODATA_SALESORDER_SRV");
            PropertyModel = that.getOwnerComponent().getModel("PropertyModel");
       
            // BusyIndicator.hide();
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Detail").attachPatternMatched(this._onRouteMatched, this);

        },
        _onRouteMatched: function (oEvent) {
            
           // 
           that.checkDevice();
            BusyIndicator.hide();
            PropertyModel.setProperty("/RemarkTextValueState","None");
            // stockist = "101486"
            that.readAddress();
            that.readStatusCountbyOrderType();
             
             var oView = that.getView().byId("idOrderList")
           
            this.getView().byId("idFullSc").setIcon("sap-icon://full-screen");
            prno = Number(oEvent.getParameters().arguments.PURCHASE_REQUEST_NO)
        
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);

            url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrHeader?$filter=PURCHASE_REQUEST_NO eq " + prno + "&$expand=TO_STATUS";

            that._userdetails();
           that.readUserMasterEntities(url);
        //    that.readCallMaterial();
           that.readLineItems();
             //    that.readUserMasterEntities2(url);
           that.OpenEvent();
           that.CommentEvent();
           PropertyModel.setProperty("/DeleteButton",false);
           PropertyModel.setProperty("/CancelButton",false);
           PropertyModel.setProperty("/SaveButton",false);
           PropertyModel.setProperty("/OrderQtyInput",false);
           PropertyModel.setProperty("/RequestInput",false);
           PropertyModel.setProperty("/addButton",false);
           PropertyModel.setProperty("/RequestRateColumn",false);
           PropertyModel.setProperty("/REQUEST_VS","None");
           PropertyModel.setProperty("/SaveButtonEnable",true);
           PropertyModel.setProperty("/RemarkSection",false);
           PropertyModel.setProperty("/RemarkTextArea",false);
        },


         // added 22-10-2024
      _userdetails:function()
      {

        var url;
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);
                url = appModulePath + "/user-api/attributes";


                            //   var login_ID = "101486";
                            // //  UserData = data
                            // that.readCallMaterial(login_ID); //when locally

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: url,
                        type: 'GET',
                        contentType: 'application/json',
                        success: function (data, response) {
                            ;
                           var login_ID = data.name // fetching login_name value to name property
                            // login_ID = data.login_name[0]; // commented on 26-11-2024 
                            UserData = data
                            // data = JSON.parse(data);
                            // var table = that.getView().byId("idPurchTable");
                            // table.rebindTable();
                            that.readCallMaterial(login_ID);
                            that.readgetUserAttributes();

                        },
                        error: function (oError) {
                            
                        }
                    });
                });



      },
        readLineItems:function(aResults)
        {
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            var url2 = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrItems?$filter=PURCHASE_REQUEST_NO eq " + prno + "";
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
                     item.isEditable = item.FREEGOODS !== "X"; // Editable if Freegoods is not "X"
                     item.REQUEST_VS = 'None'; // Editable if Freegoods is not "X"
                     
                 });
                    tableitems.setSizeLimit(data.d.results.length);
                    that.getView().setModel(tableitems, "itemsModel");
                 
                    if(data.d.results.length === 0)
                    {
                        PropertyModel.setProperty("/SaveButtonEnable",false);
                        MessageBox.information("In order to save details, please add product");
                    }
                    else if(data.d.results.length != 0)
                    {
                        PropertyModel.setProperty("/SaveButtonEnable",true);
                    }

                    var count = data.d.results.length;
                    PropertyModel.setProperty("/count","Products("+count+")")
    

                    that.getView().getModel("itemsModel").refresh(true);
                    

                },
                error: function (e) {
                    //
                    BusyIndicator.hide()
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
                   var selectedObject = data.d.results[0];
                    ordertype = data.d.results[0].ORDER_TYPE;
                    ShipFrom = data.d.results[0].SHIP_FROM;
                    stockist = data.d.results[0].STOCKIST_ID;

                    if(data.d.results[0].STATUS === 1 || data.d.results[0].STATUS === 3 || data.d.results[0].STATUS === 4)
                    {
                        that.getView().byId("idStstusSection").setVisible(false) //added instead of processflow
                    }
                    else if(data.d.results[0].STATUS === 2)
                    {
                        that.getView().byId("idStstusSection").setVisible(true) ////added instead of processflow
                    }  //added 07-11-2024


                    if(ordertype === 1)
                        {
                            SapNo = data.d.results[0].SAP_SALES_ORDER_NO
                            PropertyModel.setProperty("/EditButton",true);
                            PropertyModel.setProperty("/RequestRateColumn",false);
                        }
                    else if(ordertype === 3)
                        {
                            SapNo = null
                            PropertyModel.setProperty("/EditButton",false);
                            PropertyModel.setProperty("/RequestRateColumn",true);
                        }
                    if(data.d.results[0].STATUS ===1){

                        
                        that.getView().byId("idsapdoc").setVisible(false);
                        PropertyModel.setProperty("/EditButton",true);


                     
                    }
                    else if(data.d.results[0].STATUS === 4)
                    {
                        that.getView().byId("idsapdoc").setVisible(false);
                        PropertyModel.setProperty("/EditButton",false);
                    }
                    else if(data.d.results[0].STATUS ===2 && data.d.results[0].SAP_SALES_ORDER_NO != "SPECIAL"){
                        that.getView().byId("idsapdoc").setVisible(true);
                        PropertyModel.setProperty("/EditButton",false);
                    }
                    else if(data.d.results[0].SAP_SALES_ORDER_NO === "SPECIAL"){

                        that.getView().byId("idsapdoc").setVisible(false);
                        PropertyModel.setProperty("/EditButton",false);
                        
                    }
                    // else if(data.d.results[0].SAP_SALES_ORDER_NO != "SPECIAL"){

                    //     // that.getView().byId("idsapdoc").setVisible(false);
                    //     that.getView().byId("idSpecialOrderText2").setVisible(false);
                    //     that.getView().byId("idSpecialOrderText2").setVisible(false);
                       
                    // }
                    var model = new JSONModel(data);
                    that.getView().setModel(model,"stockistDetails");
                    that.readStatus();
                    if(selectedObject.SAP_SALES_ORDER_NO != "SPECIAL" && selectedObject.SAP_SALES_ORDER_NO != null && selectedObject.SAP_SALES_ORDER_NO != "" && selectedObject.SAP_SALES_ORDER_NO!= undefined)
                        {
                              that._toupdateBSVOrderNo(selectedObject);
                        }
                        // if(selectedObject.SAP_SALES_ORDER_NO === "SPECIAL")
                        // {
                        //     that.getView().getModel("stockistDetails").setProperty("/d/results/0/TO_STATUS/DESC", "Under Process");
                            
                         
                        // }
                    // that._toupdateBSVOrderNo(selectedObject);

                },
                error: function (e) {
                    //
                    BusyIndicator.hide();
                    MessageBox.error(e.responseText);
                }
            });
        },
        ProductOnserch: function (oEvent) {
            
            var sQuery = oEvent.getSource().getValue();
            var pFilter = [];
            if (sQuery) {
              var oFilter1 = [new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.Contains, sQuery),
              new sap.ui.model.Filter("MaterialDesc", sap.ui.model.FilterOperator.Contains, sQuery)];
              var allFilters = new sap.ui.model.Filter(oFilter1, false);
              pFilter.push(allFilters);
            }
            var listItem = sap.ui.getCore().byId("contactcntry_listId");
            var item = listItem.getBinding("items");
            item.filter(pFilter);
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


            var arrayitems = that.getView().getModel("itemsModel").getData();

                   for(var i = 0; i<arrayitems.length;i++)
                    {
                        var SO = arrayitems[i].SPECIAL_ORDER;
                        if(SO === "X")
                            {
                                that.getView().byId("idItemsTable").getItems()[i].addStyleClass("highlightedRowforSpecial");
                  
                            }
                    }

            this.getView().getModel("appView").setProperty("/layout", "OneColumn");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMaster"
             
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
                if(iWindowWidth < 600){
                    this.onMainContent(false);
                }
            }
        },
        CloseEvent: function (oEvent) {
            this.getView().byId("DynamicSideContent").setShowSideContent(false);

        },
        OpenEvent :function (){
            //
            BusyIndicator.show(0);
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            var url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrEventLog?$expand=TO_EVENT_STATUS&$filter=PURCHASE_REQUEST_NO eq " + prno + "";
            // var url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrEventLog?$expand=TO_EVENT_STATUS" +"&$filter=PURCHASE_REQUEST_NO eq '" + prno + "' and (EVENT_CODE eq '1' or EVENT_CODE eq '3' or EVENT_CODE eq '4')";
            $.ajax({
                url: url,
                type: 'GET',
                data: null,
                contentType: 'application/json',
                success: function (data, responce) {
                    ////
                    BusyIndicator.hide();
                   
                    //Event model 
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

        // for comment
        CommentEvent :function (){
            //
            BusyIndicator.show(0);
            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            // var url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrEventLog?$expand=TO_EVENT_STATUS&$filter=PURCHASE_REQUEST_NO eq " + prno + "";
            var url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrEventLog?$expand=TO_EVENT_STATUS" +"&$filter=PURCHASE_REQUEST_NO eq '" + prno + "' and (EVENT_CODE eq '1' or EVENT_CODE eq '3' or EVENT_CODE eq '4')";
            $.ajax({
                url: url,
                type: 'GET',
                data: null,
                contentType: 'application/json',
                success: function (data, responce) {
                    ////
                    BusyIndicator.hide();
                  
                    
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

                },
                error: function (e) {
                    ////
                    BusyIndicator.hide()
                    MessageBox.error(e.responseText);
                }
            });
        },


        readAddress:function()
        {
                // BusyIndicator.show(0);
                // var ShipTo = "101486"
                // var shipFrom = "W001"
            // var filter = new Filter("ShipTo","EQ",ShipTo);
            var filter2 = new Filter("ShipFrom","EQ",ShipFrom);
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
        onViewEventOpen:function(){
            var dynamicSideContentState = that.getView().byId("DynamicSideContent").getShowSideContent();
            if (dynamicSideContentState === true) {
                that.getView().byId("DynamicSideContent").setShowSideContent(false);
            }
            else {
                that.getView().byId("DynamicSideContent").setShowSideContent(true); 
            }
        },
        onViewEventHide: function(){
            that.getView().byId("DynamicSideContent").setShowSideContent(false);
        },


        
            // read readStatusCountbyOrderType

            readStatusCountbyOrderType: function (aFilter, url, sType) {
                // 
                BusyIndicator.show(0);

                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                url = appModulePath + "/odata/v4/ideal-bsv-purchase-order-srv/StockistOrderCount?$filter=STOCKIST_ID eq '" + stockist + "'";



                $.ajax({
                    url: url,
                    type: 'GET',
                    data: null,
                    contentType: 'application/json',
                    success: function (data, responce) {
                        BusyIndicator.hide();


                        var processedData = [];
data.value.forEach(function(item, index) {
    var newItem = {
        id: index.toString(),
        icon: (item.ORDER_TYPE_COUNT === "3") ? "sap-icon://order-status" : "sap-icon://payment-approval",
        label: (item.ORDER_TYPE_COUNT === "3") ? "In Order" : "In Invoice",
        position: index,
        stockistId: item.STOCKIST_ID,
        stockistName: item.STOCKIST_NAME,
        description: item.DESC || "No Description",
        state: [
            {
                state:"Positive", // Example logic for state
                value: 10  // You can assign any value or remove this if not needed
            }
        ]
    };
    processedData.push(newItem);
});

var model = new JSONModel({ lanes: processedData });
that.getView().setModel(model, "orderstatus");

                            
        // var processedData = [];
        // data.value.forEach(function(item, index) {
        //     var newItem = {
        //         id: index.toString(),
        //         icon: (item.ORDER_TYPE_COUNT === "3") ? "sap-icon://order-status" : "sap-icon://payment-approval",
        //         label: (item.ORDER_TYPE_COUNT === "3") ? "In Order" : "In Invoice",
        //         position: index,
        //         stockistId: item.STOCKIST_ID,
        //         stockistName: item.STOCKIST_NAME,
        //         description: item.DESC || "No Description", 
        //     };
        //     processedData.push(newItem);
        // });
        // var model = new JSONModel({ lanes: processedData });
        // that.getView().setModel(model, "orderstatus");

      

                    },
                    error: function (e) {
                        //
                        BusyIndicator.hide();
                        MessageBox.error(e.responseText);
                    }
                });
            },
          
        
            readStatus: function() {
                BusyIndicator.show(0);
                if(ordertype != null)
                {
                    var sOrderType = (ordertype).toString();
                }
                // var sOrderType = (ordertype).toString();
                var aFilters = [];
                
                var filter = new Filter("OrderType", "EQ", sOrderType);
                if (SapNo!="" || SapNo!= null|| SapNo != undefined) {
                    var filter2 = new Filter("SapNo", "EQ", SapNo);
                }
            
                sapModel.read("/STATUSSet", {
                    filters: [filter, filter2],
                    success: function(Data, response) {
                        BusyIndicator.hide();
                        for (var i = 0; i < Data.results.length; i++) {
                            Data.results[i].LANE_ID = i;
                            if (i === 0) {
                                Data.results[i].NODE_ID = 1;
                                var val = 1 + "0";
                                Data.results[i].CHILDREN = [Number(val)];
                            } else {
                                var val = i + "0";
                                Data.results[i].NODE_ID = Number(val);
                                var j = i + 1;
                                var child = j + "0";
                                Data.results[i].CHILDREN = [Number(child)];
                            }
            
                            if (i === Data.results.length - 1) {
                                Data.results[i].CHILDREN = null;
                            }
            
                            // Logic for Ordertype === "1" and SapNo not empty
                            if (sOrderType === "1" && SapNo && SapNo !== "") {
                                if (Data.results[i].StatusCode === "O") {
                                    Data.results[i].state = "Positive"; // Assign Positive state for Order
                                }
                            }
            
                            // Logic for Ordertype === "3" and SapNo is empty
                            if (sOrderType === "3" && (!SapNo || SapNo === "")) {
                                if (Data.results[i].StatusCode === "A") {
                                    Data.results[i].state = "Negative"; // Assign Negative state for StatusCode "A"
                                }
                            }
                        }
            
                        var oModel = new JSONModel(Data.results);
                        that.getView().setModel(oModel, "comm");
                        that.getView().byId("processflow1").setWheelZoomable(true);
                    },
                    error: function(Error) {
                        BusyIndicator.hide();
                        MessageBox.error(Error.responseText);
                    }
                });
            },
            

            determineIcon:function(statusCode) {
                switch (statusCode) {
                    case 'A':
                        return "sap-icon://pending"; // Example for status code 'A'
                    case 'B':
                        return "sap-icon://monitor-payments"; // Example for status code 'B'
                    case 'C':
                        return "sap-icon://payment-approval"; // Example for status code 'C'
                    // Add more cases for different status codes
                    default:
                        return "sap-icon://question-mark"; // Default icon
                }
            },

            mapState:function(statusCode) {
                switch (statusCode) {
                    case 'A':
                        return "Positive";  // Example for 'A' status
                    case 'B':
                        return "Negative";  // Example for 'B' status
                    // Add more cases for different statuses if needed
                    default:
                        return "Neutral";  // Default state
                }
            },
            getChildrenForNode: function(item) {
    // Based on your data structure, return children IDs or an empty array if there are no children
    return item.ChildrenIds || [];  // Assuming backend data has a property with children IDs
},

    _toupdateBSVOrderNo:function(selectedObject)
    {
        // 
        BusyIndicator.show();  
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);
        var surl = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/UpdateSpecialNo"

        var payload ={
            "sAction" : "UPDATE",
            "sSalesOrderNo" : selectedObject.PURCHASE_REQUEST_NO,
            "sSAPNo" : selectedObject.SAP_SALES_ORDER_NO
        }
       var  payloadstring = JSON.stringify(payload)
        $.ajax({
            type: "POST",
            url: surl,
            data: payloadstring,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                
            },
            error: function (oError) {
                // ;
                BusyIndicator.hide();
                MessageBox.error(oError.responseText);
            }
        });
    },

    onClickEdit:function()
    {
        // 
       var ordertype = that.getView().getModel("stockistDetails").getData().d.results[0].ORDER_TYPE

        PropertyModel.setProperty("/DeleteButton",true);
        PropertyModel.setProperty("/EditButton",false);
        PropertyModel.setProperty("/SaveButton",true);
        PropertyModel.setProperty("/CancelButton",true);
        PropertyModel.setProperty("/OrderQtyInput",true);
        
        PropertyModel.setProperty("/addButton",true);

        if(ordertype === 3)
        {
            PropertyModel.setProperty("/RequestInput",true);
           
        }
        else if(ordertype === 1)
        {
            PropertyModel.setProperty("/RequestInput",false);
        }
        if(comment)
        {
            PropertyModel.setProperty("/RemarkTextArea",true);
        }
        else
        {
            PropertyModel.setProperty("/RemarkTextArea",false);
        }
    },

    onClickCancel:function(oEvent)
    {
        PropertyModel.setProperty("/DeleteButton",false);
        PropertyModel.setProperty("/RemarkTextArea",false);
        PropertyModel.setProperty("/EditButton",true);
        PropertyModel.setProperty("/SaveButton",false);
        PropertyModel.setProperty("/CancelButton",false);
        PropertyModel.setProperty("/OrderQtyInput",false);
        PropertyModel.setProperty("/RequestInput",false);
        PropertyModel.setProperty("/addButton",false);
        PropertyModel.setProperty("/SaveButtonEnable",true);
        PropertyModel.setProperty("/RemarkTextValueState","None");
        var aTableModel = that.getView().getModel("itemsModel").getData();
        for(var i =0; i<aTableModel.length; i++)
            {
               
                if(oEvent.getSource().getId().includes("Cancel") === true)
                {
                    that.getView().getModel("itemsModel").setProperty("/" + aTableModel[i].REQUEST_RATE +"REQUEST_VS","None")

    
                }
            
            }
            that.readLineItems();
            that.OpenEvent();
            that.CommentEvent();
            that.readUserMasterEntities(url);

    },

    // onDelete: function (oEvent) {
    //     var that = this;
    //     MessageBox.information("Are you sure you want to delete the Product?", {
    //         actions: [MessageBox.Action.YES, MessageBox.Action.NO],
    //         onClose: function (Action) {
    //             if (Action === MessageBox.Action.YES) {
    //                 var oModel = that.getView().getModel("itemsModel");
    //                 var oData = oModel.getData();
                    
    //                 // Get the selected row's binding context and path
    //                 var oContext = oEvent.getSource().getParent().getBindingContext("itemsModel");
    //                 var sPath = oContext.getPath();
    //                 var nIndex = parseInt(sPath.split("/")[1], 10);
    //                 var selectedRow = oData[nIndex];
                    
    //                 // Construct the DELETE URL using the MATERIAL_CODE
    //                 // var appId = that.getOwnerComponent().getManifestEntry("/sap.app/id");
    //                 // var appPath = appId.replaceAll(".", "/");
    //                 // var appModulePath = jQuery.sap.getModulePath(appPath);
    //                 // var sDeleteUrl = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrItems('" + selectedRow.ITEM_NO + "')";
                    
    //                 // Send DELETE request to the backend
    //                 $.ajax({
    //                     url: sDeleteUrl,
    //                     type: "DELETE",
    //                     success: function () {
    //                         // Refresh the data by calling readLineItems
    //                         that.readLineItems();
    //                         MessageToast.show("Product deleted successfully.");
    //                     },
    //                     error: function () {
    //                         MessageBox.error("Failed to delete the product. Please try again.");
    //                     }
    //                 });
    //             }
    //         }
    //     });
    // },




    
    
    
    onDelete18: function (oEvent) {
        


        var RequestNo = oEvent.getSource().getBindingContext("itemsModel").getObject().PURCHASE_REQUEST_NO;
        var itemNo = oEvent.getSource().getBindingContext("itemsModel").getObject().ITEM_NO


        // that.deletefn(RequestNo,itemNo);

        MessageBox.information("Are you sure you want to delete the Product?", {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: function (Action) {
            if (Action === "YES") {
              
        that.deletefn(RequestNo,itemNo);
            }
          }
        });
      },

      // Mk 21-10-2024
      onDelete: function (oEvent) {
        MessageBox.information("Are you sure you want to delete the Product?", {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (Action) {
                if (Action === "YES") {
                    var oModel = that.getView().getModel("itemsModel").getData();
                    var selectedProduct = oEvent.getSource().getParent().getBindingContext("itemsModel").getObject().MATERIAL_CODE;
                    var selectedFreeGood = oEvent.getSource().getParent().getBindingContext("itemsModel").getObject().FREEGOODS;
                    
                    // Get the selected row index
                    var aTemp = oEvent.getSource().getParent().getBindingContext("itemsModel").sPath.split("/");
                    var nIndex = Number(aTemp[aTemp.length - 1]);
                    
                    // If there is only one row, clear the whole array
                    if (oModel.length === 1) {
                        oModel = [];
                    } else {
                        // Check if the selected row is a free good or if the next row is a free good of the same material
                        if (selectedFreeGood === "X") {
                            // Remove the selected free good row
                            oModel.splice(nIndex, 1);
                        } else if (oModel[nIndex + 1] && oModel[nIndex + 1].FREEGOODS === "X" && oModel[nIndex + 1].MATERIAL_CODE === selectedProduct) {
                            // Remove associated free good row (next row) if it exists
                            oModel.splice(nIndex + 1, 1); 
                            // Remove the selected row
                            oModel.splice(nIndex, 1);
                        } else {
                            // Remove the selected row
                            oModel.splice(nIndex, 1);
                        }
                    }

                    var count = oModel.length;
                PropertyModel.setProperty("/count","Products("+count+")")
    
                    that.getView().getModel("itemsModel").setData(oModel);
                    that.getView().getModel("itemsModel").refresh(true);
    
                    if (oModel.length === 0) {
                        PropertyModel.setProperty("/SaveButtonEnable", false);
                        MessageBox.information("In order to save details, please add product");
                    } else {
                        PropertyModel.setProperty("/SaveButtonEnable", true);
                    }
    
                    that.calculateheadercalculation();
                }
            }
        });
    },
    



      // 18-10-2024 MK

      onDelete2110: function (oEvent) {
        //
        MessageBox.information("Are you sure you want to delete the Product?", {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: function (Action) {
            if (Action === "YES") {
              var oModel = that.getView().getModel("itemsModel").getData();
              var selectedProduct = oEvent.getSource().getParent().getBindingContext("itemsModel").getObject().MATERIAL_CODE;
              var freegood = oEvent.getSource().getParent().getBindingContext("itemsModel").getModel().oData[1]?.FREEGOODS;
              
              var aTemp = oEvent.getSource().getParent().getBindingContext("itemsModel").sPath.split("/");
              var nIndex = Number(aTemp[aTemp.length-1])
      
              if (oModel.length === 1) {
                // If there is only one row, clear the whole array
                oModel = [];
              } else {
                // Handle deletion for multiple rows
                if (freegood) {
                  oModel.splice(nIndex + 1, 1); // Remove associated free good row
                  oModel.splice(nIndex, 1);     // Remove selected row
                } else {
                  oModel.splice(nIndex, 1);     // Remove selected row
                }
              }
      
              that.getView().getModel("itemsModel").setData(oModel);
              that.getView().getModel("itemsModel").refresh(true);
              if(oModel.length === 0)
                {
                    PropertyModel.setProperty("/SaveButtonEnable",false);
                    MessageBox.information("In order to save details, please add product");
                }
                else if(oModel.length != 0)
                {
                    PropertyModel.setProperty("/SaveButtonEnable",true);
                }

              that.calculateheadercalculation();
            //   that.readUserMasterEntities(url);
            }
          }
        });
      },
      





      onClickAdd:function()
      {
        if (!this.MaterialFragment) {
            this.MaterialFragment = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvorderstatus.view.fragments.material", this);
            this.getView().addDependent(this.MaterialFragment);
            //this._delvrTemp = sap.ui.getCore().byId("delvrTempId").clone();
          }
          that.MaterialFragment.open();
  
      },
      closeContactCountryDialog1: function () {
        //
        this.MaterialFragment.close();
        this.MaterialFragment.destroy();
        this.MaterialFragment = null;
      },

      readCallMaterial: function (login_ID) {

        BusyIndicator.show();
        var StockistID = [];
         var StockistId = login_ID
       
          StockistID.push(new Filter("StockistId", "EQ", StockistId));
        
        // var path = "/MATERIALF4Set?$filter=MatgroupCode eq '"+MaterialGrp+"'";

        // path = encodeURI(path);

        sapModel.read("/MATERIALF4Set", {
          filters: StockistID,
          success: function (Data, response) {
            var MaterialModel = new JSONModel(Data);
            that.getView().setModel(MaterialModel, "Materials");
            BusyIndicator.hide();
          },
          error: function (oError) {
            MessageBox.error(oError.responseText);
            BusyIndicator.hide();
          }

        });
      },


      

      MaterialSelection1: function (oEvent) {
        ;

       
        var selectedObject = oEvent.getSource().getSelectedItem().getBindingContext("Materials").getObject();
        MaterialCode = selectedObject.MaterialCode;
        var productSelected = selectedObject.MaterialDesc;
        // that.getView().byId("id_Item").setValue(productSelected);
        that.closeContactCountryDialog1();
        var price = selectedObject.MRP_PRICE;
        var igstPercentage = selectedObject.IGST_PERC; 
        var quantity = selectedObject.OrderQuantity;
        selectedObject.TOTAL_AMOUNT = (quantity * price) + ((quantity * price) * (igstPercentage / 100));

        // var model = new sap.ui.model.json.JSONModel(temobj);
        // that.getView().setModel(model, "tempmodel");

        Order_Type = that.getView().getModel("stockistDetails").getData().d.results[0].ORDER_TYPE;
       
        // var selectedOrderType = that.getView().byId("idType").getSelectedKey();
    
    if(Order_Type === 1)
      {
        // that.getView().byId("idRequestedRate").setVisible(false);
        that.readCallMaterialScheme(MaterialCode,Order_Type);
      }
    else if(Order_Type === 3)
      {
        // that.getView().byId("idMatScheme").setVisible(false);
        // that.getView().byId("idSchmeComBo").setVisible(false);
        // that.getView().byId("idRequestedRate").setVisible(true);
        MinQty = 1;
        var stockistDetails = that.getView().getModel("stockistDetails").getData().d.results[0]
        ShipTo = stockistDetails.SHIP_TO;
        ShipFrom = stockistDetails.SHIP_FROM;
      that.readPRICESet(MaterialCode,"", ShipTo, ShipFrom,MinQty,null,Order_Type, true);
      }

      },


      readCallMaterialScheme: function (MaterialCode,selectedOrderType) {
        BusyIndicator.show();

        var MaterialGroupCode = [];
        var Objec, array;
        if (MaterialCode != null && MaterialCode != undefined && MaterialCode != "") {
          MaterialGroupCode.push(new Filter("MaterialCode", "EQ", MaterialCode));
        }
        sapModel.read("/SCHEMESet", {
          filters: MaterialGroupCode,
          success: function (Data, response) {

            if(Data.results.length > 0)
              {
                if (!that.schemepopup) {
                  that.schemepopup = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvorderstatus.view.fragments.schemepopup", that);
                  that.getView().addDependent(that.schemepopup);
              }
              that.schemepopup.open();
              }
            // if (Data.results.length === 0 && selectedOrderType === "2") {
             
            // var Schemecode = ""
            //   MinQty = 1
            //   that.readPRICESet(MaterialCode, Schemecode, ShipTo, ShipFrom,MinQty,sPath,Order_Type, true);
            // }
            else if (selectedOrderType === 1) {
              if(Data.results.length === 0)
                {
                MessageBox.information("For selected Product there is no Scheme available", {
                  actions: [MessageBox.Action.OK],
                  emphasizedAction: MessageBox.Action.OK,
                  onClose: function (oAction) {
                      if (oAction === 'OK') {
                          
                          var Schemecode = ""
                          MinQty = 1
                          var stockistDetails = that.getView().getModel("stockistDetails").getData().d.results[0]
                          // MaterialCode = stockistDetails.MATERIAL_CODE;
                          Order_Type = stockistDetails.ORDER_TYPE;
                          ShipTo = stockistDetails.SHIP_TO;
                          ShipFrom = stockistDetails.SHIP_FROM;
                          that.readPRICESet(MaterialCode, Schemecode, ShipTo, ShipFrom,MinQty,null,null);
                         

                      }
                      }
                    
                 
              });
            }
            }
            if (Array.isArray(Data.results)) {
              Data.results.forEach(function (item) {
                // Round Minimumqty and Freeqty to remove decimals
                if (item.Minimumqty !== undefined && item.Minimumqty !== null) {
                  item.Minimumqty = Math.floor(item.Minimumqty);
                }
                if (item.Freeqty !== undefined && item.Freeqty !== null) {
                  item.Freeqty = Math.floor(item.Freeqty);
                }
                item.DisplayText = `MinQty: ${item.Minimumqty} ${item.Minimumqtyuom}, FreeQty: ${item.Freeqty} ${item.Freeqtyuom}`;
              });
            }
            var MaterialSchemeM = new JSONModel(Data);
          
            Objec = {
              array: []
            }
            that.getView().setModel(MaterialSchemeM, "MaterialSchemeModel");
            BusyIndicator.hide();
          },
          error: function (oError) {
            MessageBox.error(oError.responseText);
            BusyIndicator.hide();
          }
        });
      },

      onClickSave:function()
      {

        var table = that.getView().byId("idItemsTable").getItems();
        var ordertype = that.getView().getModel("stockistDetails").getData().d.results[0].ORDER_TYPE;
        var aTableModel = that.getView().getModel("itemsModel").getData();
        var bflag = 0

        // added Mk 21-10-2024
        var hasError = false;

        // Loop through each row in the table
        table.forEach(function(row) {
            // Get the Request Rate input field, assuming it's at the 6th column
            var requestRateInput = row.getCells()[6]; // 0-based index, so 6th column is index 5
    
            // Check if the ValueState is Error
            if (requestRateInput.getValueState() === "Error") {
                hasError = true;
            }
        });
    
        // If there is an error, display the information message
        if (hasError) {
            sap.m.MessageBox.information("Please provide the Request Rate");
        } else {
           

             // End Mk 21-10-2024
        



        if(ordertype === 3)
            {
        for(var i =0; i<aTableModel.length; i++)
        {
           
            if(aTableModel[i].REQUEST_RATE === "" || aTableModel[i].REQUEST_RATE === null || aTableModel[i].REQUEST_RATE === undefined)
            {
                bflag = 1
                // aTableModel[i].REQUEST_RATE

                if(bflag === 1)
                {
                that.getView().getModel("itemsModel").setProperty("/" + i +"/REQUEST_VS","Error")
                that.getView().getModel("itemsModel").setProperty("/" + i +"/REQUEST_VS_Text","Request Rate cannot be empty.")

                // that.getView().getModel("itemsModel").setProperty("/0/REQUEST_VS","Error")

                }
                // // MessageBox.information("Please enter Request Rate")
                // // aTableModel[i].REQUEST_VS = 'Error'
                // that.getView().getModel("itemsModel").setProperty("/" + aTableModel[i].REQUEST_RATE +"REQUEST_VS","Error")
                // // PropertyModel.setProperty("/REQUEST_VS","Error");

            }

        }
        
        }
        if(bflag === 1)
        {
                MessageBox.information("Please provide the Request Rate")
                // aTableModel[i].REQUEST_VS = 'Error'
                // PropertyModel.setProperty("/REQUEST_VS","Error");
        }
        if(that.getView().byId("idRemark").getValueState() ==="Error")
        {
            MessageBox.information("Please enter Remark within range to save order")
        }
        else
        {
        MessageBox.information("Are you sure you want update details ?", {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (Action) {
              if (Action === "YES") {

                that.finalPost(Role);
  
              }
            }
          });
        }
    }
  
      },


      readgetUserAttributes: function () {
        BusyIndicator.show(0);
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);
        var url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/getUserAttributes";
        $.ajax({
            url: url,
            type: 'GET',
            data: null,
            contentType: 'application/json',
            success: function (data, response) {
            
                var model = new JSONModel(data.d.results);
                // Role = data.d.results[1]  // 'BSV_CFA'
                for(var i =0; i<data.d.results.length; i++){

                    if(data.d.results[i] === "BSV_STOCKIST_ROLE"){
                        Role = "STOCKIST";
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

      finalPost:function(Role)
      {

        
        BusyIndicator.show();
                
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);

    
        // var referenceID = that.getView().byId().getValue();
        var surl = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/CreatePurchase"
        // var createdItem = createdData
        var oPRHeader 
        var aPRHeader =[]
        var oPRItems
        var aPRItems =[]
        var oEvents 
        var aEvents =[]
        var date = new Date();
        // var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        var EDate = lastDay.setHours(5,30,0,0);
        var dateEnd = new Date(EDate) 
        var EndDate = dateEnd.toISOString();
        var stockistDetails = that.getView().getModel("stockistDetails").getData().d.results[0]
        var date = that.getView().getModel("stockistDetails").getData().d.results[0].CREATION_DATE;

        var timestamp = parseInt(date.match(/\d+/)[0]);
        // Create a new Date object and convert it to an ISO string
       var isoString = new Date(timestamp)
       var dateS = isoString.toISOString();

        var lineItem = that.getView().getModel("itemsModel").getData();
       
        var Events = that.getView().getModel("eventData").getData().d.results[0];

        var totalAmtFormatted = parseFloat(stockistDetails.TOTAL_AMOUNT).toFixed(2).toString();
        var TotTax = parseFloat(stockistDetails.TAXES_AMOUNT).toFixed(2).toString();
        var GrandTot = parseFloat(stockistDetails.GRAND_TOTAL).toFixed(2).toString();

        var  firstname = UserData.firstname; // 'V.G'
        var  lastname = UserData.lastname;   // 'RAJA'

        var  fullName = firstname + " " + lastname.charAt(0) + lastname.slice(1).toLowerCase();

        // if(Role === "BSV_STOCKIST_ROLE")
        //     {
        //         var UserRole = "STOCKIST"
        //     }
            
        // if(UserData.Groups[0] === "BSV_STOCKIST_ROLE")
        //     {
        //         var UserRole = "STOCKIST"
        //     }
            


        

        // for (var i=0; i<createdItem.temparray.length;i++){

             oPRHeader ={
                "PURCHASE_REQUEST_NO": stockistDetails.PURCHASE_REQUEST_NO,
                "SAP_SALES_ORDER_NO": null,
                "CREATION_DATE": dateS,
                "STOCKIST_ID": stockistDetails.STOCKIST_ID,
                "STOCKIST_NAME": stockistDetails.STOCKIST_NAME,
                "REFERENCE_ID":stockistDetails.REFERENCE_ID,
                "SHIP_TO": stockistDetails.SHIP_TO,
                "SHIP_NAME": stockistDetails.SHIP_NAME,
                "SHIP_FROM": stockistDetails.SHIP_FROM,
                "SHIP_FROM_NAME" : stockistDetails.SHIP_FROM_NAME,
                "ORDER_TYPE": stockistDetails.ORDER_TYPE,
                "PAYMENT_METHOD_CODE": stockistDetails.PAYMENT_METHOD_CODE,
                "PAYMENT_METHOD_DESCRIPTION" : stockistDetails.PAYMENT_METHOD_DESCRIPTION,
                "STATUS": 1,
                "LAST_UPDATED_DATE": "2024-06-03T07:09:49.069Z",
                "NOTIFICATION_IDS": "CFAtest@gmail.com",
                "TOTAL_AMOUNT":totalAmtFormatted,
                "TAXES_AMOUNT":TotTax,
                "TCS_AMOUNT": (stockistDetails.TCS_AMOUNT).toString(),
                "GRAND_TOTAL": GrandTot
            }
            for(var i =0; i<lineItem.length;i++)
                {
                    var totalAmtFormatted = parseFloat(lineItem[i].TOTAL_AMOUNT).toFixed(2).toString();


                // Calculate base amount
                



             oPRItems ={
                "MATERIAL_CODE": lineItem[i].MATERIAL_CODE,
                    "MATERIAL_DESC": lineItem[i].MATERIAL_DESC,
                    "HSN_CODE": lineItem[i].HSN_CODE ,
                    "UNIT_OF_MEASURE": lineItem[i].UNIT_OF_MEASURE,
                    "ORDER_QUANTITY":parseInt(lineItem[i].ORDER_QUANTITY),
                    "SCHEME_APPLIED":lineItem[i].SCHEME_APPLIED,
                    "MRP_PRICE": parseFloat(lineItem[i].MRP_PRICE).toFixed(2),
                    "NIR_PRICE": lineItem[i].NIR_PRICE,
                    "TOTAL_AMOUNT": totalAmtFormatted,
                    "CGST_PERCENTAGE": lineItem[i].CGST_PERCENTAGE,
                    "CGST_AMOUNT": null,
                    "SGST_PERCENTAGE": lineItem[i].SGST_PERCENTAGE,
                    "SGST_AMOUNT": null,
                    "IGST_PERCENTAGE": lineItem[i].IGST_PERCENTAGE,
                    "IGST_AMOUNT": null,
                    "TAXES_AMOUNT": "18",
                    "FREEGOODS":lineItem[i].FREEGOODS,
                    "SPECIAL_ORDER":lineItem[i].SPECIAL_ORDER,
                    "PURCHASE_REQUEST_NO": stockistDetails.PURCHASE_REQUEST_NO,
                    "ITEM_NO": 1,
                    "REQUEST_RATE" : lineItem[i].REQUEST_RATE,
                    "FROM_DATE" : dateS,
                    "TO_DATE" : EndDate,
                    "SCHEMECODE":lineItem[i].SCHEMECODE
            }
            aPRItems.push(oPRItems);

        }
            oEvents ={
                "PURCHASE_REQUEST_NO": 1,
                    "EVENT_NO": 1,
                    "EVENT_CODE": "1",
                    "USER_ID": UserData.email,
                    "USER_ROLE": Role,
                    "USER_NAME": fullName,
                    "COMMENTS": Events.COMMENTS,
                    "CREATION_DATE": dateS
            }

        
        aPRHeader.push(Object.assign({}, oPRHeader));
        // aPRItems.push(Object.assign({}, oPRItems));
        aEvents.push(Object.assign({}, oEvents));
        // }
        var payload ={
            "sAction": "EDIT",
            "aPrHeader": aPRHeader,
            "aPrItems": aPRItems,
            "aPrEvent":aEvents,
            "oUserDetails": {
                "USER_ROLE": Role,
                "USER_ID": UserData.email,
                "USER_NAME":fullName
            }
        
        }
    
       var  payloadstring = JSON.stringify(payload)
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
                            

                            that.getView().getModel("appView").setProperty("/layout", "OneColumn");
                            var router = sap.ui.core.UIComponent.getRouterFor(that);
                            router.navTo("RouteMaster");

                        }
                    }
                });
            },

            error: function (oError) {
                // ;
                BusyIndicator.hide();
                MessageBox.error(oError.responseText);

            }
        });

      },


      // Commented on 18-10-2024

//       priceChange: function (oEvent) {
//         

//         checkOrdQtyFlag = 1;
//         var oBindingthat = oEvent.getSource().getBindingContext("itemsModel");
//         var aMaterialDetails = that.getView().getModel("itemsModel").getData()
//         var oModel = oBindingthat.getModel();
//         var sPath = oBindingthat.getPath();
//         var  a = oEvent.getSource().getValue();
//         MinQty = Number(a);

//          // Get the value from the input that triggered the event
//   var requestRateInput = oEvent.getSource();
//   // Format the value to always have two decimal places
//   var formattedRequestRate = parseFloat(MinQty).toFixed(2);

//   // Set the formatted value back to the input field
//   requestRateInput.setValue(formattedRequestRate);

//    // Get the row index from the binding context path
//    var index = parseInt(sPath.split("/").pop(), 10);

//    // Fetch the SCHEMECODE for the respective row using the index
//    var schemeCode = aMaterialDetails[index].SCHEMECODE;

//   // Get the binding context of the row where the event was triggered
//   var bindingContext = requestRateInput.getBindingContext("itemsModel");

//         // Get the updated order quantity from the input field
//         var newOrderQty = parseFloat(oEvent.getParameter("value")) || 0;

//         // Get the current item's data
//         var item = oModel.getProperty(sPath);

//         // Convert string values to numbers for calculation
//         var price = parseFloat(item.NIR_PRICE) || 0;    // Ensure price is a number
//         var cgst = parseFloat(item.CGST_PERCENTAGE) || 0;      // Ensure CGST is a number
//         var sgst = parseFloat(item.SGST_PERCENTAGE) || 0;      // Ensure SGST is a number
//         var igst = parseFloat(item.IGST_PERCENTAGE) || 0;      // Ensure IGST is a number

//         // Calculate the new base amount
//         var baseAmount = newOrderQty * price;

//         // Calculate the new total tax
//         var totalTax = (baseAmount * (cgst + sgst + igst)) / 100;
//        var TotTax=  parseFloat(totalTax).toFixed(2)

//         // Calculate the new total amount
//         // var totalAmount = baseAmount + Number(TotTax);

//         //grandTotal
//         var grandTotal = baseAmount + Number(TotTax);
//         item.TOTAL_AMOUNT = baseAmount

//         // that.getView().getModel("stockistDetails").getData().d.results[0].TAXES_AMOUNT = totalTax;
//         // that.getView().getModel("stockistDetails").getData().d.results[0].TOTAL_AMOUNT = baseAmount;
//         // that.getView().getModel("stockistDetails").getData().d.results[0].GRAND_TOTAL = grandTotal;


//        var table = that.getView().byId("idItemsTable")
//        table.getModel("itemsModel").refresh(true);
//        that.getView().getModel("stockistDetails").refresh(true);
//        table.rerender()
//        var stockistDetails = that.getView().getModel("stockistDetails").getData().d.results[0]
//        MaterialCode = item.MATERIAL_CODE;
//        Order_Type = stockistDetails.ORDER_TYPE;
//        ShipTo = stockistDetails.SHIP_TO;
//        ShipFrom = stockistDetails.SHIP_FROM;
//     //    that.readCallMaterialScheme(MaterialCode,Order_Type);
//         that.readPRICESet(MaterialCode, schemeCode, ShipTo, ShipFrom,MinQty,sPath,Order_Type);


//       },



priceChange: function (oEvent) {
    

    var oBindingthat = oEvent.getSource().getBindingContext("itemsModel");

    var sSplitArray = oEvent.getSource().sId.split("-");
    // var iIndex = parseInt(sSplitArray[sSplitArray.length - 1], 10);
    var oModel = oBindingthat.getModel();
    var sPath = oBindingthat.getPath();
    var asplit  = sPath.split("/");
    var iIndex=  Number(asplit[asplit.length-1])
    var  a = oEvent.getSource().getValue();
   

  var MaterialCode = that.getView().getModel("itemsModel").getData()[iIndex].MATERIAL_CODE;
  var schemeCode = that.getView().getModel("itemsModel").getData()[iIndex].SCHEMECODE;
    MinQty = Number(a);
    // oEvent.getSource().

    // Get the value from the input that triggered the event
    var Input = oEvent.getSource();
    var ORDERQTY = Input.getValue();

    
        var FormatedOrdQty = Number(ORDERQTY);

        // Set the formatted value back to the input field
        Input.setValue(FormatedOrdQty);

        oEvent.getSource().getBindingContext("itemsModel").getObject().ORDER_QUANTITY = FormatedOrdQty;
        // oEvent.getSource().getBindingContext("itemsModel").getObject().setProperty("/ORDER_QUANTITY",FormatedOrdQty)


   var table = that.getView().byId("idItemsTable")
   table.getModel("itemsModel").refresh(true);
   table.rerender()
   var stockistDetails = that.getView().getModel("stockistDetails").getData().d.results[0]
        //   MaterialCode = item.MATERIAL_CODE;
          Order_Type = stockistDetails.ORDER_TYPE;
          ShipTo = stockistDetails.SHIP_TO;
          ShipFrom = stockistDetails.SHIP_FROM;
    if(Order_Type === 3)
        {

            var HANALineModel = that.getView().getModel("itemsModel").getData();

            // Iterate over each item to calculate the total amount and set editability
            HANALineModel.forEach(function (item) {
                var orderQty = parseFloat(item.ORDER_QUANTITY) || 0; // Convert OrderQuantity to a number
                var nirPrice = parseFloat(item.NIR_PRICE) || 0;       // Convert NirPrice to a number
                var baseAmount = parseFloat((orderQty * nirPrice).toFixed(2));

                item.TOTAL_AMOUNT = baseAmount;
            });

            that.getView().getModel("itemsModel").refresh();

            // for(var i = 0; i<HANALineModel.length;i++)
            // {
            //     HANALineModel[i].ORDER_QUANTITY = FormatedOrdQty
            // }
            that.calculateheadercalculation();
        }
        else
        {      
    that.readPRICESet(MaterialCode, schemeCode, ShipTo, ShipFrom,MinQty,iIndex,Order_Type);
        }


  },






      calculateheadercalculation:function()
      {

        var aTableLineModel = that.getView().getModel("itemsModel").getData();

        var TotAmt = 0;
        var TotTax = 0;
        var GrndTot = 0;
        var price = 0;
        var cgst = 0;
        var sgst = 0;
        var igst = 0;
        var totalTax = 0;
        var orderQty = 0;

        for(var i = 0; i<aTableLineModel.length; i++)
        {
            TotAmt += Number(aTableLineModel[i].TOTAL_AMOUNT);

            price = Number(aTableLineModel[i].NIR_PRICE)
            cgst = Number(aTableLineModel[i].CGST_PERCENTAGE)
            sgst = Number(aTableLineModel[i].SGST_PERCENTAGE)
            igst = Number(aTableLineModel[i].IGST_PERCENTAGE)
            orderQty = Number(aTableLineModel[i].ORDER_QUANTITY)   

            totalTax += ((orderQty * price) * (cgst + sgst + igst)) / 100;
            

        }
        GrndTot = TotAmt + totalTax;
        
        that.getView().getModel("stockistDetails").setProperty("/d/results/0/TAXES_AMOUNT", totalTax);
        that.getView().getModel("stockistDetails").setProperty("/d/results/0/TOTAL_AMOUNT", TotAmt);
        that.getView().getModel("stockistDetails").setProperty("/d/results/0/GRAND_TOTAL", GrndTot);

      },

      closeScheme:function()
      {
        that.schemepopup.close();
      },
      onSelectScheme:function(oEvent)
      {
        
        selectedSchemeCode = oEvent.getSource().getSelectedItem().getBindingContext("MaterialSchemeModel").getObject().Schemecode;
        var Minimumqty = oEvent.getSource().getSelectedItem().getBindingContext("MaterialSchemeModel").getObject().Minimumqty;
        var lineItem = that.getView().getModel("itemsModel").getData();
        var stockistDetails = that.getView().getModel("stockistDetails").getData().d.results[0]
        // MaterialCode = stockistDetails.MATERIAL_CODE;
        Order_Type = stockistDetails.ORDER_TYPE;
        ShipTo = stockistDetails.SHIP_TO;
        ShipFrom = stockistDetails.SHIP_FROM;
        // that.updaterowitem(MaterialCode, selectedSchemeCode);
        that.readPRICESet(MaterialCode, selectedSchemeCode, ShipTo, ShipFrom,Minimumqty,null,Order_Type,true);
    
        that.schemepopup.close();
    
        
      },

      updaterowitem:function(iMTCode, sSchemeCode){

        var aMaterialDetails = that.getView().getModel("itemsModel").getData();
  
        if(aMaterialDetails.length > 0){
  
        for (let i = 0; i < aMaterialDetails.length; i++) {
          if(iMTCode === aMaterialDetails[i].MATERIAL_CODE){
            aMaterialDetails.splice(i,1);
             i--;
            }
          
        }
  
        that.getView().getModel("itemsModel").setData(aMaterialDetails);
        that.getView().getModel("itemsModel").refresh();
      }
  
      },

      readPRICESet: function (MaterialCode, Schemecode, ShipTo, ShipFrom, MinQty, iIndex, selectedOrderType, bNewProductFlag) {
        var that = this;
        BusyIndicator.show();
        Schemecode = Schemecode || "";
        var aFilters = [
            new Filter("MaterialCode", "EQ", MaterialCode),
            new Filter("Schemecode", "EQ", Schemecode),
            new Filter("ShipTo", "EQ", ShipTo),
            new Filter("ShipFrom", "EQ", ShipFrom),
            new Filter("OrderQuantity", "EQ", MinQty),
            new Filter("Ordertype", "EQ", selectedOrderType)
        ];

        if(bNewProductFlag === undefined || bNewProductFlag === "" || bNewProductFlag === null){
            bNewProductFlag = false;
        }
    
        sapModel.read("/PRICESet", {
            filters: aFilters,
            success: function (oData, response) {
                BusyIndicator.hide();
                var aResults = oData.results;
                var SapModel = aResults;

                // Iterate over each item to calculate the total amount and set editability
                aResults.forEach(function (item) {

                    var orderQty = Number(item.ORDER_QUANTITY)
                    var nirPrice = Number(item.NIR_PRICE)
                    var cgst = Number(item.CGST_PERCENTAGE)
                    var sgst = Number(item.SGST_PERCENTAGE)
                    var igst = Number(item.IGST_PERCENTAGE)
    
                    // var orderQty = parseFloat(item.ORDER_QUANTITY) || 0; // Convert OrderQuantity to a number
                    // var nirPrice = parseFloat(item.NIR_PRICE) || 0;       // Convert NirPrice to a number
                    // var cgst = parseFloat(item.CGST_PERCENTAGE) || 0;     // Convert CgstPercentage to a number
                    // var sgst = parseFloat(item.SGST_PERCENTAGE) || 0;     // Convert SgstPercentage to a number
                    // var igst = parseFloat(item.IGST_PERCENTAGE) || 0;     // Convert IgstPercentage to a number
    
                    // Calculate the base amount
                    // var baseAmount = orderQty * nirPrice; // Total Amount line item's

                    var baseAmount = (orderQty * nirPrice);
    
                    // // Calculate the total tax
                    // var totalTax = (baseAmount * (cgst + sgst +igst)) / 100;
    
                    // // Calculate the total amount including taxes
                    // var totalAmount = baseAmount + totalTax;
    
                    // Add total amount to the item
                    item.TOTAL_AMOUNT = baseAmount;
    
                });
            
                   // Concatenate new results to the existing data
                   if(iIndex != undefined && iIndex != null && iIndex != ""){
                    that.updaterowitem(MaterialCode, Schemecode);
                  } else {
                    that.updaterowitem(MaterialCode, Schemecode);
                  }




                var bDupFlag = that.checkDuplicateMat(aResults, bNewProductFlag);

                if(bDupFlag === true || bNewProductFlag === false){


                var itemsModel = that.getView().getModel("itemsModel");
                var HANALineModel = that.getView().getModel("itemsModel").getData();
                var lineModelData = itemsModel.getData();

                // Loop through the results and update the lineModel with OrderQuantity
// for (var i = 0; i < aResults.length; i++) {
//     lineModelData[i].ORDER_QUANTITY = aResults[i].OrderQuantity;
// }
                // Append new results to the existing data
                if (aResults.length > 0) {
                    var newEntries = [];
                    for (var j = 0; j < aResults.length; j++) {

                        var date = new Date();
                        // var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                        var EDate = lastDay.setHours(5,30,0,0);
                        var dateEnd = new Date(EDate) 
                        var EndDate = dateEnd.toISOString();

                        var CDate = date.setHours(5, 30, 0, 0);
                        var currentDate = new Date(CDate).toISOString();

                        // var baseAmount = Number(aResults[j].NirPrice) * Number(aResults[j].OrderQuantity);
                        var TableTotAmt = Number(aResults[j].NirPrice) * Number(aResults[j].OrderQuantity);

                // // Calculate total tax percentage
                // var totalTaxPercentage = Number(aResults[j].SgstPercentage) + Number(aResults[j].CgstPercentage);

                // // Calculate tax amount
                //  var taxAmount = (baseAmount * totalTaxPercentage) / 100; 
                //  var TotalAmt =   baseAmount + taxAmount;
                 var TotlAmt = parseFloat(TableTotAmt).toFixed(2)


                   // Initialize SPECIAL_ORDER and SCHEME_APPLIED values based on UI fields
    var specialOrderValue = aResults[j].Special_order;
    var schemeAppliedValue = aResults[j].applied_scheme;

    // Apply conditional logic before creating the object based on backend Ordertype value
    if (aResults[j].Ordertype === "3") {
        specialOrderValue = "X";
    }

    if (aResults[j].Ordertype === "1") {
        schemeAppliedValue = "X";
    }



                        var object = {
                           "MATERIAL_CODE": aResults[j].MaterialCode,
                            "MATERIAL_DESC": aResults[j].MaterialDesc,
                            "HSN_CODE": aResults[j].HsnCode ,
                            "UNIT_OF_MEASURE": aResults[j].UnitOfMeasure,
                            "ORDER_QUANTITY":parseInt(aResults[j].OrderQuantity),
                            "SCHEME_APPLIED":schemeAppliedValue,
                            "MRP_PRICE": parseFloat(aResults[j].MrpPrice).toFixed(2),
                            "NIR_PRICE": aResults[j].NirPrice,
                            "TOTAL_AMOUNT": TotlAmt.toString(),
                            "CGST_PERCENTAGE": aResults[j].CgstPercentage,
                            "CGST_AMOUNT": null,
                            "SGST_PERCENTAGE": aResults[j].SgstPercentage,
                            "SGST_AMOUNT": null,
                            "IGST_PERCENTAGE": aResults[j].IgstPercentage,
                            "IGST_AMOUNT": null,
                            "TAXES_AMOUNT": "18",
                            "FREEGOODS":aResults[j].Freegoods,
                            "SPECIAL_ORDER":specialOrderValue,
                            "PURCHASE_REQUEST_NO": 1,
                            "ITEM_NO": 1,
                            "REQUEST_RATE" : "",
                            "FROM_DATE" : currentDate,
                            "TO_DATE" : EndDate,
                            "SCHEMECODE":aResults[j].Schemecode
                            
                        };
                        // var object = {
                        //     "MATERIAL_DESC": aResults[j].MaterialDesc,
                        //     "CGST_PERCENTAGE": aResults[j].CgstPercentage,
                        //     "FREEGOODS": aResults[j].Freegoods,
                        //     "HSN_CODE": aResults[j].HsnCode,
                        //     "IGST_PERCENTAGE": aResults[j].IgstPercentage,
                        //     "MATERIAL_CODE": aResults[j].MaterialCode,
                        //     "MRP_PRICE": aResults[j].MrpPrice,
                        //     "NIR_PRICE": aResults[j].NirPrice,
                        //     "ORDER_QUANTITY": aResults[j].OrderQuantity,
                        //     "SCHEMECODE": aResults[j].Schemecode,
                        //     "SGST_PERCENTAGE": aResults[j].SgstPercentage,
                        //     "UNIT_OF_MEASURE": aResults[j].UnitOfMeasure,
                        //     "FROM_DATE": aResults[j].UnitOfMeasure,
                        //     "TO_DATE": aResults[j].UnitOfMeasure,
                        //     "REQUEST_RATE": aResults[j].UnitOfMeasure,
                        //     "SPECIAL_ORDER": aResults[j].UnitOfMeasure,
                            
                        // };
                        newEntries.push(object);
                    }
    
                    // Merge existing data with new entries
                    // lineModelData = lineModelData.concat(newEntries);
                    lineModelData = lineModelData.concat(newEntries);
                }          
    
                // Update the itemsModel with the modified data and refresh it
                // itemsModel.setData(lineModelData);

               for(var a = 0; a<aResults.length; a++)
                {
                    for(var b = 0; b<HANALineModel.length; b++)
                        {
                    if(aResults[a].Ordertype === "1")
                    {
                        if(aResults[a].MaterialCode === HANALineModel[b].MATERIAL_CODE)
                        {
                            HANALineModel[b].FREEGOODS = aResults[a].Freegoods
                            // HANALineModel[b].ORDER_QUANTITY = aResults[a].OrderQuantity
                        }

                    }

                    }
                }   
                
                 // Iterate over each item to calculate the total amount and set editability
                 lineModelData.forEach(function (item) {
                    item.isEditable = item.FREEGOODS !== "X"; // Editable if Freegoods is not "X"
                });

               
                var model = new JSONModel(lineModelData);
            
              
                var count = lineModelData.length;
                PropertyModel.setProperty("/count","Products("+count+")")
    


                that.getView().setModel(model,"itemsModel")
                that.getView().getModel("itemsModel").refresh(true);


                if(model.getData().length === 0)
                    {
                        PropertyModel.setProperty("/SaveButtonEnable",false);
                        MessageBox.information("In order to save details, please add product");
                    }
                    else if(model.getData().length != 0)
                    {
                        PropertyModel.setProperty("/SaveButtonEnable",true);
                    }

                that.calculateheadercalculation();
} 
            },
            error: function (oError) {
                var sErrorMessage = oError.responseText;
                MessageBox.error(sErrorMessage);
                BusyIndicator.hide();
            }
        });
    },


    checkDuplicateMat:function(aNewEntries, bNewProductFlag)
    {
        var aTableLineModel = that.getView().getModel("itemsModel").getData();
        var bFlag = true
        for(var i = 0; i<aTableLineModel.length; i++)
            {
                if(aTableLineModel[i].MATERIAL_CODE === aNewEntries[0].MaterialCode){
                    bFlag = false;

                    

                }

    
            }
            
            if(bFlag === false && bNewProductFlag === true){
                MessageBox.information("Product - "+ aNewEntries[0].MaterialDesc +" already exists. Please consider increasing the Product Quantity.")
            }
            return bFlag;
    },

    // 21 -10-2024

    onChangeRequestRate: function(oEvent) {
        ;
    
        // Get the array of materials from the itemsModel
        var itemsModel = this.getView().getModel("itemsModel");
        var Materials = itemsModel.getData();
    
        // Get the value from the input that triggered the event
        var requestRateInput = oEvent.getSource();
        var requestRateValue = requestRateInput.getValue();
    
        // Get the binding context of the row where the event was triggered
        var bindingContext = requestRateInput.getBindingContext("itemsModel");
    
        // Get the path of the current row (e.g., "/results/0", "/results/1", etc.)
        var path = bindingContext.getPath();
    
        if (requestRateValue !== "") {
            // Format the value to always have two decimal places
            var formattedRequestRate = parseFloat(requestRateValue).toFixed(2);
    
            // Set the formatted value back to the input field
            requestRateInput.setValue(formattedRequestRate);
    
            // Change the ValueState to "None" since the input is now valid
            requestRateInput.setValueState("None");
    
            // Update the REQUEST_RATE field for the current material
            itemsModel.setProperty(path + "/REQUEST_RATE", formattedRequestRate);
        } else {
            // Set the ValueState to "Error" for empty input
            requestRateInput.setValueState("Error");
            requestRateInput.setValueStateText("Request Rate cannot be empty.");
    
            // // Set REQUEST_VS to "Error" in the model
            // itemsModel.setProperty(path + "/REQUEST_VS", "Error");
        }
    },
    

    onChangeRequestRate2110: function(oEvent) {
        ;
    
        // Get the array of materials from the itemsModel
        var itemsModel = this.getView().getModel("itemsModel");
        var Materials = itemsModel.getData();
    
        // Get the value from the input that triggered the event
        var requestRateInput = oEvent.getSource();
        var requestRateValue = requestRateInput.getValue();
    
        if (requestRateValue !== "") {
            // Format the value to always have two decimal places
            var formattedRequestRate = parseFloat(requestRateValue).toFixed(2);
    
            // Set the formatted value back to the input field
            requestRateInput.setValue(formattedRequestRate);
    
            // Change the ValueState to "None" since the input is now valid
            requestRateInput.setValueState("None");
    
            // Get the binding context of the row where the event was triggered
            var bindingContext = requestRateInput.getBindingContext("itemsModel");
    
            // Get the path of the current row (e.g., "/results/0", "/results/1", etc.)
            var path = bindingContext.getPath();
    
            // Update the REQUEST_RATE field for the current material
            itemsModel.setProperty(path + "/REQUEST_RATE", formattedRequestRate);
        }
    },
    
    
    
    
    onChangeRequestRate1810: function(oEvent) {
        ;
    
        // Get the array of materials from the itemsModel
        var itemsModel = this.getView().getModel("itemsModel");
        var Materials = itemsModel.getData();
    
        // Get the value from the input that triggered the event
        var requestRateInput = oEvent.getSource();
        var requestRateValue = requestRateInput.getValue();

        if(requestRateValue === "")
        {
            requestRateInput.setValue(formattedRequestRate);
        }
        else
        {
    
        // Format the value to always have two decimal places
        var formattedRequestRate = parseFloat(requestRateValue).toFixed(2);
    
        // Set the formatted value back to the input field
        requestRateInput.setValue(formattedRequestRate);

        }
    
        // Get the binding context of the row where the event was triggered
        var bindingContext = requestRateInput.getBindingContext("itemsModel");
    
        // Get the path of the current row (e.g., "/results/0", "/results/1", etc.)
        var path = bindingContext.getPath();
    
        // Update the REQUEST_RATE field for the current material
        itemsModel.setProperty(path + "/REQUEST_RATE", formattedRequestRate);
    },


    
            // Device funtion check (Phone/Tablet/Desktop)
            checkDevice: function () {

                if (sap.ui.Device.system.phone === true) {
                
                    PropertyModel.setProperty("/Menu", true);
                    that.getView().byId("idShipFrom").addStyleClass("sapUiSmallMarginEnd")
                    that.getView().byId("idShipTo").addStyleClass("sapUiSmallMarginEnd")
                    PropertyModel.setProperty("/HBOx", false);

                    that.getView().byId("idTotAmtObjStatus").addStyleClass("sapMObjectStatusTiny");
                    that.getView().byId("idTaxAmtObjStatus").addStyleClass("sapMObjectStatusTiny");
                    that.getView().byId("idGrdAmtObjStatus").addStyleClass("sapMObjectStatusTiny");


                    
                    that.getView().byId("idTotAmtVLayout").addStyleClass("sapUiSmallMarginEnd");
                    that.getView().byId("idTotTaxVLayout").addStyleClass("sapUiSmallMarginEnd");
                    that.getView().byId("idGrdAmtVLayout").addStyleClass("sapUiSmallMarginEnd");

                   
                    
                }
                else if (sap.ui.Device.system.tablet === true) {

         
                    PropertyModel.setProperty("/Menu", true);
                    that.getView().byId("idShipFrom").addStyleClass("sapUiLargeMarginBegin")
                    that.getView().byId("idShipTo").addStyleClass("sapUiLargeMarginBegin")
                    
                    PropertyModel.setProperty("/HBOx", false);
                    
                    that.getView().byId("idTotAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    that.getView().byId("idTaxAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    that.getView().byId("idGrdAmtObjStatus").addStyleClass("sapMObjectStatusLarge");


                    that.getView().byId("idTotAmtVLayout").addStyleClass("sapUiSmallMarginBegin");
                    that.getView().byId("idTotTaxVLayout").addStyleClass("sapUiSmallMarginBegin");
                    that.getView().byId("idGrdAmtVLayout").addStyleClass("sapUiSmallMarginBegin");

                   
                }

                else if (sap.ui.Device.system.desktop === true) {

                    PropertyModel.setProperty("/Menu", false);
                    that.getView().byId("idShipFrom").addStyleClass("sapUiLargeMarginBegin")
                    that.getView().byId("idShipTo").addStyleClass("sapUiLargeMarginBegin")

                    
                    that.getView().byId("idTotAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    that.getView().byId("idTaxAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    that.getView().byId("idGrdAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                   
                    PropertyModel.setProperty("/HBOx", true);


                    that.getView().byId("idTotAmtVLayout").addStyleClass("sapUiSmallMarginBegin");
                    that.getView().byId("idTotTaxVLayout").addStyleClass("sapUiSmallMarginBegin");
                    that.getView().byId("idGrdAmtVLayout").addStyleClass("sapUiSmallMarginBegin");

                   
                }
            },
            onChangeRemark: function (oEvent) {
                var sValue = oEvent.getSource().getValue();
                var remarklength = sValue.length;
                if (remarklength > 50) {
                  that.getView().byId("idRemark").setValueState("Error").setValueStateText("Limit reached");
                }
                else {
                  that.getView().byId("idRemark").setValueState("None");
                }
              },
    

    
// onChangeRequestRate: function(oEvent) {
//     ;
  
//     // Get the array of materials from the PriceModel
//     var Materials = this.getView().getModel("itemsModel").getData();
  
//     // Get the value from the input that triggered the event
//     var requestRateInput = oEvent.getSource();
//     var requestRateValue = requestRateInput.getValue();
  
//     // Format the value to always have two decimal places
//     var formattedRequestRate = parseFloat(requestRateValue).toFixed(2);
  
//     // Set the formatted value back to the input field
//     requestRateInput.setValue(formattedRequestRate);
  
//     // Get the binding context of the row where the event was triggered
//     var bindingContext = requestRateInput.getBindingContext("itemsModel");
  
//     // Get the path of the current row (e.g., "/results/0", "/results/1", etc.)
//     var path = bindingContext.getPath();
  
//     // Get the material object for the current row
//     var currentMaterial = bindingContext.getObject();
  

//   }
    
    


      
    
    
     

    });
});
