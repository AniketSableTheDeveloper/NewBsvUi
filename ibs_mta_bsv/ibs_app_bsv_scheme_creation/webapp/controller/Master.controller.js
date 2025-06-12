sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "com/ibs/bsv/ibsappbsvschemecreation/model/formatter",
    "com/ibs/bsv/ibsappbsvschemecreation/model/down",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/library",
    "sap/m/library"
],
function (Controller,JSONModel,BusyIndicator,MessageBox,formatter,down,Filter,FilterOperator,exportLibrary,mobileLibrary) {
    "use strict";
    var URLHelper = mobileLibrary.URLHelper;
    var that,appId,appPath,appModulePath,vRole;
    var EdmType = exportLibrary.EdmType;
    return Controller.extend("com.ibs.bsv.ibsappbsvschemecreation.controller.Master", {
        formatter:formatter,
        onInit: function (oEvent) {
            
            that = this;
            var oRouter = this.getOwnerComponent().getRouter();
            that.getUserAttributes();
            oRouter.getRoute("RouteMaster");
            var getRoute = oRouter.getRoute("RouteMaster");
            // this.getView().byId('idCreationDatefltr').destroyDefaultFilterValues();
            getRoute.attachMatched(that._onRouteMatched, this);
        },
        _onRouteMatched:function(){
            var oTable = that.getView().byId("idSchemeTable");
            oTable.rebindTable();
            // oTable.getBinding("items").refresh();
        },
        onSelectionChange:function(oEvent){
            
            var vReference_ID = oEvent.getSource().getBindingContext().getObject().REFERENCE_ID;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Edit",{"REFERENCE_ID":vReference_ID});
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
                        var obj = {
                            userId: data.email.toLowerCase(),
                            userName: data.firstname + " " + data.lastname,
                            loginName: data.name
                            // .login_name[0]
                        }
                        var oModel = new JSONModel(obj);
                        that.getOwnerComponent().setModel(oModel, "userModel");
                    },
                    error: function (oError) {
                        // 
                        MessageBox.error("Error while reading User Attributes");
                    }
                });
            });
        },
        getUserRole:function(){
            that = this;
            var count = 0;
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);
            var attr = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/getUserAttributes";
            return new Promise(function (resolve, reject) {
                $.ajax({
                url: attr,
                type: 'GET',
                contentType: 'application/json',
                success: function (data, response) {
                    
                    for(var i =0; i<data.value.length; i++){
                        if(data.value[i] === "BSV_ADMIN"){
                            vRole = "ADMIN";
                            count++;
                        }
                    }
                    if(count > 0){
                        
                    }else{
                        MessageBox.error("Only Admin User Are Allowed");
                    }
                },
                error: function (oError) {
                    MessageBox.error("Error while reading User Attributes");
                }
            });
        });

        },
        onBeforeRebindTable: function(oEvent) { 
            
            var oBindingParams = oEvent.getParameter("bindingParams");
            if(oBindingParams.filters.length > 0){
                oBindingParams.sorter = [new sap.ui.model.Sorter({ path: "REFERENCE_ID", descending: true})];
                oBindingParams.parameters["expand"] = "TO_ATTACHMENT";
            }
            else{
                var vDate = new Date();
                var vStartDate = new Date(vDate.getFullYear(),vDate.getMonth(),1);
                var vEndDate = new Date(vDate.getFullYear(),vDate.getMonth() + 1,0);
                oBindingParams.filters = [new sap.ui.model.Filter("CREATION_DATE", sap.ui.model.FilterOperator.BT,vStartDate,vEndDate)];
                oBindingParams.sorter = [new sap.ui.model.Sorter({ path: "REFERENCE_ID", descending: true})];
                oBindingParams.parameters["expand"] = "TO_ATTACHMENT";
            }
            
        },
        onBeforeExport: function(oEvent) {
            
            var oExportSettings = oEvent.getParameter("exportSettings");
            var aColumns = oExportSettings.workbook.columns;

            var iValidFromColumnIndex = aColumns.findIndex(function (oColumn) {
                return oColumn.property === "VALID_FROM";
            });
            var iValidToColumnIndex = aColumns.findIndex(function (oColumn) {
                return oColumn.property === "VALID_TO";
            });
            var iCreationDateColumnIndex = aColumns.findIndex(function (oColumn) {
                return oColumn.property === "CREATION_DATE";
            });
           
            if (iValidFromColumnIndex !== -1 || iValidToColumnIndex !== -1 || iCreationDateColumnIndex !== -1) {
                aColumns[iValidFromColumnIndex] = {
                    label: 'Valid From',
                    type: EdmType.Date,
                    property: 'VALID_FROM',
                    textAlign: 'Center',
                    format:'dd.mm.yyyy'                    
                }
                aColumns[iValidToColumnIndex] = {
                    label: 'Valid To',
                    type: EdmType.Date,
                    property: 'VALID_TO',
                    textAlign: 'Center',
                    format:'dd.mm.yyyy'
                }
                aColumns[iCreationDateColumnIndex] = {
                    label: 'Creation Date',
                    type: EdmType.Date,
                    property: 'CREATION_DATE',
                    textAlign: 'Center',
                    format:'dd.mm.yyyy'
                }
                
            }
        },
        OnCreate : function(){
            BusyIndicator.show();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Detail");
        },
        CommentCloseButton: function (oEvent) {
			sap.ui.getCore().byId("myPopover").close();
		},
        onComment: async function(oEvent){ 
            BusyIndicator.show();
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);
            
            var vReferenceId = Number(oEvent.getSource().getParent().getAggregation('cells')[0].mProperties.text);
            await this.ReadCommentData(vReferenceId);
            var oButton = oEvent.getSource();
            if (!this.onCommentFrag) {
                this.onCommentFrag = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvschemecreation.view.fragments.onComments", this);
                this.getView().addDependent(that.onCommentFrag);
            }
            this.onCommentFrag.openBy(oButton);
        },
        ReadCommentData:function(vReferenceId){
            var vUrlReferenceId = "(REFERENCE_ID eq " + vReferenceId + ")";
            var path = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/SchemeHeader?$filter=" + vUrlReferenceId;
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
                    oXMLMsg = oXML.error["message"].value;
                } else {
                    oXMLMsg = error.responseText;
                }
                MessageBox.error(oXMLMsg);
            }
            });
        });
        },
        onDownload : function(oEvent){
            BusyIndicator.show();

            var fileId = 1;
            appId = that.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);
            var vReferenceId = Number(oEvent.getSource().getParent().getAggregation('cells')[0].mProperties.text);
            var url = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/SchemeAttachment(REFERENCE_ID="+vReferenceId+",FILE_ID="+fileId+")/$value";
            URLHelper.redirect(url, true);
            BusyIndicator.hide();


        //     appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        //     appPath = appId.replaceAll(".", "/");
        //     appModulePath = jQuery.sap.getModulePath(appPath);
        //     var vReferenceId = Number(oEvent.getSource().getParent().getAggregation('cells')[0].mProperties.text);
        //     // var vReferenceId = oEvent.getSource().getBindingContext('SchemeHeaderData').getObject().REFERENCE_ID;
        //     var vFile_Id = 1;
        //     var path = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/SchemeAttachment(REFERENCE_ID="+vReferenceId+",FILE_ID="+vFile_Id+")/$value";
        //     $.ajax({
        //     url: path,
        //     type: 'GET',
        //     contentType: 'application/json',
        //     success: function (data, responce) {
        //         that.fileType(vReferenceId, data);            
        //     },
        //     error: function (error) {
        //         BusyIndicator.hide();
        //         var oXMLMsg, oXML;
        //         if (that.isValidJsonString(error.responseText)) {
        //             oXML = JSON.parse(error.responseText);
        //             oXMLMsg = oXML.error["message"].value;
        //         } else {
        //             oXMLMsg = error.responseText;
        //         }
        //         MessageBox.error(oXMLMsg);
        //     }
        // });
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
        fileType : function(vReferenceId, data){
            var vReferenceId = "(REFERENCE_ID eq " + vReferenceId + ")";
            var path = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/SchemeAttachment?$filter=" + vReferenceId;
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
                oXMLMsg = oXML.error["message"].value;
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
  }
    });
});




// sap.ui.define([
//     "sap/ui/core/mvc/Controller"
// ],
// function (Controller) {
//     "use strict";

//     return Controller.extend("com.ibs.bsv.ibsappbsvschemecreation.controller.Master", {
//         onInit: function () {

//         }
//     });
// });
