sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "com/ibs/bsv/ibsappbsvpocreation/model/formatter",
    "com/ibs/bsv/ibsappbsvpocreation/model/down",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
function (Controller,JSONModel,BusyIndicator,MessageBox,formatter,down,Filter,FilterOperator) {
    "use strict";
    var that,appId,appPath,appModulePath;
    return Controller.extend("com.ibs.bsv.ibsappbsvpocreation.controller.Scheme", {
        formatter:formatter,
        onInit: function (oEvent) {
            // 
            that = this;

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Scheme").attachPatternMatched(this._onRouteMatched, this);
    
        },
        _onRouteMatched: function (oEvent) {
            // 
            // BusyIndicator.hide();
           
    
            var g = this.getView().getParent().getParent();
            g.toBeginColumnPage(this.getView());
    
          
         
    
    
    
    
    
    
    
          },
        onBeforeRebindTable: function(oEvent) { 
            // ;
            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.sorter = [new sap.ui.model.Sorter({ path: "REFERENCE_ID", descending: true})];
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
            // 
            var vReferenceId = Number(oEvent.getSource().getParent().getAggregation('cells')[0].mProperties.text);
            await this.ReadCommentData(vReferenceId);
            var oButton = oEvent.getSource();
            if (!this.onCommentFrag) {
                this.onCommentFrag = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvpocreation.view.fragments.onComments", this);
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
                    oXMLMsg = oXML.error["message"];
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
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);
            var vReferenceId = Number(oEvent.getSource().getParent().getAggregation('cells')[0].mProperties.text);
            // var vReferenceId = oEvent.getSource().getBindingContext('SchemeHeaderData').getObject().REFERENCE_ID;
            var vFile_Id = 1;
            var path = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/SchemeAttachment(REFERENCE_ID="+vReferenceId+",FILE_ID="+vFile_Id+")/$value";
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
        fileType : function(vReferenceId, data){
            // ;
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
            
        }
    });
});




// sap.ui.define([
//     "sap/ui/core/mvc/Controller"
// ],
// function (Controller) {
//     "use strict";

//     return Controller.extend("com.ibs.bsv.ibsappbsvpocreation.controller.Master", {
//         onInit: function () {

//         }
//     });
// });
