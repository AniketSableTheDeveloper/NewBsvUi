sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/ui/core/BusyIndicator",
  "com/ibs/bsv/ibsappbsvpocreation/model/formatter",
  "com/ibs/bsv/ibsappbsvpocreation/model/down",
  "com/ibs/bsv/ibsappbsvpocreation/model/jszip",
  "sap/m/Token",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/Device"
],
  function (Controller, JSONModel, MessageBox, BusyIndicator, formatter, down, jszip, Token, Filter, FilterOperator, Device) {
    "use strict";
    var that;
    var selectedObject;
    var temobj
    var StockistDetails
    var selectedOrderType;
    var temparray
    var appModulePath
    var PropertyModel;
    var sapModel;
    var MaterialGrp;
    var MaterialCode
    var ShipFrom;
    var ShipTo;
    var enteredRefID;
    var login_ID;
    var ShipFromEmail
    var Schemecode;
    var temObject
    var results
    var headerModel;
    var EventsmModel;
    var lineitemModel;
    var StockistId
    var selectedKey;
    var MinQty;
    var selectedSchemeCode;
    return Controller.extend("com.ibs.bsv.ibsappbsvpocreation.controller.RequestCreation", {
      formatter: formatter,
      onInit: function () {
        that = this;
        window.oFileUploader = that.getView().byId("fileUploader");
        temObject = {
          results: []
        }
        var PriceModel = new JSONModel({ results: [] });
        that.getView().setModel(PriceModel, "PriceModel");
        PropertyModel = that.getOwnerComponent().getModel("PropertyModel");
        headerModel = that.getOwnerComponent().getModel("headerModel");
        lineitemModel = that.getOwnerComponent().getModel("LineItemModel");
        EventsmModel = that.getOwnerComponent().getModel("EventsmModel");
        sapModel = that.getOwnerComponent().getModel("ZIDEAL_ODATA_SALESORDER_SRV");
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("RequestCreation").attachPatternMatched(this._onRouteMatched, this);
        PropertyModel.setProperty("/Count", "Products(" + 0 + ")")
      },

      _onRouteMatched: function (oEvent) {
        BusyIndicator.hide();
        PropertyModel.setProperty("/Menu", false);
        that.checkDevice();
        that._userdetails();
        var Code = oEvent.getParameter('arguments').CustomerCode;
        var g = this.getView().getParent().getParent();
        g.toBeginColumnPage(this.getView());
        var model = new JSONModel(StockistDetails);
        that.getView().setModel(model, "stockistDetail");
        var currentdate = new Date();
        var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" });
        var formattedDate = oDateFormat.format(currentdate);
        that.getView().byId("id_Date").setText(formattedDate);
      },

      // User Attributes function to fetch login user's code 
      _userdetails: function () {
        var url;
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);
        url = appModulePath + "/user-api/attributes";

        // 101265
        // login_ID ="101486" // when run locally.
        // that.readHeaderSet(login_ID) // when run locally.
        // that.readShipToSet(login_ID);// when run locally.
        // that.readCredit(login_ID); // when run locally.

        return new Promise(function (resolve, reject) {
          $.ajax({
            url: url,
            type: 'GET',
            contentType: 'application/json',
            success: function (data, response) {              
              login_ID = data.name // fetching login_name value to name property
              // login_ID = data.login_name[0]; // commented on 26-11-2024 
              that.readHeaderSet(login_ID)
              that.readShipToSet(login_ID);
              that.readCredit(login_ID);
            },
            error: function (oError) {
                MessageBox.error("Error while reading user attributes");
            }
          });
        }); // after deploy

      },

      // Read SO_HEADERSet function
      readHeaderSet: function (login_ID) {
        BusyIndicator.show();
        var StockistID = new Filter("StockistId", "EQ", login_ID)
        sapModel.read("/SO_HEADERSet", {
          filters: [StockistID],
          success: function (Data, response) {
            var hedaerMo = new JSONModel(Data.results[0]);
            ShipFrom = Data.results[0].ShipFrom;
            ShipFromEmail = Data.results[0].ShipFromEmail;
            that.getView().setModel(hedaerMo, "headerModel");
            BusyIndicator.hide();
          },
          error: function (oError) {
            MessageBox.error(oError.responseText);
            BusyIndicator.hide();
          }
        });
      },

      // To check same product
      updaterowitem: function (iMTCode, sSchemeCode) {
        var aMaterialDetails = that.getView().getModel("PriceModel").getData().results
        if (aMaterialDetails.length > 0) {
          for (let i = 0; i < aMaterialDetails.length; i++) {
            if (iMTCode === aMaterialDetails[i].MaterialCode) {
              aMaterialDetails.splice(i, 1);
              i--;
            }
          }
          that.getView().getModel("PriceModel").setData({ results: aMaterialDetails });
          that.getView().getModel("PriceModel").refresh();
        }
      },
      uploadPoFile:function(oEvent){
          debugger
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
          var oPoUpload = [{
            PURCHASE_REQUEST_NO : 1,
            FILE_ID : 1,
            FILE_NAME : oEvent.mParameters.files[0].name,
            FILE_CONTENT : "",
            FILE_MIMETYPE : oEvent.mParameters.files[0].type
          }]
          var PoUploadModel = new JSONModel(oPoUpload);
          that.getOwnerComponent().setModel(PoUploadModel, "mPoUploadModel");
          window.oFileUploader = that.getView().byId("fileUploader");
        }

        }
          // that.getView().setModel("")
      },
      //Order Type drop-down select function(Not in use)
      handleScheme: function (oEvent) {
        Schemecode = oEvent.getParameters().selectedItem.mProperties.key
        var a = oEvent.getParameters().selectedItem.mProperties.text;
        if (a === "ORDER WITHOUT SCHEME") {
          MinQty = 1;
        } else {
          var b = a.split(', ')
          var c = b[0];
          var d = c.split(' ');
          MinQty = parseInt(d[1], 10);
        }
        that.updaterowitem(MaterialCode, Schemecode);
        that.readPRICESet(MaterialCode, Schemecode, ShipTo, ShipFrom, MinQty, null, selectedOrderType);
      },

      // Order Quantity Input change function
      priceChange: function (oEvent) {
        var oBindingthat = oEvent.getSource().getBindingContext("PriceModel");
        var ordertype = oEvent.getSource().getBindingContext("PriceModel").getObject().Ordertype
        var sSplitArray = oEvent.getSource().sId.split("-");
        var oModel = oBindingthat.getModel();
        var sPath = oBindingthat.getPath();
        var iIndex = parseInt(sPath.split("/")[2], 10);
        var a = oEvent.getSource().getValue();
        MaterialCode = that.getView().getModel("PriceModel").getData().results[iIndex].MaterialCode;
        selectedSchemeCode = that.getView().getModel("PriceModel").getData().results[iIndex].Schemecode;
        MinQty = Number(a);
        var newOrderQty = parseFloat(oEvent.getParameter("value")) || 0;
        var item = oModel.getProperty(sPath);
        if (item.OrderQuantity === "") {
          item.OrderQuantity = "0";
        }
        var price = parseFloat(item.NirPrice) || 0;
        var cgst = parseFloat(item.CgstPercentage) || 0;
        var sgst = parseFloat(item.SgstPercentage) || 0;
        var baseAmount = newOrderQty * price;
        var totalTax = (baseAmount * (cgst + sgst)) / 100;
        var totalAmount = baseAmount + totalTax;
        var table = that.getView().byId("idTemporaryTable")
        table.getModel("PriceModel").refresh(true);
        table.rerender()
        if (ordertype === '3') {
          var sapModel = that.getView().getModel("PriceModel").getData().results;
          sapModel.forEach(function (item) {
            var orderQty = parseFloat(item.OrderQuantity) || 0;
            var nirPrice = parseFloat(item.NirPrice) || 0;
            var baseAmount = parseFloat((orderQty * nirPrice).toFixed(2));
            item.TotalAmount = baseAmount;
          });
          that.getView().getModel("PriceModel").refresh();
        }
        else {
          that.readPRICESet(MaterialCode, selectedSchemeCode, ShipTo, ShipFrom, MinQty, iIndex, selectedOrderType);
        }
      },

      // Read SHIPTOF4Set function 
      readShipToSet: function (login_ID) {
        BusyIndicator.show();
        var StockistID = new Filter("StockistId", "EQ", login_ID)
        sapModel.read("/SHIPTOF4Set", {
          filters: [StockistID],
          success: function (Data, response) {
            var ShipToModel = new JSONModel(Data.results[0]);
            ShipTo = Data.results[0].ShipTo;
            that.getView().setModel(ShipToModel, "ShipToModel");
            BusyIndicator.hide();
          },
          error: function (oError) {
            MessageBox.error(oError.responseText);
            BusyIndicator.hide();
          }
        });
      },

      // Read MATGROUPF4Set function(Not in use)
      readCallMaterialGrp: function () {
        BusyIndicator.show();
        sapModel.read("/MATGROUPF4Set", {
          success: function (Data, response) {
            var MaterialGrpModel = new JSONModel(Data);
            that.getView().setModel(MaterialGrpModel, "MaterialGrp");
            BusyIndicator.hide();
          },
          error: function (oError) {
            MessageBox.error(oError.responseText);
            BusyIndicator.hide();
          }
        });
      },

      // Read MATERIALF4Set function
      readCallMaterial: function () {
        BusyIndicator.show();
        var StockistID = [];
        StockistID.push(new Filter("StockistId", "EQ", login_ID));
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

      //Read SCHEMESet function
      readCallMaterialScheme: function (MaterialCode, selectedOrderType) {
        BusyIndicator.show();
        var MaterialGroupCode = [];
        var Objec, array;
        if (MaterialCode != null && MaterialCode != undefined && MaterialCode != "") {
          MaterialGroupCode.push(new Filter("MaterialCode", "EQ", MaterialCode));
        }
        sapModel.read("/SCHEMESet", {
          filters: MaterialGroupCode,
          success: function (Data, response) {
            if (Data.results.length > 0) {
              if (!that.schemepopup) {
                that.schemepopup = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvpocreation.view.fragments.schemepopup", that);
                that.getView().addDependent(that.schemepopup);
              }
              that.schemepopup.open();
            }
            if (Data.results.length === 0 && selectedOrderType === "2") {
              Schemecode = ""
              MinQty = 1
              that.readPRICESet(MaterialCode, Schemecode, ShipTo, ShipFrom, MinQty, sPath, selectedOrderType);
            }
            else if (selectedOrderType === "1") {
              if (Data.results.length === 0) {
                MessageBox.information("For selected Product there is no Scheme available", {
                  actions: [MessageBox.Action.OK],
                  emphasizedAction: MessageBox.Action.OK,
                  onClose: function (oAction) {
                    if (oAction === 'OK') {
                      Schemecode = ""
                      MinQty = 1
                      that.readPRICESet(MaterialCode, Schemecode, ShipTo, ShipFrom, MinQty, null, null);
                    }
                  }
                });
              }
            }
            if (Array.isArray(Data.results)) {
              Data.results.forEach(function (item) {
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

      
      navigateToView1: function () {
        that.getView().byId("id_Item").setValue();
        that.getView().byId("idSchmeComBo").setValue();
        that.getView().byId("idReferenceID").setValue();
        that.getView().byId("idRemark").setValue();
        that.getView().byId("idMatScheme").setVisible(false);
        that.getView().byId("idSchmeComBo").setVisible(false);
        that.getView().getModel("PriceModel").setData({ results: [] }); // added 5-08
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RouteMaster");
      },

      padToTwoDigits: function (number) {
        return number.toString().padStart(2, '0');
      },
      padToThreeDigits: function (number) {
        return number.toString().padStart(3, '0');
      },
      RefereneceIDChange: function (oEvent) {
        if (oEvent.getSource().getValue()) {
          that.getView().byId("idReferenceID").setValueState("None");
        }
        enteredRefID = oEvent.getSource().getValue();
        that.readHeaderSet_referencID(enteredRefID);
      },

      // Read PrHeader function to check same reference ID
      readHeaderSet_referencID: function (enteredRefID) {
        BusyIndicator.show();
        var aCreated = [],
          aApproved = [],
          model;
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath);
        var url = appModulePath + "/odata/v2/ideal-bsv-purchase-order-srv/PrHeader?$filter=REFERENCE_ID eq '" + enteredRefID + "'";
        $.ajax({
          url: url,
          type: 'GET',
          data: null,
          contentType: 'application/json',
          success: function (data, responce) {
            BusyIndicator.hide();
            if (data.d.results.length === 0) {

            }
            else if (data.d.results.length > 0) {
              MessageBox.information("Entered Reference Number already exists, please enter new reference Number.")
              that.getView().byId("idReferenceID").setValue();
            }
          },
          error: function (e) {
            BusyIndicator.hide();
            MessageBox.error(e.responseText);
          }
        });
      },

      // Read REFIDCHECKSet function
      referIDCheck: function (enteredRefID) {
        var aFilters = [
          new Filter("StockistId", "EQ", login_ID),
          new Filter("Refid", "EQ", enteredRefID)
        ];
        sapModel.read("/REFIDCHECKSet?$filter=( StockistId eq '" + login_ID + "' and Refid eq '" + enteredRefID + "')", {
          success: function (Data, response) {
            var Model = new JSONModel(Data);
            that.getView().setModel(Model);
          },
          error: function (Error) {
            MessageBox.error(Error.responseText);
          }
        });
      },

      //
      validateRequestRate: function () {
        var table = this.getView().byId("idTemporaryTable").getItems();
        var isValid = true;
        table.forEach(function (row) {
          var requestRateInput = row.getCells()[6];
          if (requestRateInput.getVisible()) {
            var requestRateValue = requestRateInput.getValue();
            if (!requestRateValue) {
              requestRateInput.setValueState(sap.ui.core.ValueState.Error);
              requestRateInput.setValueStateText("Request Rate cannot be empty.");
              isValid = false;
            } else {
              requestRateInput.setValueState(sap.ui.core.ValueState.None);
            }
          }
        });
        if (!isValid) {
          sap.m.MessageBox.information("Please provide the Request Rate");
        }
        return isValid;
      },

      //Review Order button code
      onSubmitData: function () {
        var ReferenceID = that.getView().byId("idReferenceID").getValue();
        var lineItemModelLength = that.getView().getModel("PriceModel").getData().results;
        var lineItemModel = that.getView().getModel("PriceModel").getData().results;
        var table = that.getView().byId("idTemporaryTable").getItems();
        var isOrdQty = true;
        var isREQQty = true;
        for (var i = 0; i < lineItemModel.length; i++) {
          if (Number(lineItemModel[i].OrderQuantity) === 0) {
            isOrdQty = false;
          }
          else if (selectedKey === "3" && lineItemModel[i].RequestRate === "0.00") {
            isREQQty = false;
          }
        }
        if (isOrdQty === false) {
          MessageBox.information("Order Quantity Should not be Zero.")
        }
        else if (isREQQty === false) {
          MessageBox.information("Request Rate Should not be Zero.")
        }
        else {
          // Added Request Rate Input empty Validation 20-10-2024 MK
          var isValid = true;
          table.forEach(function (row) {
            var requestRateInput = row.getCells()[6];
            if (requestRateInput.getVisible()) {
              var requestRateValue = requestRateInput.getValue();
              if (!requestRateValue) {
                requestRateInput.setValueState(sap.ui.core.ValueState.Error);
                requestRateInput.setValueStateText("Request Rate cannot be empty.");
                isValid = false;
              } else {
                requestRateInput.setValueState(sap.ui.core.ValueState.None);
              }
            }
          });
          if (!isValid) {
            sap.m.MessageBox.information("Please provide the Request Rate");
          }
          else {
            if (ReferenceID === "") {
              that.getView().byId("idReferenceID").setValueState("Error").setValueStateText("Reference ID is mandatory.");
              MessageBox.information("Please Enter Reference Number");
            }
            else if (lineItemModelLength.length === 0) {
              MessageBox.information("Please add Product in order to Preview Order");
            }
            else if (that.getView().byId("idRemark").getValueState() === "Error") {
              MessageBox.information("Please enter remark within 50 characters");
            }
            else if (that.getView().byId("idRemark").getValue() != "") {
              var creationdate = new Date();
              var year = creationdate.getUTCFullYear();
              var month = that.padToTwoDigits(creationdate.getUTCMonth() + 1);
              var day = that.padToTwoDigits(creationdate.getUTCDate());
              var hours = that.padToTwoDigits(creationdate.getUTCHours());
              var minutes = that.padToTwoDigits(creationdate.getUTCMinutes());
              var seconds = that.padToTwoDigits(creationdate.getUTCSeconds());
              var milliseconds = that.padToThreeDigits(creationdate.getUTCMilliseconds());
              var cg
              var sg
              var ig
              var isoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
              var hedearData = that.getView().getModel("headerModel").getData();
              var Shipdetails = that.getView().getModel("ShipToModel").getData();
              var Materials = that.getView().getModel("PriceModel").getData().results;
              var TotalAmt = 0;
              var GrandTotalAmount = 0;
              var GrandTotalTaxAmount = 0;
              var GrandTotal = 0;
              for (var i = 0; i < Materials.length; i++) {
                var TotalAmt = parseFloat(Materials[i].TotalAmount);
                var cg = parseFloat(Materials[i].CgstPercentage);
                var sg = parseFloat(Materials[i].SgstPercentage);
                var ig = parseFloat(Materials[i].IgstPercentage);
                var totalTaxAmount = parseFloat(((TotalAmt * (cg + sg + ig)) / 100).toFixed(2));
                GrandTotalAmount += TotalAmt;
                GrandTotalTaxAmount += totalTaxAmount;
              }
              GrandTotal = parseFloat((GrandTotalAmount + GrandTotalTaxAmount).toFixed(2));
              var Remark = that.getView().byId("idRemark").getValue();
              var MTarray = [];
              var hedaerData = {
                "CREATION_DATE": isoString,
                "STOCKIST_ID": "101486",
                "STOCKIST_NAME": "V.G.Raja",
                "REFERENCE_ID": that.getView().byId("idReferenceID").getValue(),
                "SHIP_TO": Shipdetails.ShipTo,
                "SHIP_NAME": Shipdetails.ShipToName,
                "SHIP_FROM": hedearData.ShipFrom,
                "SHIP_FROM_NAME": hedearData.ShipFromName,
                "PAYMENT_METHOD_CODE": hedearData.PaymentTermCode,
                "ORDER_TYPE": selectedOrderType,
                "PAYMENT_METHOD_DESCRIPTION": hedearData.PaymentTermName,
                "STATUS": 1,
                "LAST_UPDATED_DATE": "",
                "NOTIFICATION_IDS": ShipFromEmail,
                "TOTAL_AMOUNT": parseFloat(GrandTotalAmount.toFixed(2)),
                "TAXES_AMOUNT": parseFloat(GrandTotalTaxAmount.toFixed(2)),
                "TCS_AMOUNT": "0.00",
                "GRAND_TOTAL": GrandTotal,
              }
              var eventsobject = {
                "COMMENTS": that.getView().byId("idRemark").getValue()
              }
              var model = new JSONModel(hedaerData);
              var MaterialModel = new JSONModel(Materials);
              var EventModel = new JSONModel(eventsobject);
              that.getOwnerComponent().getModel("headerModel").setData(model);
              that.getOwnerComponent().getModel("LineItemModel").setData(MaterialModel);
              that.getOwnerComponent().getModel("EventsmModel").setData(EventModel);
              that.ExcelSubmission()
            }
            else if (that.getView().byId("idRemark").getValue() === "") {
              MessageBox.information("Would you like to add a remark? Otherwise, you can proceed.", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                  if (oAction === 'YES') {
                  }
                  else if (oAction === 'NO') {
                    var creationdate = new Date();
                    var year = creationdate.getUTCFullYear();
                    var month = that.padToTwoDigits(creationdate.getUTCMonth() + 1);
                    var day = that.padToTwoDigits(creationdate.getUTCDate());
                    var hours = that.padToTwoDigits(creationdate.getUTCHours());
                    var minutes = that.padToTwoDigits(creationdate.getUTCMinutes());
                    var seconds = that.padToTwoDigits(creationdate.getUTCSeconds());
                    var milliseconds = that.padToThreeDigits(creationdate.getUTCMilliseconds());
                    var cg
                    var sg
                    var ig
                    var isoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
                    var hedearData = that.getView().getModel("headerModel").getData();
                    var Shipdetails = that.getView().getModel("ShipToModel").getData();
                    var Materials = that.getView().getModel("PriceModel").getData().results;
                    var TotalAmt = 0;
                    var GrandTotalAmount = 0;
                    var GrandTotalTaxAmount = 0;
                    var GrandTotal = 0;
                    for (var i = 0; i < Materials.length; i++) {
                      var TotalAmt = parseFloat(Materials[i].TotalAmount);
                      var cg = parseFloat(Materials[i].CgstPercentage);
                      var sg = parseFloat(Materials[i].SgstPercentage);
                      var ig = parseFloat(Materials[i].IgstPercentage);
                      var totalTaxAmount = parseFloat(((TotalAmt * (cg + sg + ig)) / 100).toFixed(2));
                      GrandTotalAmount += TotalAmt;
                      GrandTotalTaxAmount += totalTaxAmount;
                    }
                    GrandTotal = parseFloat((GrandTotalAmount + GrandTotalTaxAmount).toFixed(2));
                    var Remark = that.getView().byId("idRemark").getValue();
                    var MTarray = [];
                    var hedaerData = {
                      "CREATION_DATE": isoString,
                      "STOCKIST_ID": "101486",
                      "STOCKIST_NAME": "V.G.Raja",
                      "REFERENCE_ID": that.getView().byId("idReferenceID").getValue(),
                      "SHIP_TO": Shipdetails.ShipTo,
                      "SHIP_NAME": Shipdetails.ShipToName,
                      "SHIP_FROM": hedearData.ShipFrom,
                      "SHIP_FROM_NAME": hedearData.ShipFromName,
                      "ORDER_TYPE": selectedOrderType,
                      "PAYMENT_METHOD_CODE": hedearData.PaymentTermCode,
                      "PAYMENT_METHOD_DESCRIPTION": hedearData.PaymentTermName,
                      "STATUS": 1,
                      "LAST_UPDATED_DATE": "",
                      "NOTIFICATION_IDS": ShipFromEmail,
                      "TOTAL_AMOUNT": parseFloat(GrandTotalAmount.toFixed(2)),
                      "TAXES_AMOUNT": parseFloat(GrandTotalTaxAmount.toFixed(2)),
                      "TCS_AMOUNT": "0.00",
                      "GRAND_TOTAL": GrandTotal,
                    }
                    var eventsobject = {
                      "COMMENTS": that.getView().byId("idRemark").getValue()
                    }
                    var model = new JSONModel(hedaerData);
                    var MaterialModel = new JSONModel(Materials);
                    var EventModel = new JSONModel(eventsobject);
                    that.getOwnerComponent().getModel("headerModel").setData(model);
                    that.getOwnerComponent().getModel("LineItemModel").setData(MaterialModel);
                    that.getOwnerComponent().getModel("EventsmModel").setData(EventModel);
                    that.ExcelSubmission()
                  }
                }
              });
            }
          }
        }
      },
      ExcelSubmission: function () {
        var router = sap.ui.core.UIComponent.getRouterFor(that);
        router.navTo("createdorders")
      },
      handleValueGroupHelp: function () {
        if (!this.grpFragment) {
          this.grpFragment = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvpocreation.view.fragments.materialgroup", this);
          this.getView().addDependent(this.grpFragment);
        }
        that.readCallMaterialGrp();
        that.grpFragment.open();
      },
      closeContactCountryDialog: function () {
        this.grpFragment.close();
        this.grpFragment.destroy();
        this.grpFragment = null;
      },
      // Not in Use
      handleOTHContactCountrySearch: function (oEvent) {
        var sQuery = oEvent.getSource().getValue();
        var pFilter = [];
        if (sQuery) {
          var oFilter1 = [new sap.ui.model.Filter("MatgroupDesc", sap.ui.model.FilterOperator.Contains, sQuery),
          new sap.ui.model.Filter("MatgroupCode", sap.ui.model.FilterOperator.Contains, sQuery)];
          var allFilters = new sap.ui.model.Filter(oFilter1, false);
          pFilter.push(allFilters);
        }
        var listItem = sap.ui.getCore().byId("contactcntry_listId");
        var item = listItem.getBinding("items");
        item.filter(pFilter);
      },

      contactOTHCountrySelection: function (oEvent) {
        MaterialGrp = oEvent.getSource().getSelectedItem().getBindingContext("MaterialGrp").getObject().MatgroupCode
        var MaterialGrpDesc = oEvent.getSource().getSelectedItem().getBindingContext("MaterialGrp").getObject().MatgroupDesc
        this.closeContactCountryDialog()
      },
      closeContactCountryDialog: function () {
        this.grpFragment.close();
        this.grpFragment.destroy();
        this.grpFragment = null;
      },

      //Material dialog
      handleValueProductHelp: function (oEvent) {
        var checkOrderType = that.getView().byId("idType").getSelectedKey();
        if (!checkOrderType) {
          MessageBox.information("Kindly select the Order Type first.");
        }
        else {
          if (!this.MaterialFragment) {
            this.MaterialFragment = sap.ui.xmlfragment("com.ibs.bsv.ibsappbsvpocreation.view.fragments.material", this);
            this.getView().addDependent(this.MaterialFragment);
          }
          var table = that.getView().byId("idTemporaryTable")
          var tableItems = table.getItems();
          that.readCallMaterial(MaterialGrp);
          that.MaterialFragment.open();
        }
      },
      closeContactCountryDialog1: function () {
        this.MaterialFragment.close();
        this.MaterialFragment.destroy();
        this.MaterialFragment = null;
      },

      //Product Selection   
      MaterialSelection1: function (oEvent) {
        var selectedObject = oEvent.getSource().getSelectedItem().getBindingContext("Materials").getObject();
        MaterialCode = selectedObject.MaterialCode;
        var productSelected = selectedObject.MaterialDesc;
        that.getView().byId("id_Item").setValue(productSelected);
        that.closeContactCountryDialog1();
        var price = selectedObject.MRP_PRICE;
        var igstPercentage = selectedObject.IGST_PERC;
        var quantity = selectedObject.OrderQuantity;
        selectedObject.TOTAL_AMOUNT = (quantity * price) + ((quantity * price) * (igstPercentage / 100));
        var model = new sap.ui.model.json.JSONModel(temobj);
        that.getView().setModel(model, "tempmodel");
        var selectedOrderType = that.getView().byId("idType").getSelectedKey();
        if (selectedOrderType === "1") {
          that.getView().byId("idRequestedRate").setVisible(false);
          that.readCallMaterialScheme(MaterialCode, selectedOrderType);
        }
        else if (selectedOrderType === "3") {
          that.getView().byId("idMatScheme").setVisible(false);
          that.getView().byId("idSchmeComBo").setVisible(false);
          that.getView().byId("idRequestedRate").setVisible(true);
          MinQty = 1;
          that.readPRICESet(MaterialCode, "", ShipTo, ShipFrom, MinQty, null, selectedOrderType);
        }
      },

      //New Delete button code added 23-10-2024
      onDelete: function (oEvent) {
        MessageBox.information("Are you sure you want to delete the Product?", {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: function (Action) {
            if (Action === "YES") {
              var oModel = that.getView().getModel("PriceModel").getData();
              var selectedProduct = oEvent.getSource().getParent().getBindingContext("PriceModel").getObject().MaterialCode;
              var nIndex = parseInt(oEvent.getSource().getParent().getBindingContext("PriceModel").sPath.split("/")[2], 10);
              var cIndex = nIndex + 1;
              var pMat = oEvent.getSource().getParent().getBindingContext("PriceModel").getModel().oData.results[cIndex]?.MaterialCode;
              if (oModel.results.length === 1) {
                oModel.results = [];
              } else {
                if (selectedProduct === pMat) {
                  oModel.results.splice(nIndex + 1, 1); 
                  oModel.results.splice(nIndex, 1);
                } else {
                  oModel.results.splice(nIndex, 1);
                }
              }
              var count = oModel.results.length;
              PropertyModel.setProperty("/Count", "Products(" + count + ")")
              that.getView().getModel("PriceModel").setData(oModel);
              that.getView().getModel("PriceModel").refresh(true);
            }
          }
        });
      },

      //
      postAjaxs: function (url, type, data, model) {
        $.ajax({
          url: url,
          type: type,
          contentType: 'application/json',
          data: data,
          success: function (data, response) {
            BusyIndicator.hide();
            MessageBox.success(data.value, {
              actions: [MessageBox.Action.OK],
              onClose: function (oAction) {
                if (oAction === "OK") {
                  that.onBack();
                }
              }
            });
          },
          error: function (error) {
            BusyIndicator.hide();
            var oXMLMsg, oXML;
            if (that.isValidJsonString(error.responseText)) {
              oXML = JSON.parse(error.responseText);
              if (oXML.error['code'] === "301") {
                that.dupRegisteredTaxId(oXML.error['message']);
              }
              else {
                oXMLMsg = oXML.error.message;
                MessageBox.error(oXMLMsg);
              }
            } else {
              oXMLMsg = error.responseText;
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
      onTemplateDownload: function (oEvent) {
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        appModulePath = jQuery.sap.getModulePath(appPath)
        var url = appModulePath + "/odata/v4/ideal-bsv-purchase-order-srv/PrTemplate(TEMPLATE_ID=1)/$value"  //26 - previous
        var that = this;
        $.ajax({
          url: url,
          type: "GET",
          contentType: 'application/json',
          success: function (Data, response) {
            if (Data !== undefined) {
              that.downloadAttachment(Data, "Material list.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            } else {
              MessageBox.error("Template not found please contact Admin");
            }
          },
          error: function (error) {
            var oXML, oXMLMsg;
            oXML = JSON.parse(error.responseText);
            oXMLMsg = oXML.error["message"];
            oXMLMsg = error.responseText
            MessageBox.error(oXMLMsg);
          }
        });
      },

      onDownload: function (oEvent) {
        var that = this;
        var attachObj;
        var attachModel = oEvent.getSource().mBindingInfos.enabled.parts[0].model;
        attachObj = oEvent.getSource().getBindingthat(attachModel).getObject();
        that.downloadAttachment(attachObj.TEMPLATE_CONTENT, attachObj.TEMPLATE_NAME, attachObj.TEMPLATE_MIMETYPE);
      },

      downloadAttachment: function (content, fileName, mimeType) {
        download("data:application/octet-stream;base64," + content, fileName, mimeType);
        var HttpRequest = new XMLHttpRequest();
        HttpRequest.responseType = 'blob';
        HttpRequest.onload = function (e) {
          download(HttpRequest.response, fileName, mimeType);
        };
        HttpRequest.send();
      },
      templateUpload: function (sValue, fileData) {
        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        var appPath = appId.replaceAll(".", "/");
        var appModulePath = jQuery.sap.getModulePath(appPath)
        var url = appModulePath + "/odata/v4/ideal-bsv-purchase-order-srv/templateUpload";
        var oPayload =
        {
          "aPrTemplate": [
            {
              "TEMPLATE_ID": 1,
              "TEMPLATE_NAME": fileData.name,
              "TEMPLATE_CONTENT": btoa(sValue),
              "TEMPLATE_MIMETYPE": fileData.type,
              "TEMPLATE_TYPE": fileData.type
            }
          ]
        }
        var data = JSON.stringify(oPayload);
        this.postAjaxs(url, "POST", data, "uploadTemplate");
      },
      handleValueChange: function (oEvent) {
        sap.ui.getCore().fileUploadArr = [];
        var fileData = oEvent.getParameters("items").files[0];
        this.fileDecodingMethod(fileData, "001", fileData);
      },
      fileDecodingMethod: function (uploadedFileData, DocNum, fileData) {
        var that = this;
        var fileMime = uploadedFileData.type;
        var fileName = uploadedFileData.name;
        if (!FileReader.prototype.readAsBinaryString) {
          FileReader.prototype.readAsBinaryString = function (fileData) {
            var binary = "";
            var reader = new FileReader();
            reader.onload = function (e) {
              var bytes = new Uint8Array(reader.result);
              var length = bytes.byteLength;
              for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              that.base64ConversionRes = btoa(binary);
              sap.ui.getCore().fileUploadArr.push({
                "DocumentType": DocNum,
                "MimeType": fileMime,
                "FileName": fileName,
                "Content": that.base64ConversionRes,
              });
            };
            reader.readAsArrayBuffer(fileData);
          };
        }
        var reader = new FileReader();
        reader.onload = function (readerEvt) {
          var binaryString = readerEvt.target.result;
          that.base64ConversionRes = btoa(binaryString);
          that.templateUpload(that.base64ConversionRes, fileData);
        };
        reader.readAsBinaryString(uploadedFileData);
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
      
      onClickRefresh: function (oEvent) {
        var that = this;
        that.getView().byId("id_Item").setValue("");
        that.getView().byId("idSchmeComBo").setValue("");
        that.getView().byId("idSchmeComBo").setSelectedKey("");
        that.getView().byId("idType").setValue("");
        that.getView().byId("fileUploader").setValue("");
        var PoUploadModel = new JSONModel([]);
        that.getOwnerComponent().setModel(PoUploadModel, "mPoUploadModel");
        that.getView().byId("idType").setSelectedKey("");
        that.getView().byId("idMatScheme").setVisible(false);
        that.getView().byId("idSchmeComBo").setVisible(false);
        var oComboBox = that.getView().byId("idType");
        var aItems = oComboBox.getItems();
        aItems.forEach(function (item) {
          item.setEnabled(true);
        });
        var oModel = that.getView().getModel("PriceModel");
        oModel.setData({ results: [] });
        oModel.refresh(true);
        var count = oModel.oData.results.length
        PropertyModel.setProperty("/Count", "Products(" + count + ")")
      },


      readPRICESet: function (MaterialCode, Schemecode, ShipTo, ShipFrom, MinQty, iIndex, selectedOrderType) {
        var that = this;
        BusyIndicator.show();
        Schemecode = Schemecode || "";
        var table = that.getView().byId("idTemporaryTable").getItems();
        var tbllen = table.length
        var duplicateArray = []
        var aFilters = [
          new Filter("MaterialCode", "EQ", MaterialCode),
          new Filter("Schemecode", "EQ", Schemecode),
          new Filter("ShipTo", "EQ", ShipTo),
          new Filter("ShipFrom", "EQ", ShipFrom),
          new Filter("OrderQuantity", "EQ", MinQty),
          new Filter("Ordertype", "EQ", selectedOrderType)
        ];
        sapModel.read("/PRICESet", {
          filters: aFilters,
          success: function (oData, response) {
            BusyIndicator.hide();
            that.getView().getModel("PriceModel").refresh(true);
            var aResults = oData.results;
            var duplicateFlag = false;
            for (var i = 0; i < oData.results.length; i++) {
              if (oData.results[i].Ordertype === "1") {
                oData.results[i].applied_scheme = "X"
              }
            }
            if (oData.results[0].Message != "") {
              MessageBox.information(oData.results[0].Message);
            }
            else {
              aResults.forEach(function (item) {
                var orderQty = parseFloat(item.OrderQuantity) || 0;
                var nirPrice = parseFloat(item.NirPrice) || 0;
                var cgst = parseFloat(item.CgstPercentage) || 0;
                var sgst = parseFloat(item.SgstPercentage) || 0;
                var igst = parseFloat(item.IgstPercentage) || 0;
                var baseAmount = parseFloat((orderQty * nirPrice).toFixed(2));
                var totalTax = (baseAmount * (cgst + sgst + igst)) / 100;
                var totalAmount = baseAmount + totalTax;
                item.TotalAmount = baseAmount;
                item.isEditable = item.Freegoods !== "X";
              });
              if (iIndex != undefined && iIndex != null && iIndex != "") {
                var iMTCode = that.getView().getModel("PriceModel").getData().results[iIndex].MaterialCode;
                var sSchemeCode = that.getView().getModel("PriceModel").getData().results[iIndex].Schemecode;
                that.updaterowitem(iMTCode, sSchemeCode);
              } else {
                that.updaterowitem(MaterialCode, sSchemeCode);
              }
              var aExistingData = that.getView().getModel("PriceModel").getData().results;
              var aUpdatedData = aExistingData.concat(aResults);
              aUpdatedData.forEach(function (item) {
                item.OrderQuantity = Math.floor(item.OrderQuantity);
                item.CgstPercentage = parseFloat(item.CgstPercentage).toFixed(2);
                item.SgstPercentage = parseFloat(item.SgstPercentage).toFixed(2);
                item.IgstPercentage = parseFloat(item.IgstPercentage).toFixed(2);
                item.MrpPrice = parseFloat(item.MrpPrice).toFixed(2);
                item.NirPrice = parseFloat(item.NirPrice).toFixed(2);
              });
              var count = aUpdatedData.length;
              if (count === 0) {
                PropertyModel.setProperty("/Count", "Products");
              }
              else {
                PropertyModel.setProperty("/Count", "Products(" + count + ")")
              }
              that.getView().getModel("PriceModel").setData({ results: aUpdatedData });
              BusyIndicator.hide();
            }
          },
          error: function (oError) {
            var sErrorMessage = oError.responseText;
            MessageBox.error(sErrorMessage);
            BusyIndicator.hide();
          }
        });
      },
      checkduplicate: function (aUpdatedData, tbllen) {
        var duplicateFlag = false;
        for (var i = 0; i < aUpdatedData.length - 1; i++) {
          if (tbllen === 0) {
            that.getView().getModel("PriceModel").setData({ results: aUpdatedData });
          }
          else if (tbllen > 0) {
            if (MaterialCode === aUpdatedData[i].MaterialCode) {
              duplicateFlag = true;
            }
          }
        }
        if (duplicateFlag === true) {
          MessageBox.error("The Material: " + MaterialCode + " already exists");
        } else {
          that.getView().getModel("PriceModel").setData({ results: aUpdatedData });
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
      readCredit: function (login_ID) {
        BusyIndicator.show(0);
        var aFilters = new Filter("StockistId", "EQ", login_ID);
        sapModel.read("/STOCKISTCREDITDETAILSSet", {
          filters: [aFilters],
          success: function (Data, response) {
            BusyIndicator.hide();
            var model = new JSONModel(Data.results[0]);
            that.getView().setModel(model, "creditdetails");
          },
          error: function (Error) {
            BusyIndicator.hide();
            MessageBox.error(Error.responseText);
          }
        });
      },
      closeScheme: function () {
        that.schemepopup.close();
      },
     
      handleOrderType: function (oEvent) {
        // 
        // Get the selected key from ComboBox
        selectedKey = oEvent.getParameters().selectedItem.getKey();

        selectedOrderType = oEvent.getParameters().selectedItem.mProperties.key


        // Get the ComboBox control by its ID
        var oComboBox = this.byId("idType");

        // Get all ComboBox items
        var aItems = oComboBox.getItems();

        // Loop through each item and disable/enable based on the selection
        aItems.forEach(function (item) {
          var key = item.getKey();

          // Logic to enable/disable the other option based on selection
          if (selectedKey === "1" && key === "3") {
            item.setEnabled(false);  // Disable 'ORDER WITH SPECIAL RATE'
          } else if (selectedKey === "3" && key === "1") {
            item.setEnabled(false);  // Disable 'ORDER WITH SCHEME'
          } else {
            item.setEnabled(true);   // Enable the other option
          }
        });
      },

      onSelectScheme: function (oEvent) {
        // 
        selectedSchemeCode = oEvent.getSource().getSelectedItem().getBindingContext("MaterialSchemeModel").getObject().Schemecode;
        var Minimumqty = oEvent.getSource().getSelectedItem().getBindingContext("MaterialSchemeModel").getObject().Minimumqty;

        that.updaterowitem(MaterialCode, selectedSchemeCode);
        that.readPRICESet(MaterialCode, selectedSchemeCode, ShipTo, ShipFrom, Minimumqty, null, selectedOrderType);

        that.schemepopup.close();

        // for(var i =0; i<schemeData.length;i++)
        //   {
        //   var schemeCode = schemeData[i].Schemecode;
        //   }
      },


      onChangeRequestRate19: function (oEvent) {
        // ;

        // Get the array of materials from the PriceModel
        var Materials = this.getView().getModel("PriceModel").getData().results;
        var table = this.getView().byId("idTemporaryTable").getItems();

        // Get the value from the input that triggered the event
        var requestRateInput = oEvent.getSource();
        var requestRateValue = requestRateInput.getValue();

        // Format the value to always have two decimal places
        var formattedRequestRate = parseFloat(requestRateValue).toFixed(2);

        // Set the formatted value back to the input field
        requestRateInput.setValue(formattedRequestRate);

        // Iterate over the table items to update Materials array
        for (var i = 0; i < table.length; i++) {
          var requestRateCell = table[i].getCells()[5]; // Assuming it's the 6th cell

          // Only update the Material with Ordertype "3"
          if (Materials[i] && Materials[i].Ordertype === "3") {
            Materials[i].RequestRate = formattedRequestRate;
            Materials[i].Special_order = "X";
          }
        }

        // Update the model with the modified Materials array
        this.getView().getModel("PriceModel").setProperty("/results", Materials);
      },

      onChangeRequestRate: function (oEvent) {
        // ;

        // Get the array of materials from the PriceModel
        var Materials = this.getView().getModel("PriceModel").getData().results;

        // Get the value from the input that triggered the event
        var requestRateInput = oEvent.getSource();
        var requestRateValue = requestRateInput.getValue();
        if (requestRateValue === "0") {
          requestRateInput.setValue();
          requestRateInput.setValueState("Error").setValueStateText("Request Rate cannot be Zero.");
          return
        }
        else {
          requestRateInput.setValueState("None");
        }

        // Format the value to always have two decimal places
        var formattedRequestRate = parseFloat(requestRateValue).toFixed(2);

        // Set the formatted value back to the input field
        requestRateInput.setValue(formattedRequestRate);

        // Change the ValueState based on the presence of a valid value
        if (formattedRequestRate) {
          requestRateInput.setValueState("None");
        }

        // Get the binding context of the row where the event was triggered
        var bindingContext = requestRateInput.getBindingContext("PriceModel");

        // Get the path of the current row (e.g., "/results/0", "/results/1", etc.)
        var path = bindingContext.getPath();

        // Get the material object for the current row
        var currentMaterial = bindingContext.getObject();

        // Check the Ordertype and update the RequestRate for the specific material
        if (currentMaterial.Ordertype === "3") {
          currentMaterial.RequestRate = formattedRequestRate;
          currentMaterial.Special_order = "X";
        } else {
          currentMaterial.RequestRate = "0"; // Pass empty value for other Ordertypes
          currentMaterial.Special_order = "";
        }

        // Update the model with the modified material data
        this.getView().getModel("PriceModel").setProperty(path, currentMaterial);
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


      onNavigateScheme: function (oEvent) {
        // var param = {};
        var param = {};
        var oSemantic = "dashboard";
        var hash = {};
        var additionalHash = "&/Scheme"
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


      onNavigateOrderStatus: function (oEvent) {
        // var param = {};
        var param = { "OrderStatus": "OST" };
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


      // Device funtion check (Phone/Tablet/Desktop)
      checkDevice: function () {

        if (sap.ui.Device.system.phone === true) {

          PropertyModel.setProperty("/Menu", true);
          PropertyModel.setProperty("/CreditHbox", false);
          PropertyModel.setProperty("/HBox1", true);
          PropertyModel.setProperty("/HBox2", true);
          PropertyModel.setProperty("/HBox3", true);
          PropertyModel.setProperty("/HBox4", true);
          PropertyModel.setProperty("/HBOx", false);

          PropertyModel.setProperty("/ResetFirst", false);
          PropertyModel.setProperty("/ToolBar2", true);
          this.byId("orderStatusMessage").setText("1 Order type can be submitted at a time.");



        }
        else if (sap.ui.Device.system.tablet === true) {


          PropertyModel.setProperty("/Menu", true);
          PropertyModel.setProperty("/CreditHbox", true);
          PropertyModel.setProperty("/HBox1", false);
          PropertyModel.setProperty("/HBox2", false);
          PropertyModel.setProperty("/HBox3", false);
          PropertyModel.setProperty("/HBox4", false);
          PropertyModel.setProperty("/HBOx", true);


          PropertyModel.setProperty("/ResetFirst", true);
          PropertyModel.setProperty("/ToolBar2", false);

          this.byId("orderStatusMessage").setText("Only one order type request can be submitted at a time.");



        }

        else if (sap.ui.Device.system.desktop === true) {

          PropertyModel.setProperty("/Menu", false);
          PropertyModel.setProperty("/CreditHbox", true);
          PropertyModel.setProperty("/HBox1", false);
          PropertyModel.setProperty("/HBox2", false);
          PropertyModel.setProperty("/HBox3", false);
          PropertyModel.setProperty("/HBox4", false);
          PropertyModel.setProperty("/HBOx", true);

          PropertyModel.setProperty("/ResetFirst", true);
          PropertyModel.setProperty("/ToolBar2", false);

          this.byId("orderStatusMessage").setText("Only one order type request can be submitted at a time.");



        }
      }

    });
  });
