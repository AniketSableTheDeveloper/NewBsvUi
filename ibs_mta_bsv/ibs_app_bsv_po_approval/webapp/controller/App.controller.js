sap.ui.define(
  [
      "sap/ui/core/mvc/Controller",
      "sap/ui/model/json/JSONModel"
  ],
  function(BaseController,JSONModel) {
    "use strict";
    var that;

    return BaseController.extend("com.ibs.bsv.ibsappbsvpoapproval.controller.App", {
      onInit: function() {

        that = this;
        var oViewModel = new JSONModel({
          layout: "OneColumn",
          previousLayout: "",
          actionButtonsInfo: {
            midColumn: {
              fullScreen: false
            }
          }
        });
        this.getView().setModel(oViewModel, "appView");
      }
    });
  }
);


// sap.ui.define(
//     [
//         "sap/ui/core/mvc/Controller"
//     ],
//     function(BaseController) {
//       "use strict";
  
//       return BaseController.extend("com.ibs.bsv.ibsappbsvprapproval.controller.App", {
//         onInit: function() {
//         }
//       });
//     }
//   );
  


// sap.ui.define(
//     [
//         "sap/ui/core/mvc/Controller"
//     ],
//     function(BaseController) {
//       "use strict";
  
//       return BaseController.extend("com.ibs.bsv.ibsappbsvpoapproval.controller.App", {
//         onInit: function() {
//         }
//       });
//     }
//   );
  