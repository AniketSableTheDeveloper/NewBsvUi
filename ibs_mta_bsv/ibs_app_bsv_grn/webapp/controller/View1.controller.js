sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
	"sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel",
    "com/ibs/bsv/ibsappbsvgrn/model/formatter",
    "sap/ui/export/library"
],
function (Controller,MessageBox,MessageToast,BusyIndicator,JSONModel,formatter,down,exportLibrary) {
    "use strict";
    // var EdmType = exportLibrary.EdmType;
    var PropertyModel,vRole;
    var that,vRemark,appId,appPath,appModulePath,aData,vFILE_CONTENT,vFILE_MIMETYPE,vFILE_NAME,vFILE_TYPE,vWithoutFile;
    return Controller.extend("com.ibs.bsv.ibsappbsvgrn.controller.View1", {
        formatter:formatter,
        onInit:async function () {
            that = this;
            sap.ushell.Container.getRenderer(
                "fiori2"
                ).hideHeaderItem(
                "backBtn"
                , false);
                
            that.oDataModel = this.getOwnerComponent().getModel("S4Service");
            var oRouter = this.getOwnerComponent().getRouter();
            PropertyModel = that.getOwnerComponent().getModel("PropertyModel");
            oRouter.getRoute("RouteView1");
            var getRoute = oRouter.getRoute("RouteView1");
            getRoute.attachMatched(that._onRouteMatched, this);
        },
        getUserAttributes:function(){
            that = this;
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);
            var attr = appModulePath + "/user-api/attributes";
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: attr,
                    type: 'GET',
                    contentType: 'application/json',
                    success: function (data, response) {
                        
                        that.getUserRole();
                        // if(data.Groups[0] !== "BSV_STOCKIST_ROLE"){
                        //     MessageBox.error("Only Stockists are allowed to login");
                        // }
                        // if(data.Groups[0] === "BSV_STOCKIST_ROLE"){
                        //     vRole = "STOCKIST";
                        // }
                        
                        var obj = {
                            userId: data.email.toLowerCase(),
                            userName: data.firstname + " " + data.lastname,
                            loginName: data.name
                            // login_name[0]
                        }
                        var oModel = new JSONModel(obj);
                        that.getOwnerComponent().setModel(oModel, "userModel");
                        var oUserData = that.getOwnerComponent().getModel("userModel");
                        var stockist = oUserData.oData.loginName;
                        var url = appModulePath + "/odata/v4/ideal-bsv-grn-srv/GrnHeader?$filter=STOCKIST_ID eq '"+stockist+"'";
                        that.readAcceptedEntity(url,"GET","grnAcceptedInvoice",stockist);
                    },
                    error: function (oError) {
                        // 
                        MessageBox.error("Error while reading User Attributes");
                    }
                });
            });
        },
        _onRouteMatched:function(){

            BusyIndicator.show(); 
            that.checkDevice();
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);
            that.getUserAttributes();
            that.getView().byId("oSearchMasterData").setValue("");
           
        },
        getUserRole:function(){

            that = this;
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);
            var attr = appModulePath + "/odata/v4/ideal-bsv-purchase-order-srv/getUserAttributes";
            return new Promise(function (resolve, reject) {
                $.ajax({
                url: attr,
                type: 'GET',
                contentType: 'application/json',
                success: function (data, response) {
                    
                    for(var i =0; i<data.value.lengh; i++){

                        if(data.value[i] === "BSV_STOCKIST_ROLE"){
                            vRole = "STOCKIST";
                        }

                    }
                    // if(data.Groups[0] !== "BSV_STOCKIST_ROLE"){
                    //     MessageBox.error("Only Stockists are allowed to login");
                    // }
                   
                },
                error: function (oError) {
                    MessageBox.error("Error while reading User Attributes");
                }
            });
        });

        },
        onBack:function(){

            that.OnGrnFrag.close();
            that.OnGrnFrag.destroy();
            that.OnGrnFrag = null;

        },
        readAcceptedEntity:function(url, type,sAlisName,stockist){       
                $.ajax({
                    url: url,
                    type: type,
                    contentType: 'application/json',
                    dataType:'JSON',
                    success: function (oData, response) {
                       
                        var oModel = new JSONModel(oData.value);
                        that.getView().setModel(oModel,sAlisName);

                        var url = appModulePath + "/sap/opu/odata/sap/ZIDEAL_ODATA_SALESORDER_SRV/GRN_HEADERSet?$filter=StockistId eq '"+stockist+"'";
                        that.postAjaxs(url,"GET","grnHeaderSet");
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
        postAjaxs:function(url, type,sAlisName){
            var getSearchData = that.getView().byId("oSearchMasterData").getValue();
            var sDataArr = [];
            
            $.ajax({
            url: url,
            type: type,
            contentType: 'application/json',
            dataType:'JSON',
            success: function (oData, response) {
            var getAcceptedData = that.getView().getModel("grnAcceptedInvoice").getData();
            var data =oData.d.results;
            var s4HanaJson = new JSONModel();
            s4HanaJson.setSizeLimit(data.length);

            for(var i=0;i<data.length;i++){
                if(data[i].DeliveryDate){
                    data[i].DeliveryDate = new Date(parseInt(data[i].DeliveryDate.replace(/[^0-9]/g, "")));
                }
                if(data[i].Lrdat)
                {
                    data[i].Lrdat = new Date(parseInt(data[i].Lrdat.replace(/[^0-9]/g, "")));
                }
                data[i].InvoiceDate = new Date(parseInt(data[i].InvoiceDate.replace(/[^0-9]/g, "")));
                
                if(Number(data[i].DeliveryValue) === 0){
                    data[i].DeliveryValue = 0;
                }
                else{
                    data[i].DeliveryValue = Number(data[i].DeliveryValue).toFixed(2);
                }

                if(getAcceptedData.length === 0){
                    sDataArr = data;
                }
                else{
                    var result1 = getAcceptedData.filter(function (a) {
                        if(a["INVOICE_NO"] == data[i].InvoiceNo){
                            return a;
                        }
                    }, Object.create(null));

                    if(result1.length === 0){
                        sDataArr.push(data[i]);
                    }
                }
            }
            s4HanaJson.setData(sDataArr);
            that.getOwnerComponent().setModel(s4HanaJson, sAlisName);
            BusyIndicator.hide();
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
        onRefresh:function(){
            that._onRouteMatched();
        },
        onPress:function(oEvent){
            var oSelectedObj = oEvent.getSource().getBindingContext("grnHeaderSet").getObject();

            var oModel = new JSONModel(oSelectedObj);
            this.getOwnerComponent().setModel(oModel,"customerHeaderModel");
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("View2",{
                InvoiceNo:oSelectedObj.InvoiceNo
            });
        },
        onSearch:function(){
                var data = that.getView().byId("oSearchMasterData").getValue();
                if(data === '')
                {
                    that._onRouteMatched();
                }
                else{
                var aFilters = [];
                var oFilter = new sap.ui.model.Filter([
                new sap.ui.model.Filter("DeliveryNo", sap.ui.model.FilterOperator.Contains, data),
                new sap.ui.model.Filter("InvoiceNo", sap.ui.model.FilterOperator.Contains, data),
                new sap.ui.model.Filter("SalesorderNo", sap.ui.model.FilterOperator.Contains, data),
                ], false);
                aFilters.push(oFilter);  
                that.getView().byId("idOrdersTable").getBinding("items").filter(aFilters);
        }
    },
    onFragUpload:function(oEvent){

        var oSelectedObj = oEvent.getSource().getBindingContext("grnHeaderSet").getObject();

        var oModel = new JSONModel(oSelectedObj);
        this.getOwnerComponent().setModel(oModel,"customerHeaderModel");
        if (!this.OnGrnFrag) {
            this.OnGrnFrag = new sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvgrn.view.fragments.UploadGrn", this);
            this.getView().addDependent(this.OnGrnFrag);
        }
        this.OnGrnFrag.open();
    },
    onAttachmentFrag:function(oEvent){

        if (!this.OnAttachmentFrag) {
            this.OnAttachmentFrag = new sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvgrn.view.fragments.Attachment", this);
            this.getView().addDependent(this.OnAttachmentFrag);
        }
        this.OnAttachmentFrag.open();
        
    },
    onConfirm:function(oEvent){

        vWithoutFile = "NO";
        // vRemark = sap.ui.getCore().byId('commentId').getValue();
        var sbfileDetails = oEvent.getParameters("file").files;
        var filesize = sbfileDetails[0].size;
        var fileSizeInBytes = filesize;
        var fileSizeInKB = fileSizeInBytes / 1024;
        var fileSizeInMB = fileSizeInKB / 1024;

        var fName = sbfileDetails[0].name;

        if (fileSizeInMB > 5) {
            BusyIndicator.hide();
            MessageBox.warning("File size should be less than or equal to 5MB", {
                icon: MessageBox.Icon.WARNING,
                title: "WARNING",
                actions: sap.m.MessageBox.Action.OK,
                emphasizedAction: sap.m.MessageBox.Action.OK
            });
        } else if (fName.includes(".pdf")|| fName.includes(".xlsx") || fName.includes(".docm") ||
        fName.includes(".docx") || fName.includes(".jpg") || fName.includes(".txt")) {
            this.sbfileUploadArr = [];
            if (sbfileDetails.lenghth != 0) {
                for (var i in sbfileDetails) {
                    var mimeDet = sbfileDetails[i].type,
                        fileName = sbfileDetails[i].name,
                        fileType = sbfileDetails[i].type;
                    this.sbfileName = fileName;
                    // Calling method....
                    this.sbBase64conversionMethod(mimeDet, fileName, sbfileDetails[i], fileType);
                }
            } else {
                this.sbfileUploadArr = [];
            }
        }
        else {
            BusyIndicator.hide();
            MessageBox.warning("Please select pdf File Type");
        }
    },
    sbBase64conversionMethod: function (fileMime, fileName, fileDetails, fileType) {

        var that = this;

        // that.OnGrnFrag.close();
        // that.OnGrnFrag.destroy();
        // that.OnGrnFrag = null;

        if (!FileReader.prototype.readAsBinaryString) {
        FileReader.prototype.readAsBinaryString = function (fileData) {
        var binary = "";
        var reader = new FileReader();
        reader.onload = function (e) {
        var bytes = e.reader.result;
        var length = bytes.byteLength;
        for (var i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        that.sbbase64ConversionRes = btoa(binary);
        that.sbfileUploadArr.push({
            "MimeType": fileMime,
            "FileName": fileName,
            "Content": that.sbbase64ConversionRes,
            "Type": fileType
        });};
        reader.readAsArrayBuffer(fileData);};}
        var reader = new FileReader();
        reader.onload = function (readerEvt) {
            var binaryString = readerEvt.target.result;
            that.sbbase64ConversionRes = btoa(binaryString);
            that.sbfileUploadArr = [];
            that.sbfileUploadArr.push({
                "MimeType": fileMime,
                "FileName": fileName,
                "Content": that.sbbase64ConversionRes,
                "Type": fileType
            });
            that._sbgetUploadedFiles();
        };
        reader.readAsBinaryString(fileDetails);
    },
    _sbgetUploadedFiles: function () {
        // ;
        var that = this;
        if (this.sbfileUploadArr.length != 0) {
            for (var fdata in this.sbfileUploadArr) {
                this.sbAttachmentArr = {
                    "FILE_NAME": this.sbfileUploadArr[fdata].FileName,
                    "FILE_MIMETYPE": this.sbfileUploadArr[fdata].MimeType,
                    "FILE_CONTENT": this.sbfileUploadArr[fdata].Content,
                    "FILE_TYPE": this.sbfileUploadArr[fdata].Type
                };
            }
        }
        this.sbfileUploadArr = [];
        BusyIndicator.hide();

        // MessageBox.information("Are you sure you want to accept GRN?",{
        //     actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        //     onClose: function (Action) {
        //         if(Action === "YES"){
        //             that.onAccept();
        //         }
        //     }
        // });
       
        // MessageBox.information("File uploaded, Are you sure you want to accept GRN?", {
        //     actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        //     onClose: function (oAction) {
        //     if (oAction === "YES") {
            vFILE_CONTENT = that.sbAttachmentArr.FILE_CONTENT;
            vFILE_MIMETYPE = that.sbAttachmentArr.FILE_MIMETYPE;
            vFILE_NAME = that.sbAttachmentArr.FILE_NAME;
            vFILE_TYPE = that.sbAttachmentArr.FILE_TYPE;

            that.OnAttachmentFrag.close();
            that.OnAttachmentFrag.destroy();
            that.OnAttachmentFrag = null;
            that.onAccept();
            // }
            // }
        // })
    },
    onWithoutFile:function(oEvent){
        
        vRemark = sap.ui.getCore().byId('commentId').getValue();
        if(!vRemark){
            MessageBox.information("Please Enter Remark")
            return;
        }
        that.OnGrnFrag.close();
        that.OnGrnFrag.destroy();
        that.OnGrnFrag = null;

        MessageBox.information("Are you sure you want to accept GRN?", {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (oAction) {
            if (oAction === "YES") {
                MessageBox.information("Do you want to upload POD?", {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                    if (oAction === "YES") {
                        that.onAttachmentFrag();
                    }
                    if (oAction === "NO") {
                        vWithoutFile = "X";
                        that.onAccept();
                    }
                    }
                })
            }
            }
        })
    },
    onAccept:function(oEvent){
       
        aData = that.getOwnerComponent().getModel("customerHeaderModel");
        var oUserData = that.getOwnerComponent().getModel("userModel");
        BusyIndicator.show();
        var aItems = [];
        // for(var i = 0;i<aData.oData.GRNHEADTOITEM.results.length;i++){
        //     var oItems = {
        //         INVOICE_NO : aData.oData.GRNHEADTOITEM.results[i].InvoiceNo,
        //         ITEM_NO : Number(aData.oData.GRNHEADTOITEM.results[i].InvoiceItem),
        //         MATERIAL_GROUP : "",
        //         MATERIAL_GROUP_DESC : "",
        //         MATERIAL_CODE : aData.oData.GRNHEADTOITEM.results[i].MaterialCode,
        //         MATERIAL_DESC : aData.oData.GRNHEADTOITEM.results[i].MaterialDesc,
        //         BATCH : aData.oData.GRNHEADTOITEM.results[i].Batch,
        //         EXPIRY_DATE : "2024-08-08",
        //         HSN_CODE : "",
        //         UNIT_OF_MEASURE : aData.oData.GRNHEADTOITEM.results[i].Uom,
        //         UNIT_PRICE : aData.oData.GRNHEADTOITEM.results[i].MrpPrice,
        //         PTR_PRICE : aData.oData.GRNHEADTOITEM.results[i].PtrPrice,
        //         PTS_PRICE : aData.oData.GRNHEADTOITEM.results[i].PtsPrice,
        //         OPENING_STOCK : "",
        //         QUANTITY : aData.oData.GRNHEADTOITEM.results[i].Quantity,
        //         ACCEPTED_QUANTITY : aData.oData.GRNHEADTOITEM.results[i].Quantity,
        //         CGST_PERC : aData.oData.GRNHEADTOITEM.results[i].CgstPercentage,
        //         CGST_AMOUNT : "",
        //         SGST_PERC : aData.oData.GRNHEADTOITEM.results[i].SgstPercentage,
        //         SGST_AMOUNT : "",
        //         IGST_PERC : aData.oData.GRNHEADTOITEM.results[i].IgstPercentage,
        //         IGST_AMOUNT : "",
        //         TAX_AMOUNT : "0.00",
        //         TOTAL_AMOUNT : "0.00"
        //     }
        //     aItems.push(oItems);
        // }
        var vDeliveryDate =new Date(aData.oData.DeliveryDate);
        var vInvoiceDate =  new Date(aData.oData.InvoiceDate);
        var vLrDate =  new Date(aData.oData.Lrdat);
        var vDeliveryDateCon = vDeliveryDate.toISOString().split('T')[0];
        var vInvoiceDateCon = vInvoiceDate.toISOString().split('T')[0];
        var vLrDateCon = vLrDate.toISOString().split('T')[0];

        var payload = {
            "sAction":"ACCEPT",
            "aGrnHeader":[{
                STOCKIST_ID : oUserData.oData.loginName,
                STOCKIST_NAME : oUserData.oData.userName,
                DELIVERY_NO :aData.oData.DeliveryNo,
                INVOICE_NO :aData.oData.InvoiceNo,
                INVOICE_DATE :vInvoiceDateCon,
                DELIVERY_DATE :vDeliveryDateCon,
                ACCEPTED_DATE :"2024-08-08",
                INVOICE_AMOUNT :aData.oData.DeliveryAmount,
                SAP_ORDER_NO :aData.oData.SalesorderNo,
                REMARK : vRemark,
                LR_NO : aData.oData.Lrno,
                LR_DATE : vLrDateCon,
                TRANSPORT_NAME : aData.oData.Trans,
                BILL_NO : aData.oData.EwayBillNo

            }],
            "aGrnAttachments":[{
                INVOICE_NO : aData.oData.InvoiceNo,
                FILE_NAME : vFILE_NAME,
                FILE_CONTENT : vFILE_CONTENT,
                FILE_MIMETYPE : vFILE_MIMETYPE,
                FILE_TYPE : vFILE_TYPE
            }],
            "oUserDetails":{
                "USER_ROLE" : vRole,
                "USER_ID"   : oUserData.oData.userId
            }
        }

        if(vWithoutFile === "X"){
            payload.aGrnAttachments = [];
        }

        var url = appModulePath + "/odata/v4/ideal-bsv-grn-srv/AcceptGrn";
        var Postdata = JSON.stringify(payload);
        $.ajax({
            url: url,
            type: 'POST',
            data: Postdata,
            contentType: 'application/json',
            success: function (data, responce) {
                BusyIndicator.hide();
                MessageBox.success(data.value, {
                    actions: [MessageBox.Action.OK],
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            BusyIndicator.hide();
                            that._onRouteMatched();
                        }
                    }
                });
            },
            error: function (e) {
                BusyIndicator.hide();
                var oXMLMsg, oXML;
                if (that.isValidJsonString(e.responseText)) {
                    oXML = JSON.parse(e.responseText);
                    oXMLMsg = oXML.error["message"];
                } else {
                    oXMLMsg = e.responseText;
                }
                MessageBox.error(oXMLMsg);
            }
        })
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
      },

      
      onNavigateOrderCreation: function (oEvent) {
        // 

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
    onNavigateLedger: function (oEvent) {
        // 

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
        })) || ""; // generate the Hash to display a Supplier

        //   var hash  = "#LedgerReport-Display?sap-ui-app-id-hint=saas_approuter_com.ibs.bsv.ibsappbsvcustomerledgerreport&";
        oCrossAppNavigator.toExternal({
            target: {
                shellHash: hash
            }
        });
    },
    onNavigateOrderHistory: function (oEvent) {
        // 

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
        })) || ""; // generate the Hash to display a Supplier

        //   var hash  = "#LedgerReport-Display?sap-ui-app-id-hint=saas_approuter_com.ibs.bsv.ibsappbsvcustomerledgerreport&";
        oCrossAppNavigator.toExternal({
            target: {
                shellHash: hash
            }
        });
    },


    onNavigateOrderStatus: function (oEvent) {
        // var param = {};
        var param = {"OrderStatus":"OST"};
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
        })); // generate the Hash to display a Supplier

        //   var hash  = "#LedgerReport-Display?sap-ui-app-id-hint=saas_approuter_com.ibs.bsv.ibsappbsvcustomerledgerreport&";
        oCrossAppNavigator.toExternal({
            target: {
                shellHash: hash
            }
        });
    },
    onNavigateGRN: function (oEvent) {


        // var param = {};
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
        })); // generate the Hash to display a Supplier

        //   var hash  = "#LedgerReport-Display?sap-ui-app-id-hint=saas_approuter_com.ibs.bsv.ibsappbsvcustomerledgerreport&";
        oCrossAppNavigator.toExternal({
            target: {
                shellHash: hash
            }
        });
    },

    
    onNavigateGRNReport: async function (oEvent) {
        var param = {}; // Define any parameters you need here
        var oSemantic = "grn_report"; // Define your semantic object
    
        try {
            // Asynchronously get the CrossApplicationNavigation service
            const oCrossAppNavigator = await sap.ushell.Container.getServiceAsync("CrossApplicationNavigation");
    
            if (oCrossAppNavigator) {
                // Generate the hash for the target application
                var hash = oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: oSemantic,
                        action: "display"
                    },
                    params: param
                });
    
                // Trigger the navigation using the generated hash
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

    
    onNavigateScheme: function (oEvent) {
        // var param = {};
        var param = {};
        var oSemantic = "dashboard";
        var hash = {};
        var additionalHash ="&/Scheme"
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
            }










    });
});
