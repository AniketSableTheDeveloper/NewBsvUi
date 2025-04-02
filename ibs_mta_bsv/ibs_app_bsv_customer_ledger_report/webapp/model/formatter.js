
sap.ui.define([], function () {
	"use strict";
return {

    formatDate: function (oDate) {
        if (oDate !== "" && oDate !== null && oDate !== undefined) {
            var DateInstance = new Date(oDate);
            var date = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd.MM.yyyy"
            });

            return date.format(DateInstance);
        }
        return "NA";
    },
    formatterAmount: function (num) {
			
        var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
            pattern: "#,##,##0.00"
        });
        return oNumberFormat.format(num);
        // num = parseInt(num,10).toFixed(2);
        // return String(num);

    }
    }}
)