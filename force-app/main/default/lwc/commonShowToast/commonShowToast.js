import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const toast = (that, title, message, variant) => {
    that.dispatchEvent(
        new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: "dismissable"
        })
    );
};

export const ShowToast = {
    /** Warning Validations */

    showWarningRequiredField: (that, fieldName = "") => {
        toast(that, "Warning: Required Field", "Please fill in required fields" + (fieldName === '' ? '' : ': ' + fieldName), "warning"); // prettier-ignore
    },

    showWarningAtLeastOne: (that, fieldName = "") => {
        toast(that, "Warning: Invalid Quantity", "Please enter at least one" + (fieldName === '' ? '' : ': ' + fieldName), "warning"); // prettier-ignore
    },

    showWarningSelectOnlyOne: (that) => {
        toast(that, "Selection Warning", "Please select only one record.", "warning");
    },

    showWarningNoSelection: (that) => {
        toast(that, "Warning: No Selection", "Please select at least one record.", "warning");
    },

    showWarningInvalidSelection: (that, condition = "") => {
        toast(that, "Warning: No Selection", "Selection is not allowed for this condition" + (condition === '' ? '' : ': ' + condition), "warning"); // prettier-ignore
    },

    showWarningDuplicate: (that, fieldName = "") => {
        toast(that, "Warning: Duplicate Value", "This value already exists : " + fieldName, "warning");
    },

    showWarningStatus: (that, fieldName = "") => {
        toast(that, "Warning: Invalid Status", "This action is only allowed when the status is " + fieldName, "warning");
    },

    showWarning: (that, message = "") => {
        toast(that, "Warning", message, "warning");
    },

    /** Errors */

    showError: (that, message) => {
        toast(that, "Error", message, "error");
    },


    showInternalError: (that, error = null) => {
        toast(that, "Error: Internal Error", "" + (error === null ? "" : ": " + error.body.message), "error");
    },

    showPdfError: (that, error = null) => {
        toast(that, "Error: PDF Error", "" + (error === null ? "" : ": " + error.body.message), "error");
    },

    showApiError: (that, error = null) => {
        console.log("showapiError");
        toast(that, "Error: API Failed", "" + (error == null ? '' : ': ' + error.body.message), "error"); // prettier-ignore
    },

    showErrorSave: (that, error = null) => {
        toast(that, "Error: Save Failed", "" + (error == null? '' : ': ' + error.body.message) , "error"); // prettier-ignore
    },

    showErrorDelete: (that, error = null) => {
        toast(that, "Error: Delete Failed", "" + (error == null ? '' : ': ' +error.body. message) , "error"); // prettier-ignore
    },

    /** Success */

    showSuccess: (that, message) => {
        toast(that, "Success", message, "success");
    },

    showSuccessSave: (that, message = "") => {
        toast(that, "Success: Saved", "Data has been saved Successfuly" +  (message === '' ? '' : ': ' + message) , "success"); // prettier-ignore
    },

    showSuccessDelete: (that, message = "") => {
        toast(that, "Success: Deleted", "Data has been deleted Successfuly" +  (message === '' ? '' : ': ' + message), "success"); // prettier-ignore
    },

    showApiSuccess: (that, message = "") => {
        toast(that, "Success: API Called", "Your API request has been successfully processed" + (message === '' ? '' : ': ' + message), "success"); //prettier-ignore
    },

    /** Info */

    showInfo: (that, message) => {
        toast(that, "Info", message, "info");
    }
};