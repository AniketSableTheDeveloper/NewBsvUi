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
    var that,appId,appPath,appModulePath,schemeJson;
    var attachdata = [];
    return Controller.extend("com.ibs.bsv.ibsappbsvschemecreation.controller.Detail", {
        formatter:formatter,
        onInit: function () {

            that = this;
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Detail");
            var getRoute = oRouter.getRoute("Detail");
            getRoute.attachMatched(that._onRouteMatched, this);

        },
        _onRouteMatched:function(){

            appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            appPath = appId.replaceAll(".", "/");
            appModulePath = jQuery.sap.getModulePath(appPath);

            // var oFromModel = new JSONModel({
            //     minDate: null,
            //     maxDate: null
            // });
            // that.getView().setModel(oFromModel, "FromModel");
            var vLength = this.getView().byId("groupB").getAggregation('buttons').length;
            for(var i = 0;i < vLength; i++){
                this.getView().byId("groupB").getAggregation('buttons')[i].setSelected(false);
            }
            
            var vDate = new Date();
            
            var vEndDate = new Date(vDate.getFullYear(),vDate.getMonth() + 1,0);
            var vStartDate = new Date(vDate.getFullYear(),vDate.getMonth());
            var oMinDateModel = new JSONModel({
                minDate: vStartDate,
                maxDate: vEndDate
            });
            that.getView().setModel(oMinDateModel, "minDateModel");
            that.readAttachData("");
        },
        readAttachData : function(data){
                attachdata = [{
                    "ATTACH_CODE": 1,
                    "ATTACH_NO": 1,
                    "ATTACH_NAME":data
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
            that.getView().byId("DvalidFromId").setValue();
            that.getView().byId("DvalidToId").setValue();
            that.getView().byId("commentId").setValue();
            that.readAttachData();

            // that.getView().byId("AttachmentSection").setVisible(false);
            // this.getView().byId("AttachmentSection").setVisible(false);
            
            // this.getView().byId("groupB").set
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMaster");
        },
        onSelect:function(oEvent){
            
            var vRadioIndex = that.getView().byId("groupB").getSelectedIndex();
            that.getView().byId("fileUploaderid").setEnabled(true);
            this.getView().byId("AttachmentSection").setVisible(true);
            if(vRadioIndex === 0)
            {
                that.readAttachData("Scheme");
                that.getView().byId("Uploadid").setRequired(true);
            }
            if(vRadioIndex === 1)
            {
                that.readAttachData("Broadcast");
                that.getView().byId("Uploadid").setRequired(false);
            }
        },
        onSubmit:function(){

            // var oUserData = that.getOwnerComponent().getModel("userModel");
            BusyIndicator.show();
            var userid ="cfa2@gmail.com";
            var dateFrom = this.getView().byId("DvalidFromId").getValue();
            var dateTo = this.getView().byId("DvalidToId").getValue();
            var vComment = this.getView().byId("commentId").getValue();
            var attachData = this.getView().getModel("schemeJson").getData();
           
            var vRadioIndex = that.getView().byId("groupB").getSelectedIndex();
            var vType;
            if(dateFrom === "" || dateTo === "" || dateFrom === null || dateTo === null || dateFrom === undefined || dateTo === undefined){
                MessageBox.warning("Please fill mandatory field")
                BusyIndicator.hide();
                return;
            }
            if(that.getView().byId("AttachmentSection").getVisible() === false){
                MessageBox.warning("Please Select Type")
                BusyIndicator.hide();
                return;
            }
            if(vRadioIndex === 0){
            vType = "Scheme";
            if(attachData[0].FILE_CONTENT === undefined || attachData[0].FILE_MIMETYPE === undefined){
                MessageBox.warning("Please Upload file");
                BusyIndicator.hide();
                return;
            }
            }
            if(vRadioIndex === 1){
                vType = "Broadcast";
                if(!vComment){
                    MessageBox.warning("Please Add Comment");
                    BusyIndicator.hide();
                    return;
                }
            }
            
            var vValidFrom =new Date(this.getView().byId("DvalidFromId").getValue());
            vValidFrom.setHours(vValidFrom.getHours() + 5);
            vValidFrom.setMinutes(vValidFrom.getMinutes() + 30);
            var vValidTo =  new Date(this.getView().byId("DvalidToId").getValue());
            vValidTo.setHours(vValidTo.getHours() + 5);
            vValidTo.setMinutes(vValidTo.getMinutes() + 30);
            var vValidFromCon = vValidFrom.toISOString().split('T')[0];
            var vValidToCon = vValidTo.toISOString().split('T')[0];
            var oPayload;
            if(attachData[0].FILE_CONTENT === undefined){
                oPayload = {
                    "sAction":"CREATE",
                    "aSchemeHeader":[{
                
                        "REFERENCE_ID":1,
                        "VALID_FROM":vValidFromCon,
                        "VALID_TO":vValidToCon,
                        "COMMENTS":vComment,
                        "CREATION_DATE":"2024-06-03T07:09:49.069Z",
                        "CREATED_BY": userid,
                        "TYPE": vType
                
                    }],
                    "aSchemeAttachment":[]
                }
            }
            else{
                 oPayload = {
                    "sAction":"CREATE",
                    "aSchemeHeader":[{
                
                        "REFERENCE_ID":1,
                        "VALID_FROM":vValidFromCon,
                        "VALID_TO":vValidToCon,
                        "COMMENTS":vComment,
                        "CREATION_DATE":"2024-06-03T07:09:49.069Z",
                        "CREATED_BY": userid,
                        "TYPE": vType
                
                    }],
                    "aSchemeAttachment":[{
                
                        "REFERENCE_ID":1,
                        "FILE_ID":1,
                        "FILE_NAME": attachData[0].FILE_NAME,
                        "FILE_CONTENT": attachData[0].FILE_CONTENT,
                        "FILE_MIMETYPE": attachData[0].FILE_MIMETYPE,
                        "FILE_TYPE": attachData[0].FILE_TYPE
                
                    }]
                }
            }
            
            var url = appModulePath + "/odata/v4/ideal-bsv-scheme-srv/schemeCreation";
            var Postdata = JSON.stringify(oPayload);
            
            $.ajax({
                url: url,
                type: 'POST',
                data: Postdata,
                contentType: 'application/json',
                success: function (data, responce) {

                    that.getView().byId("DvalidFromId").setValue();
                    that.getView().byId("DvalidToId").setValue();
                    that.getView().byId("commentId").setValue("");
                    that.getView().getModel("schemeJson").setData("");
                    that.getView().byId("AttachmentSection").setVisible(false);
                    // that.getView().byId("priceDifferentTable").getItems()[that.sbIndex].getCells()[1].setEnabled(true);
                    // that.getView().byId("priceDifferentTable").getItems()[that.sbIndex].getCells()[3].setEnabled(false);
                    // ;
                    BusyIndicator.hide();
                    MessageBox.success(data.value.OUT_SUCCESS, {
                        actions: [MessageBox.Action.OK],
                        onClose: function (oAction) {
                            if (oAction === "OK") {
                                BusyIndicator.hide();
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

                that.getView().byId("priceDifferentTable").getItems()[that.sbIndex].getCells()[1].setEnabled(false);
                that.getView().byId("priceDifferentTable").getItems()[that.sbIndex].getCells()[3].setEnabled(true);

                that.getView().getModel("schemeJson").refresh(true);
                }
                }
            })
        },
        onDelete : function(oEvent){
            BusyIndicator.show();
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
                    that.getView().byId("priceDifferentTable").getItems()[that.sbIndex].getCells()[1].setEnabled(true);
                    that.getView().byId("priceDifferentTable").getItems()[that.sbIndex].getCells()[3].setEnabled(false);
                    that.getView().getModel("schemeJson").refresh(true);
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
        onSchemeFrom:function(oEvent){
            that.getView().byId("DvalidToId").setValue();

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
