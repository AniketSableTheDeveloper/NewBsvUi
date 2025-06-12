sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "com/ibs/bsv/ibsappbsvschemecreation/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
function (Controller,JSONModel,BusyIndicator,MessageBox,formatter,Filter,FilterOperator) {
    "use strict";
    var that,appId,appPath,appModulePath,schemeJson,aRefernceId,vType;
    var attachdata = [];
    return Controller.extend("com.ibs.bsv.ibsappbsvschemecreation.controller.Edit", {
        formatter:formatter,
        onInit: function () {
            
            that = this;
            window.oFileUploader = [];
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Edit");
            var getRoute = oRouter.getRoute("Edit");
            getRoute.attachMatched(that._onRouteMatched, this);

        },
        _onRouteMatched:function(oEvent){
            
            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);

            aRefernceId = Number(oEvent.getParameters().arguments.REFERENCE_ID)
            that.getView().byId("Uploadid2").setRequired(false);
            that.getView().byId("editButton").setVisible(true);

            var vDate = new Date();
            
            var vEndDate = new Date(vDate.getFullYear(),vDate.getMonth() + 1,0);
            var vStartDate = new Date(vDate.getFullYear(),vDate.getMonth());
            var oMinDateModel = new JSONModel({
                minDate: vStartDate,
                maxDate: vEndDate
            });
            that.getView().setModel(oMinDateModel, "minDateModel");
            that.readData();
        },
        readData:function(){

            var url = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/SchemeHeader?$filter=REFERENCE_ID eq " + aRefernceId + "&$expand=TO_ATTACHMENT";

            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/json',
                success: function (data, responce) {
                    
                    var vdata = new JSONModel(data);
                    that.getView().setModel(vdata, "fetchData");
                    if(data.value[0].TYPE === "Scheme"){
                        vType = "Scheme";
                    }
                    if(data.value[0].TYPE === "Broadcast"){
                        vType = "Broadcast";
                    }
                    that.getView().byId("idTxtOrdCre2").setText(vType);
                    if(data.value[0].COMMENTS === null || data.value[0].COMMENTS === undefined || data.value[0].COMMENTS === "")
                    {
                        that.getView().byId("CommentSection2").setVisible(false);
                    }else{
                        that.getView().byId("CommentSection2").setVisible(true);
                    }
                    if(data.value[0].TO_ATTACHMENT === null || data.value[0].TO_ATTACHMENT === undefined){
                        
                        that.readAttachData(null,vType);
                    }
                    else{
                        that.readAttachData(data.value[0].TO_ATTACHMENT.FILE_NAME,vType);
                    }
                    that.getView().byId("priceDifferentTable2").getItems()[0].mAggregations.cells[1].setEnabled(false);
                    that.getView().byId("priceDifferentTable2").getItems()[0].mAggregations.cells[3].setEnabled(false);
                    
                },
                error: function (e) {
                    //
                    BusyIndicator.hide()
                    MessageBox.error(e.responseText);
                }
            });
        },
        onEdit:function(){
            if(vType === "Scheme"){
                that.getView().byId("Uploadid2").setRequired(true);
            }
            var cdata = that.getView().getModel("schemeJson").getData();
            
            if(cdata[0].FILE_NAME === null || cdata[0].FILE_NAME === ""){
                that.getView().byId("priceDifferentTable2").getItems()[0].mAggregations.cells[1].setEnabled(true);
                that.getView().byId("priceDifferentTable2").getItems()[0].mAggregations.cells[3].setEnabled(false);
            }
            else{
                that.getView().byId("priceDifferentTable2").getItems()[0].mAggregations.cells[1].setEnabled(false);
                that.getView().byId("priceDifferentTable2").getItems()[0].mAggregations.cells[3].setEnabled(true);
            }
            
            that.getView().byId("CommentSection2").setVisible(true);
            that.getView().byId("cancelId").setVisible(true);
            that.getView().byId("submitId2").setVisible(true);
            that.getView().byId("editButton").setVisible(false);
            that.getView().byId("vldFrom").setRequired(true);
            that.getView().byId("vldTo").setRequired(true);
            that.getView().byId("DvalidFromId2").setEditable(true);
            that.getView().byId("DvalidToId2").setEditable(true);
            that.getView().byId("commentId2").setEditable(true);
        
        },
        onCancel:function(){
            that.readData();
            that.getView().byId("Uploadid2").setRequired(false);
            that.getView().byId("cancelId").setVisible(false);
            that.getView().byId("submitId2").setVisible(false);
            that.getView().byId("editButton").setVisible(true);
            that.getView().byId("vldFrom").setRequired(false);
            that.getView().byId("vldTo").setRequired(false);
            that.getView().byId("DvalidFromId2").setEditable(false);
            that.getView().byId("DvalidToId2").setEditable(false);
            that.getView().byId("commentId2").setEditable(false);
            that.getView().byId("priceDifferentTable2").getItems()[0].mAggregations.cells[3].setEnabled(false);
            // that.getView().byId("priceDifferentTable").getItems()[that.sbIndex].getCells()[1].setEnabled(true);
            // that.getView().byId("priceDifferentTable").getItems()[that.sbIndex].getCells()[3].setEnabled(false);
            
            
        },
        readAttachData : function(data,Type){
                attachdata = [{
                    "ATTACH_CODE": 1,
                    "ATTACH_NO": 1,
                    "ATTACH_NAME":Type,
                    "FILE_NAME":data
                }]

            var schemeJson = new JSONModel();
            schemeJson.setData(attachdata);
            this.getView().setModel(schemeJson, "schemeJson");
            BusyIndicator.hide();
        },
        onNavBar:function(){
            if(that.getView().getModel("FromModel"))
            {
                var Mindate = new Date();
                that.getView().getModel("FromModel").setProperty("/minDate",Mindate)
            }
            that.getView().byId("DvalidFromId2").setValue();
            that.getView().byId("DvalidToId2").setValue();
            that.getView().byId("commentId2").setValue();
            that.readAttachData();

            that.onCancel();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMaster");
        },
        onSubmit:function(){

            // var oUserData = that.getOwnerComponent().getModel("userModel");
            BusyIndicator.show();
            var successMsg;
            var userid ="cfa2@gmail.com";
            var dateFrom = this.getView().byId("DvalidFromId2").getValue();
            var dateTo = this.getView().byId("DvalidToId2").getValue();
            var vComment = this.getView().byId("commentId2").getValue();
            var attachData;
            
            if(window.oFileUploader.length > 0){
                attachData = that.getOwnerComponent().getModel("schemeModelAlis").getData();
            }else{
                attachData = [];
            }

            if(dateFrom === "" || dateTo === "" || dateFrom === null || dateTo === null || dateFrom === undefined || dateTo === undefined){
                MessageBox.warning("Please fill mandatory field")
                BusyIndicator.hide();
                return;
            }
            if(vType === "Scheme"){
                
            if(attachData.length == 0){
                MessageBox.warning("Please Upload file");
                BusyIndicator.hide();
                return;
            }
            successMsg = "Scheme edited successfully";
            }
            if(vType === "Broadcast"){
                successMsg = "Broadcast edited successfully";
                if(!vComment){
                    MessageBox.warning("Please Add Comment");
                    BusyIndicator.hide();
                    return;
                }
            }
            var vValidFrom =new Date(this.getView().byId("DvalidFromId2").getValue());
            vValidFrom.setHours(vValidFrom.getHours() + 5);
            vValidFrom.setMinutes(vValidFrom.getMinutes() + 30);
            var vValidTo =  new Date(this.getView().byId("DvalidToId2").getValue());
            vValidTo.setHours(vValidTo.getHours() + 5);
            vValidTo.setMinutes(vValidTo.getMinutes() + 30);
            var vValidFromCon = vValidFrom.toISOString().split('T')[0];
            var vValidToCon = vValidTo.toISOString().split('T')[0];
            var oPayload;
            // if(attachData[0].FILE_CONTENT === undefined){
                oPayload = {
                    "sAction":"EDIT",
                    "aSchemeHeader":[{
                
                        "REFERENCE_ID":aRefernceId,
                        "VALID_FROM":vValidFromCon,
                        "VALID_TO":vValidToCon,
                        "COMMENTS":vComment,
                        "CREATION_DATE":"2024-06-03T07:09:49.069Z",
                        "CREATED_BY": userid,
                        "TYPE": vType
                
                    }],
                    "aSchemeAttachment":attachData
                }
            // }
            // else{
            //      oPayload = {
            //         "sAction":"EDIT",
            //         "aSchemeHeader":[{
                
            //             "REFERENCE_ID":aRefernceId,
            //             "VALID_FROM":vValidFromCon,
            //             "VALID_TO":vValidToCon,
            //             "COMMENTS":vComment,
            //             "CREATION_DATE":"2024-06-03T07:09:49.069Z",
            //             "CREATED_BY": userid,
            //             "TYPE": vType
                
            //         }],
            //         "aSchemeAttachment":attachData
            //     }
            // }
            
            var url = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/schemeCreation";
            var Postdata = JSON.stringify(oPayload);
            $.ajax({
                url: url,
                type: 'POST',
                data: Postdata,
                contentType: 'application/json',
                success: function (data, responce) {
                    if(attachData.length > 0){
                        that.secondHitAttachment(data.value.OUT_SUCCESS,1,successMsg);
                    }else{
                        BusyIndicator.hide();
                        MessageBox.success(successMsg, {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (oAction) {
                            if (oAction === 'OK') {
                                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                                    oRouter.navTo("RouteMaster");
                                }
                            }
                        });
                    }
                    that.onCancel();
                },
                error: function (e) {
                    var oXMLMsg, oXML;
                    BusyIndicator.hide();
                    if (that.isValidJsonString(e.responseText)) {
                        oXML = JSON.parse(e.responseText);
                        oXMLMsg = oXML.error["message"].value;
                    } else {
                        oXMLMsg = e.responseText;
                    }
                    MessageBox.error(oXMLMsg);
                }
            });
        },
        secondHitAttachment:function(referenceNo,fileId,successMsg){
            var appId = that.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);

            var content = that.getOwnerComponent().getModel("schemeModelAlis").getData();
            var url = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/SchemeAttachment(REFERENCE_ID=" + referenceNo +",FILE_ID=" + fileId + ")/FILE_CONTENT"

            var oFileUploader = window.oFileUploader;
            var oFile = oFileUploader[0];
            // type
            var oBlob = new Blob([oFile ], { type: oFile.type });

            // Use FormData to send the file
            var oFormData = new FormData();
            oFormData.append("file", oBlob, oFile.name);

            // Perform AJAX PUT request
            $.ajax({
                url: url,
                type: "PUT",
                data: oBlob,
                processData: false, 
                contentType: oFile.FILE_TYPE, 
                success: function () {
                    BusyIndicator.hide();
                    window.oFileUploader = [];
                    MessageBox.success(successMsg, {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (oAction) {
                        if (oAction === 'OK') {
                            // window.oFileUploader = [];
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                                oRouter.navTo("RouteMaster");
                            }
                        }
                    });
                },
                error: function (e) {
                    var oXMLMsg, oXML;
                    BusyIndicator.hide();
                    if (that.isValidJsonString(e.responseText)) {
                        oXML = JSON.parse(e.responseText);
                        oXMLMsg = oXML.error["message"].value;
                    } else {
                        oXMLMsg = e.responseText;
                    }
                    MessageBox.error(oXMLMsg);
                }
            });
        },
        handleUploadNew : function(oEvent){
            BusyIndicator.show();
            if(oEvent.mParameters.files[0].size == undefined || oEvent.mParameters.files[0].size == null){

            }else{
            var filesize = oEvent.mParameters.files[0].size;
            var fileSizeInKB = filesize / 1024;
            var fileSizeInMB = fileSizeInKB / 1024;
            if (fileSizeInMB > 5) {
              MessageBox.warning("File size should be less than or equal to 5MB", {
                  icon: MessageBox.Icon.WARNING,
                  title: "WARNING",
                  actions: sap.m.MessageBox.Action.OK,
                  emphasizedAction: sap.m.MessageBox.Action.OK
              });
            }else{
            this.sbIndex = parseInt(oEvent.getSource().getBindingContext("schemeJson").getPath().split("/")[1]);
            var oSchemeUpload = [{
              REFERENCE_ID : 1,
              FILE_ID : 1,
              FILE_NAME : oEvent.mParameters.files[0].name,
              FILE_CONTENT : "",
              FILE_MIMETYPE : oEvent.mParameters.files[0].type,
              FILE_TYPE :  oEvent.mParameters.files[0].type
            }]
            var schemeModel = new JSONModel(oSchemeUpload);
            that.getOwnerComponent().setModel(schemeModel, "schemeModelAlis");
            
            window.oFileUploader = oEvent.getParameter('files');

            BusyIndicator.hide();
            MessageBox.success("Your file has been uploaded successfully", {
                actions: [MessageBox.Action.OK],
                onClose: function (oAction) {
                if (oAction === "OK") {
                // attachdata[that.sbIndex].FILE_CONTENT = that.sbAttachmentArr.FILE_CONTENT;
                // attachdata[that.sbIndex].FILE_MIMETYPE = that.sbAttachmentArr.FILE_MIMETYPE;
                // attachdata[that.sbIndex].FILE_NAME = that.sbAttachmentArr.FILE_NAME;
                // attachdata[that.sbIndex].FILE_TYPE = that.sbAttachmentArr.FILE_TYPE;

                that.getView().byId("priceDifferentTable2").getItems()[that.sbIndex].getCells()[1].setEnabled(false);
                that.getView().byId("priceDifferentTable2").getItems()[that.sbIndex].getCells()[3].setEnabled(true);
                that.getView().getModel("schemeJson").setProperty('/'+that.sbIndex+'/FILE_NAME', oEvent.mParameters.files[0].name)
                that.getView().getModel("schemeJson").refresh(true);
                }
                }
            })
          }
          }
        },
        handleUpload : function(oEvent){
        BusyIndicator.show();
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
        } else if (fName.includes(".pdf")||fName.includes(".xlsx")) {

            this.sbIndex = parseInt(oEvent.getSource().getBindingContext("schemeJson").getPath().split("/")[1]);
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
        sbBase64conversionMethod: function (fileMime, fileName, fileDetails, fileType) {
            var that = this;
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
            MessageBox.success("Your file has been uploaded successfully", {
                actions: [MessageBox.Action.OK],
                onClose: function (oAction) {
                    
                if (oAction === "OK") {
                attachdata[that.sbIndex].FILE_CONTENT = that.sbAttachmentArr.FILE_CONTENT;
                attachdata[that.sbIndex].FILE_MIMETYPE = that.sbAttachmentArr.FILE_MIMETYPE;
                attachdata[that.sbIndex].FILE_NAME = that.sbAttachmentArr.FILE_NAME;
                attachdata[that.sbIndex].FILE_TYPE = that.sbAttachmentArr.FILE_TYPE;

                that.getView().byId("priceDifferentTable2").getItems()[that.sbIndex].getCells()[1].setEnabled(false);
                that.getView().byId("priceDifferentTable2").getItems()[that.sbIndex].getCells()[3].setEnabled(true);

                that.getView().getModel("schemeJson").refresh(true);
                }
                }
            })
        },
        onDelete : function(oEvent){
            
            BusyIndicator.show();
            window.oFileUploader = [];
            this.sbIndex = parseInt(oEvent.getSource().getBindingContext("schemeJson").getPath().split("/")[1]);
            BusyIndicator.hide();
            MessageBox.information("Are you sure you want to delete the file ?",{
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function (Action) {
                if(Action === "YES"){
                    // BusyIndicator.hide();
                    var oModel = that.getView().getModel("schemeJson").getData()[that.sbIndex];
                    oModel.FILE_CONTENT = null;
                    oModel.FILE_NAME = "";
                    oModel.FILE_MIMETYPE = null;
                    oModel.FILE_TYPE = "";
                    that.getView().byId("priceDifferentTable2").getItems()[0].mAggregations.cells[1].setEnabled(true);
                    that.getView().byId("priceDifferentTable2").getItems()[0].mAggregations.cells[3].setEnabled(false);
                    that.getView().getModel("schemeJson").refresh(true);
                }
            }
        });
        },
        onSchemeFrom:function(oEvent){
            that.getView().byId("DvalidToId2").setValue();

            var oFromModel = new JSONModel({
                minDate: null,
                maxDate: null
            });
            that.getView().setModel(oFromModel, "FromModel");

            var vDate = new Date(oEvent.getParameters().value);
            var vEndDate = new Date(vDate.getFullYear(),vDate.getMonth() + 1,0);
            var vMindate = new Date(vDate.setDate(vDate.getDate()+1));
            that.getView().getModel("FromModel").setProperty("/minDate",vMindate)
            that.getView().getModel("FromModel").setProperty("/maxDate",vEndDate);
            
        }
    });
});
