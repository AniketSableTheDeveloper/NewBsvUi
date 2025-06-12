sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
	"sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel"
], (Controller,MessageBox,MessageToast,BusyIndicator,JSONModel) => {
    "use strict";
    var that,appId,appPath,appModulePath;
    return Controller.extend("com.ibs.bsv.ibsappbsvmateriallist.controller.View1", {
    onInit() {
        that = this;
        that.oDataModel = this.getOwnerComponent().getModel();
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("RouteView1").attachPatternMatched(this._onRouteMatched, this);
    },
    _onRouteMatched:function(){

        BusyIndicator.show(); 
        appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        appPath = appId.replaceAll(".", "/");
        appModulePath = jQuery.sap.getModulePath(appPath);
        that.getUserAttributes();
        // BusyIndicator.hide(); 
        
    },
    getUserAttributes:function(){
        that = this;
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
                    BusyIndicator.hide();
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
                BusyIndicator.hide(); 
                for(var i =0; i<data.value.length; i++){
                    if(data.value[i] === "BSV_ADMIN"){
                        var vRole = "ADMIN";
                        count++;
                    }
                }
                if(count > 0){
                    that.readMaterialData();
                }else{
                    MessageBox.error("Only Admin User Are Allowed");
                }
            },
            error: function (oError) {
                BusyIndicator.hide();
                MessageBox.error("Error while reading User Attributes");
            }
        });
    });
    },
    readMaterialData:function(){      
        var url = appModulePath + "/sap/opu/odata/sap/ZIDEAL_ODATA_SALESORDER_SRV/ACTIVEMATERIALSet";
        $.ajax({
            url: url,
            type: "GET",
            contentType: 'application/json',
            dataType:'JSON',
            success: function (oData, response) {
                
                var oModel = new JSONModel(oData.d.results);
                that.getView().setModel(oModel,"materialSet");
                BusyIndicator.hide();
            },  
            error:function(error){
                BusyIndicator.hide();
                var oXMLMsg, oXML;
                if (that.isValidJsonString(error.responseText)) {
                    oXML = JSON.parse(error.responseText);
                    oXMLMsg = oXML.error["message"].value;
                } else {
                    oXMLMsg = error.responseText
                }
                MessageBox.error(oXMLMsg);
            }
        })    
    },
    onAddMaterial:function(){
        if (!this.MaterialFrag) {
            this.MaterialFrag = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvmateriallist.view.fragments.createMaterial", this);
            this.getView().addDependent(this.MaterialFrag);
        }
        this.MaterialFrag.open();
       
    },
    handleValueMaterialHelp:function(){
        if (!this.selectMaterialFrag) {
            this.selectMaterialFrag = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvmateriallist.view.fragments.selectMaterials", this);
            this.getView().addDependent(this.selectMaterialFrag);
        }
        this.selectMaterialFrag.open();
        BusyIndicator.show();
        that.readMaterials();
    },
    readMaterials:function(){
        var url = appModulePath + "/sap/opu/odata/sap/ZIDEAL_ODATA_SALESORDER_SRV/MaterialVHSet";
        $.ajax({
            url: url,
            type: "GET",
            contentType: 'application/json',
            dataType:'JSON',
            success: function (oData, response) {
                
                var oModel = new JSONModel(oData.d.results);
                that.getView().setModel(oModel,"materialsModel");
                BusyIndicator.hide();
            },  
            error:function(error){
                BusyIndicator.hide();
                var oXMLMsg, oXML;
                if (that.isValidJsonString(error.responseText)) {
                    oXML = JSON.parse(error.responseText);
                    oXMLMsg = oXML.error["message"].value;
                } else {
                    oXMLMsg = error.responseText
                }
                MessageBox.error(oXMLMsg);
            }
        })    
    },
    materialOnserch: function (oEvent) {
        var sQuery = oEvent.getSource().getValue();
        var pFilter = [];
        if (sQuery) {
          var oFilter1 = [new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.Contains, sQuery),
          new sap.ui.model.Filter("MaterialDesc", sap.ui.model.FilterOperator.Contains, sQuery)];
          var allFilters = new sap.ui.model.Filter(oFilter1, false);
          pFilter.push(allFilters);
        }
        var listItem = sap.ui.getCore().byId("material_listId");
        var item = listItem.getBinding("items");
        item.filter(pFilter);
    },
    closeSelectMaterialFrag:function(){
        var oDialog = sap.ui.getCore().byId("selectMaterialid");
        if (oDialog) {
            oDialog.close();
        }
    },
    closeCreateMaterialFrag:function(){
        var oDialog = sap.ui.getCore().byId("materialDialog");
        if (oDialog) {
            oDialog.close();
        }
        sap.ui.getCore().byId("id_material").setValue("");
    },
    MaterialSelection1: function (oEvent) {
        sap.ui.getCore().byId("materialSearchfield_Id").setValue("");
        var selectedObject = oEvent.getSource().getSelectedItem().getBindingContext("materialsModel").getObject();
        var productSelected = selectedObject.MaterialCode;
        sap.ui.getCore().byId("id_material").setValue(productSelected);
        that.closeSelectMaterialFrag();
    },
    onSubmitMaterial:function(){
        BusyIndicator.show();
        var sData = sap.ui.getCore().byId("id_material").getValue();
        var oData = {
            "Material" : sData
        }
        that.oDataModel.create("/ACTIVEMATERIALSet", oData, {
            success: function(data, response){
                that.closeCreateMaterialFrag();
                that.onRefresh();
                sap.ui.getCore().byId("id_material").setValue("");
                BusyIndicator.hide();
                MessageBox.success("Material successfully added");
            },
            error: function(error){
                BusyIndicator.hide();
                var oXMLMsg, oXML;
                if (that.isValidJsonString(error.responseText)) {
                    oXML = JSON.parse(error.responseText);
                    oXMLMsg = oXML.error["message"].value;
                } else {
                    oXMLMsg = error.responseText
                }
                MessageBox.error(oXMLMsg);
                // MessageBox.error("Error while adding the data");
            }
        });
    },
    onSwitch:function(oEvent){
        BusyIndicator.show();
        var sStatus;
        var sMaterial = oEvent.getSource().getBindingContext("materialSet").getObject().Material;
        if(oEvent.mParameters.state == true){sStatus = "ACTIVE"}else{sStatus = "INACTIVE"}
        var oData = {
            "Material": sMaterial,
            "Status" : sStatus
        } 
        var path = "/ACTIVEMATERIALSet('" + sMaterial + "')";
        that.oDataModel.update(path, oData, {
            method: "PUT",
            merge: false,  
            success: function(data, response){
                that.onRefresh();
                BusyIndicator.hide();
                MessageBox.success("Material successfully updated");
            },
            error: function(error){
                BusyIndicator.hide();
                var oXMLMsg, oXML;
                if (that.isValidJsonString(error.responseText)) {
                    oXML = JSON.parse(error.responseText);
                    oXMLMsg = oXML.error["message"].value;
                } else {
                    oXMLMsg = error.responseText
                }
                MessageBox.error(oXMLMsg);
                // MessageBox.error("Error while adding the data");
            }
        });
    },
    onDelete:function(oEvent){
        BusyIndicator.show();
        var sMaterial = oEvent.getSource().getBindingContext("materialSet").getObject().Material;
        var path = "/ACTIVEMATERIALSet('" + sMaterial + "')";
        that.oDataModel.remove(path, { 
        success: function(data, response){
            that.onRefresh();
            BusyIndicator.hide();
            MessageBox.success("Material successfully deleted");
        },
        error: function(error){
            BusyIndicator.hide();
            var oXMLMsg, oXML;
            if (that.isValidJsonString(error.responseText)) {
                oXML = JSON.parse(error.responseText);
                oXMLMsg = oXML.error["message"].value;
            } else {
                oXMLMsg = error.responseText
            }
            MessageBox.error(oXMLMsg);
        }
        });
    },
    onRefresh:function(){
        BusyIndicator.show();
        that._onRouteMatched();
        BusyIndicator.hide();
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
        new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.Contains, data),
        new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, data),
        // new sap.ui.model.Filter("SalesorderNo", sap.ui.model.FilterOperator.Contains, data),
        ], false);
        aFilters.push(oFilter);  
        that.getView().byId("idMaterialTable").getBinding("items").filter(aFilters);
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
    });
});