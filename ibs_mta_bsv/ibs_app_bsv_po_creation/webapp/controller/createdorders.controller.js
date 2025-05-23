sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "com/ibs/bsv/ibsappbsvpocreation/model/formatter",
    "sap/ui/Device"
],
function (Controller,JSONModel,MessageBox,BusyIndicator,formatter,Device) {
    "use strict";
    var that;
    var localmodel, oProductModel;
    var createdData
    var PropertyModel;
    var login_ID;
    var UserData;
    var Role
    return Controller.extend("com.ibs.bsv.ibsappbsvpocreation.controller.createdorders", {
        formatter:formatter,
        onInit: function () {
            that = this;
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("createdorders").attachPatternMatched(this._onRouteMatched, this);
            that.getOwnerComponent().getModel("headerModel").getData().oData;
            PropertyModel = that.getOwnerComponent().getModel("PropertyModel");
            PropertyModel.setProperty("/RequestRateColumn",false);
            PropertyModel.setProperty("/RemarkSection",false);
        },

        _onRouteMatched: function (oEvent) {
            // 
            that.checkDevice();
           var headerDetails = that.getOwnerComponent().getModel("headerModel").getData().oData;
           var ordetype = headerDetails.ORDER_TYPE;
           if(ordetype === '1')
           {
            PropertyModel.setProperty("/RequestRateColumn",false);
           }
           else if(ordetype === '3')
           {
            PropertyModel.setProperty("/RequestRateColumn",true);
           }
           var hedaerModel = new JSONModel(headerDetails);
           that.getView().setModel(hedaerModel,"headerDetails");
           
           if(window.oFileUploader.oFileUpload.files.length > 0){
                var aFileUploader = window.oFileUploader;
                var oFile = aFileUploader.oFileUpload.files[0];
                that.getView().byId("idpoUploadTxt").setVisible(true);
                that.getView().byId("idpoUploadLbl").setVisible(true);
                that.getView().byId("idpoUploadTxt").setText(oFile.name);
           }else{
            that.getView().byId("idpoUploadTxt").setVisible(false);
            that.getView().byId("idpoUploadLbl").setVisible(false);
           }
           
           that._userdetails();


    // Retrieve and process line items
    var lineItems = that.getOwnerComponent().getModel("LineItemModel").getData().oData;
    for(var i =0; i<lineItems.length; i++)
        { 
            if(lineItems[i].Ordertype === "1")
                {
                    lineItems[i].RequestRate = "0.00"
                }
              
        }


        var count = lineItems.length;
                  PropertyModel.setProperty("/Count","Products("+count+")")  
             

    // Set processed line items to the model
    var lineItemModel = new JSONModel(lineItems);
    that.getView().setModel(lineItemModel, "LineModel");

        //    var lineItems = that.getOwnerComponent().getModel("LineItemModel").getData().oData;
        //    var LineItemModel = new JSONModel(lineItems);
        //    that.getView().setModel(LineItemModel,"LineItemsModel");
           
           var EventsmModel = that.getOwnerComponent().getModel("EventsmModel").getData().oData;
           var EventsmModel = new JSONModel(EventsmModel);
           that.getView().setModel(EventsmModel,"EventsmModel");

           if(EventsmModel.getData().COMMENTS)
           {
            PropertyModel.setProperty("/RemarkSection",true);

           }
           else if(EventsmModel.getData().COMMENTS === "")
           {
            PropertyModel.setProperty("/RemarkSection",false);

           }

           
            var g = this.getView().getParent().getParent();
            g.toBeginColumnPage(this.getView());
    
            // that.getOwnerComponent().getModel("ProductModel").stData(model);
            // createdData = that.getOwnerComponent().getModel("ProductModel").getData().oData;
            // that.getOwnerComponent().getModel("ProductModel").setData(StockistDetails);
            // var model = new JSONModel(createdData);
            // that.getView().setModel(model,"CreatedOrders");

            // var currentdate = new Date();
            // // that.getView().byId("id_Date").setValue(currentdate); 

            // var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
            // var formattedDate = oDateFormat.format(currentdate);

            // PropertyModel.setProperty("/RemarkSection",false);

           

        },

        // added 22-10-2024
      _userdetails:function()
      {

        var url;
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);
                url = appModulePath + "/user-api/attributes";
                
                // var data = {
                //     email : "vgraja@bsv.com",
                //     name : "101486"
                // };
                // UserData = data;
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
                            that.readgetUserAttributes();
                        
                        },
                        error: function (oError) {
                            MessageBox.error("User attributes issue");
                        }
                    });
                });
      },
        backNav: function () {
            // 
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // that._sUserID = "101486";
               var  login_ID = login_ID
               BusyIndicator.show(0);
                oRouter.navTo("RequestCreation",{

                    "Stockist":login_ID
                });
                },
                ApporveOrder:function()
                {
                    MessageBox.confirm("Do you want to confirm your request?", {
                        actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.YES,
                        onClose: function (oAction) {
                            if (oAction === 'YES') {
                                that.finalPost(UserData,Role);
                            }
                        }
                    })
                },

                 padToTwoDigits:function(number) {
                    return number.toString().padStart(2, '0');
                },
                
                // Function to format milliseconds to be three digits
                 padToThreeDigits:function(number) {
                    return number.toString().padStart(3, '0');
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
               
            
            finalPost: function (UserData,Role) {
                // 
                BusyIndicator.show();
                
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);

                // var referenceID = that.getView().byId().getValue();
                var surl = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/CreatePurchase"
                var createdItem = createdData
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "yyyy-MM-ddTHH:mm:ss",
                    UTC: false
                  });
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
                var dateEnd = new Date(EDate);
                
                var EndDate = dateFormat.format(dateEnd);
                EndDate = EndDate.split('T')[0];
                // var EndDate = dateEnd.toISOString();
                var headerDetails = that.getOwnerComponent().getModel("headerModel").getData().oData;
                var PoUploadDetails;
                if(window.oFileUploader.oFileUpload.files.length > 0){
                    PoUploadDetails = that.getOwnerComponent().getModel("mPoUploadModel").getData();
                }else{
                    PoUploadDetails = [];
                }
                var fromdate = new Date(headerDetails.CREATION_DATE)
                var FromDate = dateFormat.format(fromdate);
                FromDate = FromDate.split('T')[0];
                var lineItem = that.getOwnerComponent().getModel("LineItemModel").getData().oData;
                var Events = that.getOwnerComponent().getModel("EventsmModel").getData().oData

                var  firstname = UserData.firstname;
                var  lastname = UserData.lastname;   
                // var  firstname = "V.G";
                // var  lastname = "Raja";

                var  fullName = firstname + " " + lastname.charAt(0) + lastname.slice(1).toLowerCase();

                // if(Role === "BSV_STOCKIST_ROLE")
                // {
                //     var UserRole = "STOCKIST"
                // }
                // if(UserData.Groups[0] === "BSV_STOCKIST_ROLE")
                // {
                //     var UserRole = "STOCKIST"
                // } commented on 26-11-2024

                // var StockistName = 
                // for (var i=0; i<createdItem.temparray.length;i++){

                     oPRHeader ={
                        "PURCHASE_REQUEST_NO": 1,
                        "SAP_SALES_ORDER_NO": null,
                        "CREATION_DATE": headerDetails.CREATION_DATE,
                        "STOCKIST_ID": UserData.name,
                        // "STOCKIST_ID": "101486",
                        // "STOCKIST_ID": UserData.login_name[0],
                        "STOCKIST_NAME": fullName,
                        "REFERENCE_ID":headerDetails.REFERENCE_ID,
                        "SHIP_TO": headerDetails.SHIP_TO,
                        "SHIP_NAME": headerDetails.SHIP_NAME,
                        "SHIP_FROM": headerDetails.SHIP_FROM,
                        "SHIP_FROM_NAME" : headerDetails.SHIP_FROM_NAME,
                        "ORDER_TYPE": headerDetails.ORDER_TYPE,
                        "PAYMENT_METHOD_CODE": headerDetails.PAYMENT_METHOD_CODE,
                        "PAYMENT_METHOD_DESCRIPTION" : headerDetails.PAYMENT_METHOD_DESCRIPTION,
                        "STATUS": 1,
                        "LAST_UPDATED_DATE": "2024-06-03T07:09:49.069Z",
                        "NOTIFICATION_IDS": headerDetails.NOTIFICATION_IDS,
                        "TOTAL_AMOUNT":(headerDetails.TOTAL_AMOUNT).toString(),
                        "TAXES_AMOUNT":(headerDetails.TAXES_AMOUNT).toString(),
                        "TCS_AMOUNT": (headerDetails.TCS_AMOUNT).toString(),
                        "GRAND_TOTAL": (headerDetails.GRAND_TOTAL).toString()
                    }
                    for(var i =0; i<lineItem.length;i++)
                        {

                     oPRItems ={
                        "MATERIAL_CODE": lineItem[i].MaterialCode,
                            "MATERIAL_DESC": lineItem[i].MaterialDesc,
                            "HSN_CODE": lineItem[i].HsnCode ,
                            "UNIT_OF_MEASURE": lineItem[i].UnitOfMeasure,
                            "ORDER_QUANTITY":parseInt(lineItem[i].OrderQuantity),
                            "SCHEME_APPLIED":lineItem[i].applied_scheme,
                            "MRP_PRICE": parseFloat(lineItem[i].MrpPrice).toFixed(2),
                            "NIR_PRICE": lineItem[i].NirPrice,
                            "TOTAL_AMOUNT": lineItem[i].TotalAmount.toString(),
                            "CGST_PERCENTAGE": lineItem[i].CgstPercentage,
                            "CGST_AMOUNT": null,
                            "SGST_PERCENTAGE": lineItem[i].SgstPercentage,
                            "SGST_AMOUNT": null,
                            "IGST_PERCENTAGE": lineItem[i].IgstPercentage,
                            "IGST_AMOUNT": null,
                            "TAXES_AMOUNT": "18",
                            "FREEGOODS":lineItem[i].Freegoods,
                            "SPECIAL_ORDER":lineItem[i].Special_order,
                            "PURCHASE_REQUEST_NO": 1,
                            "ITEM_NO": 1,
                            "REQUEST_RATE" : lineItem[i].RequestRate,
                            "FROM_DATE" : FromDate,
                            "TO_DATE" : EndDate,
                            "SCHEMECODE":lineItem[i].Schemecode
                    }
                    aPRItems.push(oPRItems);

                }
                    oEvents ={
                        "PURCHASE_REQUEST_NO": 1,
                            "EVENT_NO": 1,
                            "EVENT_CODE": "1",
                            "USER_ID": UserData.email,
                            // "USER_ID": "aniket.s@intellectbizware.com",
                            // "USER_ROLE": "STOCKIST",
                            "USER_ROLE": Role,
                            "USER_NAME": fullName,
                            "COMMENTS": Events.COMMENTS,
                            "CREATION_DATE": null
                    }

                
                aPRHeader.push(Object.assign({}, oPRHeader));
                // aPRItems.push(Object.assign({}, oPRItems));
                aEvents.push(Object.assign({}, oEvents));
                // }
                var payload ={
                    "sAction": "CREATE",
                    "aPrHeader": aPRHeader,
                    "aPrItems": aPRItems,
                    "aPrPoUpload": PoUploadDetails,
                    "aPrEvent":aEvents,
                    "oUserDetails": {
                        // "USER_ROLE": "STOCKIST",
                        // "USER_ID": "aniket.s@intellectbizware.com",
                        // "USER_NAME":fullName
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
                        if(PoUploadDetails.length > 0){     
                        var purchaseNo = result.d.CreatePurchase.OUT_SUCCESS;
                        var spurchaseNumber = purchaseNo.match(/\d+/)[0];
                        that.secondHit(spurchaseNumber,1,result.d.CreatePurchase.OUT_SUCCESS);
                        }else{
                            MessageBox.success(result.d.CreatePurchase.OUT_SUCCESS, {
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (oAction) {
                                if (oAction === 'OK') {
                                    var param = {};
                                    var oSemantic = "orderstatustracking";
                                    var hash = {};
                                    var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                                    var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                                        target: {
                                            semanticObject: oSemantic,
                                            action: "display"
                                        },
                                        params: param
                                    })) || ""; // generate the Hash to display a Supplier
                                    oCrossAppNavigator.toExternal({
                                        target: {
                                            shellHash: hash
                                        }
                                    });
                                    }
                                }
                            });
                        }
                    },
                    error: function (error) {
                        // debugger
                        BusyIndicator.hide();
                        var oXMLMsg, oXML;
                        if (that.isValidJsonString(error.responseText)) {
                            oXML = JSON.parse(error.responseText);
                            oXMLMsg = oXML.error["message"].value;;
                        } else {
                            oXMLMsg = error.responseText;
                        }
                        if(oXMLMsg.value.value === "Email Configuration Issue"){
                            var oSuccess = "Sales Order Created : "+ oXMLMsg.value.OUT_SUCCESS;
                            if(PoUploadDetails.length > 0){ 
                                // var oSuccess = "Sales Order Created : "+ oXMLMsg.value.OUT_SUCCESS;
                                that.secondHit(oXMLMsg.value.OUT_SUCCESS,1,oSuccess);
                            }else{
                                MessageBox.success(oSuccess, {
                                    actions: [MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK,
                                    onClose: function (oAction) {
                                    if (oAction === 'OK') {
                                        var param = {};
                                        var oSemantic = "orderstatustracking";
                                        var hash = {};
                                        var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                                        var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                                            target: {
                                                semanticObject: oSemantic,
                                                action: "display"
                                            },
                                            params: param
                                        })) || ""; // generate the Hash to display a Supplier
                                        oCrossAppNavigator.toExternal({
                                            target: {
                                                shellHash: hash
                                            }
                                        });
                                        }
                                    }
                                });
                            }
                            
                        }else{
                        MessageBox.error(oXMLMsg);
                        }
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
            secondHit:function(purchaseNo,fileId,success){
                
                var appId = that.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);

                var content = that.getOwnerComponent().getModel("mPoUploadModel").getData();
                var url = appModulePath + "/odata/v4/ideal-bsv-purchase-order-srv/PrPoUpload(PURCHASE_REQUEST_NO=" + purchaseNo + ",FILE_ID=" + fileId + ")/FILE_CONTENT"

                var oFileUploader = window.oFileUploader;
                var oFile = oFileUploader.oFileUpload.files[0];
                // type
                var oBlob = new Blob([oFile ], { type: oFile.type });
 
                // Use FormData to send the file
                var oFormData = new FormData();
                oFormData.append("file", oBlob, oFile.name);

                // Perform AJAX PUT request
                $.ajax({
                    url: url,
                    type: "PUT",
                    data: oBlob, // Send binary data directly
                    processData: false, // Prevent jQuery from processing data
                    contentType: oFile.FILE_TYPE, // Set correct Content-Type
                    success: function () {
                        BusyIndicator.hide();
                        MessageBox.success(success, {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (oAction) {
                            if (oAction === 'OK') {
                                var param = {};
                                var oSemantic = "orderstatustracking";
                                var hash = {};
                                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                                    target: {
                                        semanticObject: oSemantic,
                                        action: "display"
                                    },
                                    params: param
                                })) || ""; // generate the Hash to display a Supplier
                                oCrossAppNavigator.toExternal({
                                    target: {
                                        shellHash: hash
                                    }
                                });
                                }
                            }
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        MessageBox.error("Upload failed: " + textStatus + " - " + errorThrown);
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
            // Device funtion check (Phone/Tablet/Desktop)
            checkDevice: function () {

                if (sap.ui.Device.system.phone === true) {
                
                    // PropertyModel.setProperty("/Menu", true);
                    that.getView().byId("idShipToLayout").addStyleClass("sapUiSmallMarginEnd");

                    that.getView().byId("idTotAmtVLayout").addStyleClass("sapUiSmallMarginEnd");
                    that.getView().byId("idTotTaxVLayout").addStyleClass("sapUiSmallMarginEnd");
                    that.getView().byId("idGrdAmtVLayout").addStyleClass("sapUiSmallMarginEnd");

                    that.getView().byId("idTotAmtObjStatus").addStyleClass("sapMObjectStatusTiny");
                    that.getView().byId("idTaxAmtObjStatus").addStyleClass("sapMObjectStatusTiny");
                    that.getView().byId("idGrdAmtObjStatus").addStyleClass("sapMObjectStatusTiny");
                }
                else if (sap.ui.Device.system.tablet === true) {
  
  
                    that.getView().byId("idShipToLayout").addStyleClass("sapUiSmallMarginBegin")

                    
                    that.getView().byId("idTotAmtVLayout").addStyleClass("sapUiSmallMarginBegin");
                    that.getView().byId("idTotTaxVLayout").addStyleClass("sapUiSmallMarginBegin");
                    that.getView().byId("idGrdAmtVLayout").addStyleClass("sapUiSmallMarginBegin");

                    that.getView().byId("idTotAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    that.getView().byId("idTaxAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    that.getView().byId("idGrdAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                   



                    

                }
  
                else if (sap.ui.Device.system.desktop === true) {
  
                    that.getView().byId("idShipToLayout").addStyleClass("sapUiSmallMarginBegin")

                    
                    that.getView().byId("idTotAmtVLayout").addStyleClass("sapUiSmallMarginBegin");
                    that.getView().byId("idTotTaxVLayout").addStyleClass("sapUiSmallMarginBegin");
                    that.getView().byId("idGrdAmtVLayout").addStyleClass("sapUiSmallMarginBegin");


                    that.getView().byId("idTotAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    that.getView().byId("idTaxAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                    that.getView().byId("idGrdAmtObjStatus").addStyleClass("sapMObjectStatusLarge");
                   

  
                   
                }
            }


         
        
    });
});
