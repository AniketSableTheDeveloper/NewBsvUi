sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
	"sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel",
    "com/ibs/bsv/ibsappbsvgrnreport/model/down",
    "com/ibs/bsv/ibsappbsvgrnreport/model/formatter",
    "sap/ui/export/library"
],
function (Controller,MessageBox,MessageToast,BusyIndicator,JSONModel,down,formatter,exportLibrary) {
    "use strict";
    var that,appId,appPath,appModulePath;
    var PropertyModel;
    return Controller.extend("com.ibs.bsv.ibsappbsvgrnreport.controller.View1", {
        formatter:formatter,
        onInit:function () {
            that = this;

            sap.ushell.Container.getRenderer(
                "fiori2"
                ).hideHeaderItem(
                "backBtn"
                , false);

            that.oDataModel = this.getOwnerComponent().getModel("S4Service");

            PropertyModel = that.getOwnerComponent().getModel("PropertyModel");
            
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteView1");
            
            var getRoute = oRouter.getRoute("RouteView1");
            getRoute.attachMatched(that._onRouteMatched, this);
        },
        _onRouteMatched:function(){
            BusyIndicator.show(); 
            that.checkDevice();
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);
            this.getView().byId("oSearchMasterData").setValue("");
            that.getUserAttributes();
            
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
                        var url = appModulePath + "/odata/v4/ideal-bsv-grn-srv/GrnHeader?$filter=STOCKIST_ID eq '"+stockist+"'"+"&$expand=TO_ITEMS_REF";
                        that.readAcceptedEntity(url,"GET","grnAcceptedInvoice");

                    },
                    error: function (oError) {
                        // 
                        MessageBox.error("Error while reading User Attributes");
                    }
                });
            });
        },
        readAcceptedEntity:function(url, type,sAlisName){       
            $.ajax({
                url: url,
                type: type,
                contentType: 'application/json',
                dataType:'JSON',
                success: function (oData, response) {
                    
                    BusyIndicator.hide();
                    var oModel = new JSONModel(oData.value);
                    that.getView().setModel(oModel,sAlisName);
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
    CommentCloseButton:function(){
        that.onCommentFrag.close();
        that.onCommentFrag.destroy();
        that.onCommentFrag = null;
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
            // new sap.ui.model.Filter("DeliveryNo", sap.ui.model.FilterOperator.Contains, data),
            new sap.ui.model.Filter("INVOICE_NO", sap.ui.model.FilterOperator.Contains, data),
            new sap.ui.model.Filter("SAP_ORDER_NO", sap.ui.model.FilterOperator.Contains, data),
            ], false);
            aFilters.push(oFilter);  
            that.getView().byId("idOrdersTable").getBinding("items").filter(aFilters);
    }
    },
    checkAttachment: async function(sInvoiceNo){
            var vInvoiceNo = "(INVOICE_NO eq " + sInvoiceNo + ")";
            var path = appModulePath + "/odata/v4/ideal-bsv-grn-srv/GrnAttachments?$filter=" + vInvoiceNo;
            return new Promise(function(resolve,reject){
                $.ajax({
                    url: path,
                    type: 'GET',
                    contentType: 'application/json',
                    success: function (data, responce) {
                        
                        if(data.value.length === 0)
                        {   
                            resolve(true);
                        }else{ 
                            resolve(false);
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
            })
            
    },
    onDownload : async function(oEvent){
        BusyIndicator.show();
        
       
        appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        appPath = appId.replaceAll(".", "/");
        appModulePath = jQuery.sap.getModulePath(appPath);
        var vInvoiceNo = Number(oEvent.getSource().getParent().getAggregation('cells')[0].mProperties.text);
        var BfileData = await that.checkAttachment(vInvoiceNo);
        if(BfileData === true){
            BusyIndicator.hide();
            MessageBox.information("No Attachment Found");
        }
        else{
        var path = appModulePath + "/odata/v4/ideal-bsv-grn-srv/GrnAttachments(INVOICE_NO="+vInvoiceNo+")/$value";
        $.ajax({
        url: path,
        type: 'GET',
        contentType: 'application/json',
        success: function (data, responce) {
            that.fileType(vInvoiceNo, data);            
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
        }
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
    fileType : function(sInvoiceNo, data){
        var vInvoiceNo = "(INVOICE_NO eq " + sInvoiceNo + ")";
        var path = appModulePath + "/odata/v4/ideal-bsv-grn-srv/GrnAttachments?$filter=" + vInvoiceNo;
        var FILE_CONTENT = data;
        $.ajax({
        url: path,
        type: 'GET',
        contentType: 'application/json',
        success: function (data, responce) {
        if (data.value.length > 0) {
            that.downloadFileContent(data.value[0].FILE_TYPE || null, data.value[0].FILE_NAME, data.value[0].FILE_MIMETYPE, FILE_CONTENT);
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
    onComment: async function(oEvent){ 
        BusyIndicator.show();
        appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        appPath = appId.replaceAll(".", "/");
        appModulePath = jQuery.sap.getModulePath(appPath);
        
        var vInvoiceNo = Number(oEvent.getSource().getParent().getAggregation('cells')[0].mProperties.text);
        var oUserData = that.getOwnerComponent().getModel("userModel");
        var vStockistId =  oUserData.oData.loginName;
        await this.ReadCommentData(vInvoiceNo,vStockistId);
        var oButton = oEvent.getSource();
        if (!this.onCommentFrag) {
            this.onCommentFrag = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvgrnreport.view.fragments.onComments", this);
            this.getView().addDependent(that.onCommentFrag);
        }
        this.onCommentFrag.openBy(oButton);
    },
    ReadCommentData:function(vInvoiceNo,vStockistId){
        
        var path = appModulePath + "/odata/v4/ideal-bsv-grn-srv/GrnHeader?$filter=STOCKIST_ID eq '"+vStockistId+"' and INVOICE_NO eq '"+vInvoiceNo+"'";
        return new Promise(function(resolve,reject){
        $.ajax({
        url: path,
        type: 'GET',
        contentType: 'application/json',
        success: function (data, responce) {
            
            var oModel = new JSONModel(data);
            that.getView().setModel(oModel,"sCommentJson"); 
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
            }
    });
});
