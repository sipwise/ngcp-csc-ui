
import Vue from 'vue';

export function FormDataToJSON(FormElement) {
    let formData = new FormData(FormElement);
    let ConvertedJSON= {};
    for (const [key, value] of formData.entries()) {
        ConvertedJSON[key] = value;
    }
    return ConvertedJSON
}

export function createFax(options) {
    return new Promise((resolve, reject) => {
        //let headers = {
            //'Content-Type': 'multipart/form-data',
        //};
        var formData = new FormData();
        //var blobFile = new Blob(new Uint8Array([200,201,203]));
        //formData.append('data', 'test csc fax');
        //formData.append('destination', '43993006');
        //formData.append('pageheader', 'test header');
        //formData.append('quality', 'normal');
        //formData.append('subscriber_id', 327);
        //formData.append('faxfile', blobFile, 'fax.pdf');
        formData.append('faxfile', options.file, 'fax.txt');
        //Vue.http.post('api/faxes/', formData, { headers: headers}).then(() => {
        Vue.http.post('api/faxes/', formData).then(() => {
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}

export function createFaxOriginal(options, subscriberId) {
    return new Promise((resolve, reject) => {
        let headers = {
            'Content-Type': 'application/json',
        };
        let mergedParams = Object.assign(options, subscriberId);
        let payload = JSON.stringify(mergedParams);
        Vue.http.post('api/faxes/', payload, { headers: headers }).then(() => {
            resolve();
        }).catch((err)=>{
            reject(err);
        });
    });
}
